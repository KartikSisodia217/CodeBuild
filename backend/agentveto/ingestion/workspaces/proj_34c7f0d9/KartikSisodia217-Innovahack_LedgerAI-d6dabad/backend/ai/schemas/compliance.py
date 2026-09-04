from pydantic import BaseModel, Field

class ComplianceOutput(BaseModel):
    is_duplicate: bool = Field(default=False, description="Whether the invoice appears to be a duplicate based on historical vectors.")
    risk_score: float = Field(default=0.0, description="Risk score from 0.0 (safe) to 1.0 (high risk).")
    suspicious_flags: list[str] = Field(default_factory=list, description="List of suspicious anomalies detected.")
