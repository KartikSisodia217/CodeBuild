from typing import Optional, List
from pydantic import BaseModel, Field

class AuditOutput(BaseModel):
    approved: bool = Field(default=False, description="True if the ledger entry and tax rules are mathematically and logically sound.")
    reason: Optional[str] = Field(default=None, description="Reasoning for approval or rejection.")
    missing_info: List[str] = Field(default_factory=list, description="Specific missing fields or documents (e.g., 'LUT number').")
    requires_hitl: bool = Field(default=False, description="True if the issue requires Human-in-the-Loop intervention.")
