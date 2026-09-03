import re
with open("backend/agentveto/contracts/schemas.py", "r") as f:
    content = f.read()

validator = """class ScanResult(BaseModel):
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    status: ScanStatus
    verdict: Optional[SecurityVerdict] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    project_manifest: Optional[ProjectManifest] = None
    threat_model: Optional[ThreatModel] = None
    attack_plan: Optional[AttackPlan] = None
    attack_payload: Optional[AttackPayload] = None
    trajectory: Optional[TrajectoryData] = None
    state_diff: Optional[StateDiff] = None
    evaluation: Optional["EvaluationResult"] = None
    evidence: Optional[Evidence] = None

    @model_validator(mode='after')
    def validate_verdict(self):
        if self.status != ScanStatus.COMPLETED and self.verdict is not None:
            self.verdict = None
        return self
"""

content = re.sub(r'class ScanResult\(BaseModel\):.*?evidence: Optional\[Evidence\] = None\n', validator, content, flags=re.DOTALL)

with open("backend/agentveto/contracts/schemas.py", "w") as f:
    f.write(content)
