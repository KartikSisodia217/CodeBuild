import json
import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse

from backend.schemas.api import UploadResponse, HITLResolveRequest, HITLResolveResponse
from backend.ai.workflows.graph import WorkflowOrchestrator
from backend.observability.logger import logger
from backend.services.ocr import OCRService
from backend.database.session import get_db
from backend.services.db_crud import LedgerRepository
from backend.auth.jwt import get_current_user
from backend.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
import asyncio
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

router = APIRouter()
orchestrator = WorkflowOrchestrator()

from fastapi import Form

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ingests a document, extracts text via OCR, and starts the LangGraph pipeline in the background."""
    task_id = str(uuid.uuid4())
    logger.info(f"Starting task {task_id} for file {file.filename} by user {current_user.email}")
    
    ocr_service = OCRService()
    repo = LedgerRepository(db)
    
    # 1. Save File to Storage
    file_path = await ocr_service.save_file(file)
    
    # 2. Get active company (assuming first one for MVP)
    companies = await repo.get_companies_by_user(current_user.id)
    if not companies:
        raise HTTPException(status_code=400, detail="No active company found for user.")
    company_id = companies[0].id
    
    # 3. Create Document Record
    doc = await repo.create_document(
        company_id=company_id, 
        file_name=file.filename, 
        s3_url=file_path
    )
    
    # 4. Extract Text
    try:
        raw_text, ocr_quality = await ocr_service.extract_text(file_path)
    except Exception as e:
        logger.error(f"OCR Extraction failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
        
    # Phase 6: Detect Document Type & Analyze if Bank Statement
    from backend.ai.analysis.document_classifier import DocumentClassifier
    classification = DocumentClassifier.classify(raw_text)
    doc_type = classification.document_type
    
    status = "OCR_COMPLETE"
    if ocr_quality < 40.0:
        status = "OCR_LOW_QUALITY"
        
    analysis_data = None
    if doc_type == "Bank Statement":
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            analysis, _ = BankStatementAnalyzer.from_text(raw_text)
            if analysis.transaction_count > 0:
                analysis_data = analysis.to_summary_dict()
        except Exception as e:
            logger.error(f"Bank Statement Analysis failed: {e}")
            
    doc.raw_text = raw_text
    doc.status = status
    doc.document_type = doc_type
    doc.ocr_quality_score = ocr_quality
    doc.analysis_data = analysis_data
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    
    # 5. Ingest into Vector Store for chat retrieval
    from backend.ai.rag.ingestion import ingestion_pipeline
    metadata = {
        "document_id": str(doc.id), 
        "file_name": file.filename,
        "conversation_id": "global"
    }
    await ingestion_pipeline.ingest_document(raw_text, metadata)
    
    # 6. Create Transaction Record
    txn = await repo.create_transaction(company_id, doc.id)
    
    # 7. Trigger LangGraph Workflow
    from backend.ai.workflows.graph import run_workflow
    background_tasks.add_task(run_workflow, raw_text, str(txn.id))
    
    return UploadResponse(
        task_id=str(txn.id), 
        message="Document ingested successfully. Pipeline started.",
        document_id=str(doc.id),
        document_type=doc_type,
        ocr_quality_score=ocr_quality,
        analysis_available=analysis_data is not None
    )

@router.get("/dashboard/transactions")
async def get_dashboard_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches all transactions for the current user's primary company for the dashboard."""
    repo = LedgerRepository(db)
    companies = await repo.get_companies_by_user(current_user.id)
    if not companies:
        return {"transactions": []}
    
    txns = await repo.get_transactions_by_company(companies[0].id)
    return {"transactions": jsonable_encoder(txns)}

