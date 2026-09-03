from typing import List, Optional
from pydantic import BaseModel, Field

class LegalRisk(BaseModel):
    clause: str = Field(description="The specific clause or section identified.")
    risk_level: str = Field(description="Risk level: Low, Medium, High.")
    explanation: str = Field(description="Explanation of the legal risk.")

class LegalOutput(BaseModel):
    summary: str = Field(description="A concise summary of the legal document or contract.")
    identified_risks: List[LegalRisk] = Field(default_factory=list, description="List of identified legal risks or important obligations.")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations based on the legal review.")
