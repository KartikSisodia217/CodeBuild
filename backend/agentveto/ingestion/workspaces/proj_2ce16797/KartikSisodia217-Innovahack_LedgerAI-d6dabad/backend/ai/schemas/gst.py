from typing import List, Optional
from pydantic import BaseModel, Field

class GSTOutput(BaseModel):
    is_sez: bool = Field(default=False, description="Whether the vendor is a Special Economic Zone (SEZ) entity.")
    lut_present: bool = Field(default=False, description="Whether a Letter of Undertaking (LUT) is present or verified.")
    tax_type: Optional[str] = Field(default=None, description="Type of tax applied (e.g., IGST, CGST, SGST).")
    citations: List[str] = Field(default_factory=list, description="Citations from the RAG pipeline supporting the tax decision.")
    flag_for_review: bool = Field(default=False, description="Flag indicating if a compliance manual review is required.")