@router.get("/dashboard/transactions/{txn_id}")
async def get_transaction_details(
    txn_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches detailed breakdown for a single transaction including audit logs."""
    import uuid
    repo = LedgerRepository(db)
    try:
        txn_uuid = uuid.UUID(txn_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Transaction ID format")
        
    txn = await repo.get_transaction(txn_uuid)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    return {"transaction": jsonable_encoder(txn)}

@router.get("/stream/execution/{task_id}")
async def stream_execution(task_id: str):
    """Streams SSE updates from the LangGraph execution for the Glass Box UI."""
    from backend.ai.workflows.graph import WorkflowOrchestrator
    
    async def event_generator():
        orchestrator = WorkflowOrchestrator()
        app = await orchestrator.compile()
        config = {"configurable": {"thread_id": task_id}}
        
        last_step = None
        while True:
            state = await app.aget_state(config)
            if not state or not state.values:
                await asyncio.sleep(1)
                continue
                
            current_step = state.next
            if current_step != last_step:
                bb = state.values.get("blackboard")
                safe_state = {}
                if hasattr(bb, "model_dump"):
                    safe_state = bb.model_dump(
                        mode="json",
                        include={"transaction_id", "human_input_required", "error_count", "routing_decision"}
                    )
                
                payload = {
                    "task_id": task_id,
                    "status": "processing" if current_step else "completed",
                    "next_nodes": current_step,
                    "state": safe_state
                }
                yield f"data: {json.dumps(payload)}\n\n"
                last_step = current_step
                
            if not current_step:
                break
            
            await asyncio.sleep(1)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/hitl/resolve", response_model=HITLResolveResponse)
async def resolve_hitl(
    request: HITLResolveRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Resumes a paused LangGraph execution with user-provided data."""
    logger.info(f"Resuming task {request.task_id} with data: {request.provided_data}")
    
    from backend.ai.workflows.graph import WorkflowOrchestrator
    
    orchestrator = WorkflowOrchestrator()
    app = await orchestrator.compile()
    config = {"configurable": {"thread_id": request.task_id}}
    
    # 1. Update the state with the user's provided data
    # We simulate passing the LUT data into the GST context and clearing the human_input_required flag.
    # Note: State update must match the reducer logic or direct node update format.
    await app.aupdate_state(
        config, 
        {"blackboard": {"human_input_required": False, "error_count": 0}} # Reset flags
    )
    
    # 2. Trigger the graph to resume in the background
    background_tasks.add_task(app.ainvoke, None, config=config)
    
    return HITLResolveResponse(status="Graph resumed successfully")

from backend.schemas.api import UploadResponse, HITLResolveRequest, HITLResolveResponse, ChatRequest

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Answers user queries by orchestrating specialized AI agents based on intent."""
    from backend.ai.orchestrator.executor import WorkflowExecutor
    
    executor = WorkflowExecutor(db)
    
    response = await executor.execute(request.query, current_user.id, request.history)
    
    return response



# Phase 6: Document Analysis Endpoints
@router.get("/analysis/{document_id}")
async def get_document_analysis(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = LedgerRepository(db)
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    doc = await repo.get_document(doc_uuid)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not doc.analysis_data:
        raise HTTPException(status_code=404, detail="No structured analysis available for this document")
        
    # Re-run health and insight engines on the fly from the raw text for fresh insights
    # (or we could store them in analysis_data too)
    from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
    from backend.ai.analysis.financial_health import FinancialHealthEngine
    from backend.ai.analysis.insight_engine import InsightEngine
    from backend.ai.analysis.merchant_intelligence import MerchantIntelligence
    from backend.ai.analysis.transaction_classifier import TransactionClassifier
    
    analysis, transactions = BankStatementAnalyzer.from_text(doc.raw_text)
    health = FinancialHealthEngine.analyze(analysis)
    insights = InsightEngine.generate(analysis, health)
    merchants = MerchantIntelligence.analyze(transactions)
    
    return {
        "analysis": analysis.to_summary_dict(),
        "health": health.to_dict(),
        "insights": [i.to_dict() for i in insights],
        "merchant_analysis": merchants.to_dict()
    }

@router.get("/analysis/{document_id}/insights")
async def get_document_insights(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = LedgerRepository(db)
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    doc = await repo.get_document(doc_uuid)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.document_type != "Bank Statement":
        raise HTTPException(status_code=400, detail="Insights only available for bank statements")
        
    from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
    from backend.ai.analysis.financial_health import FinancialHealthEngine
    from backend.ai.analysis.insight_engine import InsightEngine
    
    analysis, _ = BankStatementAnalyzer.from_text(doc.raw_text)
    health = FinancialHealthEngine.analyze(analysis)
    insights = InsightEngine.generate(analysis, health)
    
    return {"insights": [i.to_dict() for i in insights]}

@router.get("/analysis/{document_id}/transactions")
async def get_document_transactions(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = LedgerRepository(db)
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    doc = await repo.get_document(doc_uuid)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
    from backend.ai.analysis.transaction_classifier import TransactionClassifier
    
    analysis, transactions = BankStatementAnalyzer.from_text(doc.raw_text)
    
    if not transactions:
        return {"transactions": []}
        
    txn_dicts = [
        {"date": str(t.date), "description": t.description, "amount": t.amount, "txn_type": t.txn_type}
        for t in transactions
    ]
    classified = TransactionClassifier.classify_batch(txn_dicts)
    
    return {"transactions": [c.to_dict() for c in classified]}

