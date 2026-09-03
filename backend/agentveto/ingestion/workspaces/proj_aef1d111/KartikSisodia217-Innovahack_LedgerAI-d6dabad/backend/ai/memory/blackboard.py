from typing import Optional, List
from pydantic import BaseModel, Field

from backend.ai.schemas.ledger import AccountingOutput
from backend.ai.schemas.gst import GSTOutput
from backend.ai.schemas.compliance import ComplianceOutput
from backend.ai.schemas.audit import AuditOutput
from backend.ai.schemas.financial import AnalystOutput

class BlackboardState(BaseModel):
    """
    The central state object (Blackboard) passed between LangGraph nodes.
    It encapsulates all agent outputs and workflow metadata.
    """
    transaction_id: str = Field(description="Unique identifier for the transaction.")
    schema_version: str = Field(default="1.0.0", description="Version of the Blackboard schema for forward compatibility.")
    
    # Raw input data
    raw_text: str = Field(default="", description="The raw OCR text from the invoice or receipt.")
    
    # Agent Output Blocks
    accounting_draft: Optional[AccountingOutput] = Field(default=None, description="Output from the Accounting Agent.")
    gst_context: Optional[GSTOutput] = Field(default=None, description="Output from the GST Agent.")
    compliance_context: Optional[ComplianceOutput] = Field(default=None, description="Output from the Compliance Agent.")
    audit_status: Optional[AuditOutput] = Field(default=None, description="Output from the Audit Agent.")
    analyst_insights: Optional[AnalystOutput] = Field(default=None, description="Output from the Financial Analyst Agent.")
    
    # Orchestration State
    human_input_required: bool = Field(default=False, description="Flag indicating the workflow is paused for HITL.")
    error_count: int = Field(default=0, description="Tracks iterations in the Disagree-or-Commit cycle.")
    routing_decision: Optional[str] = Field(default=None, description="Next node to route to.")
    
    class Config:
        validate_assignment = True
