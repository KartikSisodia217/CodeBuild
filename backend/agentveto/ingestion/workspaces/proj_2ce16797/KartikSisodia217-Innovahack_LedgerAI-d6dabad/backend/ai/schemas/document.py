from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class DocumentOutput(BaseModel):
    document_type: str = Field(description="The classified type of the document (e.g., Invoice, Contract, Bank Statement).")
    extracted_entities: Dict[str, Any] = Field(default_factory=dict, description="Key entities extracted from the document (e.g., vendor, dates, totals).")
    summary: str = Field(description="A brief summary of the document's contents.")
