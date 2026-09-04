import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import time

from backend.ai.orchestrator.classifier import IntentClassifier
from backend.ai.orchestrator.dispatcher import AgentDispatcher
from backend.ai.orchestrator.synthesizer import ResponseSynthesizer
from backend.ai.rag.retriever import Retriever
from backend.services.db_crud import LedgerRepository
from backend.ai.agents.registry import AgentRegistry

logger = logging.getLogger(__name__)

class WorkflowExecutor:
    """
    Main entry point for the /chat endpoint.
    Coordinates Classification -> Retrieval -> Dispatch -> Synthesis.
    """
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = LedgerRepository(db)
        self.classifier = IntentClassifier()
        self.dispatcher = AgentDispatcher()
        self.synthesizer = ResponseSynthesizer()
        self.retriever = Retriever(k=3)

    async def _get_context(self, user_id: uuid.UUID, retrieval_type: str, query: str, history: list = None) -> str:
        """Context-aware retrieval based on Intent."""
        companies = await self.repo.get_companies_by_user(user_id)
        if not companies:
            return "No active company found."
            
        company_id = companies[0].id
        context_parts = []
        
        if retrieval_type in ['documents', 'both']:
            # Retrieve from knowledge base (RAG)
            filter_dict = {}
            docs = await self.retriever.retrieve(query, filter_dict=filter_dict)
            if docs:
                rag_text = "\n".join([d.page_content for d in docs])
                context_parts.append(f"[Uploaded Documents Context]\n{rag_text}")
                
        if retrieval_type in ['ledger', 'both']:
            txns = await self.repo.get_transactions_by_company(company_id)
            if txns:
                txns_json = json.dumps([
                    {
                        "id": str(t.id),
                        "status": t.status,
                        "debits": t.debits,
                        "credits": t.credits,
                        "insights": t.insights
                    } for t in txns[:5]
                ], default=str)
                context_parts.append(f"[Recent Ledger Transactions]\n{txns_json}")
                
        if history:
            history_lines = []
            # We assume history is a list of dicts like [{"sender": "user", "text": "..."}, ...]
            # or [{"role": "user", "content": "..."}, ...] depending on the frontend schema.
            # Using basic heuristic since frontend currently sends `{query, history}`.
            for msg in history[-5:]:
                role = msg.get("sender") or msg.get("role", "unknown")
                content = msg.get("text") or msg.get("content", "")
                history_lines.append(f"{role}: {content}")
            history_str = "\n".join(history_lines)
            context_parts.append(f"[Recent Chat History]\n{history_str}")
                
        return "\n\n".join(context_parts) if context_parts else "No specific context available."

    async def execute(self, query: str, user_id: uuid.UUID, history: list = None) -> Dict[str, Any]:
        try:
            # 1. Intent Classification
            logger.info(f"Classifying intent for query: {query}")
            intent_data = await self.classifier.classify(query)
            logger.info(f"Intent classified: {intent_data.intent} (Confidence: {intent_data.confidence})")
            
            # 2. Context Retrieval (if needed)
            context = ""
            if intent_data.requires_retrieval and intent_data.retrieval_type:
                logger.info(f"Retrieving context of type: {intent_data.retrieval_type}")
                context = await self._get_context(user_id, intent_data.retrieval_type, query, history)
            
            specialists = intent_data.required_specialists
            if not specialists:
                specialists = ["general"]
                
            # 3. Agent Dispatch
            logger.info(f"Dispatching to agents: {specialists}")
            # The dispatcher returns an ExecutionReport object
            dispatch_report = await self.dispatcher.dispatch(query, context, specialists)
            
            # Build Glass Box metadata
            glass_box_metadata = []
            
            # Add Intent Classifier to Glass Box
            glass_box_metadata.append({
                "agent": "Intent Classifier",
                "action": f"Classified intent as {intent_data.intent}",
                "status": "success",
                "colorClass": "bg-blue-600",
                "execution_time": 0.0,
                "confidence": intent_data.confidence,
                "tool_calls": [],
                "warnings": []
            })
            
            # Add agents to Glass Box
            for internal_name, res in dispatch_report.execution_graph.items():
                meta = AgentRegistry.get_metadata(internal_name)
                color = meta.color_class if meta else "bg-gray-400"
                
                status_str = "success" if res.status.value == "COMPLETED" else "error" if res.status.value == "FAILED" else "skipped"
                action_msg = f"Analyzed using {len(res.tools_invoked)} tools" if status_str == "success" else f"{res.status.value}: {res.error_message or res.skip_reason}"
                
                overall_conf = res.confidence.overall if res.confidence else 0.0
                # Format confidence for display: handle both numeric and qualitative values
                if isinstance(overall_conf, float):
                    conf_display = f"{overall_conf * 100:.0f}%" if overall_conf <= 1.0 else f"{overall_conf:.0f}%"
                else:
                    conf_display = str(overall_conf)
                
                glass_box_metadata.append({
                    "agent": res.agent_name,
                    "action": action_msg,
                    "status": status_str,
                    "colorClass": color,
                    "execution_time": res.execution_time_ms,
                    "confidence": conf_display,
                    "tool_calls": [t.model_dump() for t in res.tools_invoked],
                    "warnings": res.warnings
                })
            
            # 4. Synthesize Final Response
            logger.info("Synthesizing final response")
            final_report = await self.synthesizer.synthesize(query=query, report=dispatch_report)
            
            # Structure final dict for API
            final_response = final_report.synthesis_result or {}
            final_response["agentsCollaborated"] = glass_box_metadata
            final_response["execution_report"] = final_report.model_dump() # For developers/debugging
            
            return final_response
            
        except Exception as e:
            logger.error(f"Error in WorkflowExecutor: {e}", exc_info=True)
            return {
                "text": "A validation module encountered a parsing issue while coordinating the analysis. Please try again.",
                "chartData": [],
                "agentsCollaborated": [
                    {"agent": "System", "action": "Execution Error", "status": "error", "colorClass": "bg-red-500"}
                ]
            }
