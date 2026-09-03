from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UploadResponse(BaseModel):
    task_id: str = Field(description="Unique task identifier for LangGraph tracking.")
    message: str = Field(description="Status message.")
    document_id: Optional[str] = Field(default=None, description="The ID of the uploaded document.")
    document_type: Optional[str] = Field(default=None, description="Detected document type (Phase 6).")
    ocr_quality_score: Optional[float] = Field(default=None, description="OCR quality 0-100 (Phase 6).")
    analysis_available: bool = Field(default=False, description="True if structured analysis was immediately available.")

class HITLResolveRequest(BaseModel):
    task_id: str = Field(description="The UUID of the paused task.")
    provided_data: str = Field(description="The missing data provided by the user (e.g., LUT number).")

class HITLResolveResponse(BaseModel):
    status: str = Field(description="Status of graph resumption.")

class ChatRequest(BaseModel):
    query: str
    history: List[Dict[str, Any]] = Field(default_factory=list, description="List of previous messages in the conversation for LLM context.")

# Phase 6 Schemas
class BankStatementAnalysisResponse(BaseModel):
    analysis: Dict[str, Any]
    health: Dict[str, Any]
    insights: List[Dict[str, Any]]
    merchant_analysis: Dict[str, Any]

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
