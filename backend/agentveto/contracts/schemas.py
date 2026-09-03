"""
AgentVeto Interface Contracts — Pydantic Schemas

These schemas define the single canonical data contracts between all AgentVeto subsystems.
"""
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, model_validator
from datetime import datetime, timezone
import uuid

# ─── 1. Canonical Scan & Project Lifecycle Enums ─────────────────────────────

class ScanStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    ANALYZING = "ANALYZING"
    NOT_AGENTIC = "NOT_AGENTIC"
    UNSUPPORTED = "UNSUPPORTED"
    UNSUPPORTED_ENTRYPOINT = "UNSUPPORTED_ENTRYPOINT"
    EXECUTING = "EXECUTING"
    EXECUTION_FAILED = "EXECUTION_FAILED"
    EXECUTION_UNAVAILABLE = "EXECUTION_UNAVAILABLE"
    COMPLETED = "COMPLETED"

class SecurityVerdict(str, Enum):
    PASS = "PASS"
    VETO = "VETO"

class SpanKind(str, Enum):
    AGENT = "AGENT"
    TOOL = "TOOL"
    LLM = "LLM"
    CHAIN = "CHAIN"
    SANDBOX = "SANDBOX"
    STATE_CHANGE = "STATE_CHANGE"
    POLICY = "POLICY"

class ToolCapability(str, Enum):
    DATA_SOURCE = "DATA_SOURCE"
    SINK = "SINK"
    DUAL = "DUAL"
    NEUTRAL = "NEUTRAL"

# ─── 2. Ingestion & Discovery ────────────────────────────────────────────────

class ProjectWorkspace(BaseModel):
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}")
    source_type: str = Field(..., description="zip, github, or controlled")
    repository: Optional[str] = None
    revision: Optional[str] = None
    workspace_path: str = Field(..., description="Path to extracted directory")

class ToolCandidate(BaseModel):
    name: str
    source_file: str
    schema_hint: Optional[Dict[str, Any]] = None
    line_number: Optional[int] = None

class AgentCandidate(BaseModel):
    name: str
    file: str
    entry_point: Optional[str] = None
    integration: str
    tools: List[ToolCandidate] = Field(default_factory=list)

class ProjectManifest(BaseModel):
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}")
    project_name: str = "Unknown Project"
    language: str = "python"
    frameworks: List[str] = Field(default_factory=list)
    agentic_signals: List[str] = Field(default_factory=list)
    detected_tools: List[ToolCandidate] = Field(default_factory=list)
    data_sources: List[str] = Field(default_factory=list)
    data_sinks: List[str] = Field(default_factory=list)
    agentveto_integration: Optional[str] = None
    supported_adapter: Optional[str] = None
    explicit_configuration: Optional[Dict[str, Any]] = None
    entrypoint: Optional[str] = None
    agents: List[AgentCandidate] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    agentic: bool = False
    supported: bool = False
    integration_type: str = ""
    source_type: str = "zip"
    repository: Optional[str] = None
    revision: Optional[str] = None

# ─── 3. Scan & Execution ─────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    project_id: Optional[str] = None
    github_url: Optional[str] = None
    scenario_id: Optional[str] = None

class ToolSchema(BaseModel):
    name: str
    description: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)
    required: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class InterceptedCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    context: Optional[Dict[str, Any]] = None
    tool_schema: Optional[ToolSchema] = None
    timestamp: Optional[datetime] = None

class StateDiff(BaseModel):
    run_id: Optional[str] = None
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    diff_keys: List[str] = Field(default_factory=list)
    unauthorized_changes: List[str] = Field(default_factory=list)
    has_changes: bool = False
    state_mutated: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __init__(self, **data):
        if "has_changes" in data and "state_mutated" not in data:
            data["state_mutated"] = data["has_changes"]
        if "state_mutated" in data and "has_changes" not in data:
            data["has_changes"] = data["state_mutated"]
        super().__init__(**data)



class ExecutionResult(BaseModel):
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    status: ScanStatus
    error_message: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    trajectory: Optional['TrajectoryData'] = None
    state_before: Optional[Dict[str, Any]] = None
    state_after: Optional[Dict[str, Any]] = None
    state_diff: Optional[StateDiff] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

# ─── 4. Threat Model & Adversarial Engine ────────────────────────────────────

class ASIVector(BaseModel):
    tool_name: str
    vector: str
    capability: ToolCapability = ToolCapability.NEUTRAL
    confidence: float = 1.0
    description: str = ""

    @property
    def tool(self):
        return self.tool_name


class ThreatModel(BaseModel):
    vulnerable_tools: List[ASIVector] = Field(default_factory=list)
    risk_vectors: List[str] = Field(default_factory=list)
    source_tools: List[str] = Field(default_factory=list)
    sink_tools: List[str] = Field(default_factory=list)
    has_source_sink_pair: bool = False
    overall_risk: str = "LOW"

class AttackPlan(BaseModel):
    target_tool: str
    vector: str
    attack_strategy: str
    injection_point: str = "tool_response"
    success_condition: str = ""
    attack_objective: str = ""
    source_tool: Optional[str] = None
    sink_tool: Optional[str] = None
    contextual_constraints: Dict[str, Any] = Field(default_factory=dict)

class AttackPayload(BaseModel):
    payload_content: str
    target_node: Optional[str] = None
    target_tool: str = ""
    attack_vector: str = "ASI01"
    content_type: str = "indirect_prompt_injection"
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def payload(self):
        return self.payload_content



class MockResponse(BaseModel):
    status_code: int = 200
    response_body: str = ""
    data: Optional[Dict[str, Any]] = None
    tool_name: str = ""
    is_poisoned: bool = False
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")

# ─── 5. Trace & Evidence ─────────────────────────────────────────────────────

class OpenInferenceSpan(BaseModel):
    span_id: str = Field(default_factory=lambda: f"span_{uuid.uuid4().hex[:8]}")
    parent_id: Optional[str] = None
    span_kind: Optional[str] = None
    kind: SpanKind = SpanKind.TOOL
    name: str = ""
    attributes: Dict[str, Any] = Field(default_factory=dict)
    status: str = "OK"
    start_time: Optional[Union[datetime, str]] = None
    end_time: Optional[Union[datetime, str]] = None
    events: List[Dict[str, Any]] = Field(default_factory=list)
    
    input_value: Optional[Any] = None
    output_value: Optional[Any] = None
    tool_name: Optional[str] = None
    tool_parameters: Optional[Dict[str, Any]] = None
    llm_prompt: Optional[str] = None
    llm_response: Optional[str] = None
    llm_model: Optional[str] = None
    is_tainted: bool = False
    is_injection_source: bool = False
    is_unauthorized_sink: bool = False
    threat_category: Optional[str] = None

class TrajectoryData(BaseModel):
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    agent_name: str = "TargetAgent"
    system_prompt: Optional[str] = None
    user_prompt: str = ""
    spans: List[OpenInferenceSpan] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    span_kind: Optional[str] = ""
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class DAGNodeData(BaseModel):
    label: str
    kind: Optional[SpanKind] = None
    name: str
    status: str
    is_injection_source: bool = False
    is_unauthorized_sink: bool = False
    is_vetoed: bool = False
    inputs: Optional[Any] = None
    outputs: Optional[Any] = None
    threat_category: Optional[str] = None
    span_id: str
    details: Dict[str, Any] = Field(default_factory=dict)

class EvidenceDAGNode(BaseModel):
    id: str
    type: str = "custom"
    data: DAGNodeData
    position: Dict[str, float]

class EvidenceDAGEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False
    style: Optional[Dict[str, Any]] = None
    label: Optional[str] = None

class Evidence(BaseModel):
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    evaluation: Optional["EvaluationResult"] = None
    agent_name: str = ""
    nodes: List[EvidenceDAGNode] = Field(default_factory=list)
    edges: List[EvidenceDAGEdge] = Field(default_factory=list)
    summary: str = ""
    veto_count: int = 0
    warning_count: int = 0

class PolicyRule(BaseModel):
    rule_id: str
    name: str
    sink_tool: str
    description: str
    requires_authorization: bool = True
    severity: str = "CRITICAL_VETO"
    threat_category: Optional[str] = None
    condition_expression: Optional[str] = None

# ─── 6. Evaluation Result & Scan Result ──────────────────────────────────────

class EvaluationResult(BaseModel):
    evaluation_id: str = Field(default_factory=lambda: f"eval_{uuid.uuid4().hex[:8]}")
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    status: Optional[SecurityVerdict] = None
    violating_span_id: Optional[str] = None
    violating_tool: Optional[str] = None
    injection_source_span_id: Optional[str] = None
    rule_name: Optional[str] = None
    reason: str = ""
    threat_category: Optional[str] = None
    state_diff: Optional[StateDiff] = None
    latency_ms: float = 0.0
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Dict[str, Any] = Field(default_factory=dict)

class ScanResult(BaseModel):
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

ExecutionResult.model_rebuild()

# ─── 7. Regression Testing Contracts (Preserved) ─────────────────────────────
class AttackVectorSpec(BaseModel):
    poisoned_source_tool: str
    payload: str
    target_sink_tool: str
    threat_category: str

class ExpectedAdjudicationSpec(BaseModel):
    verdict: SecurityVerdict
    violation_rule: str
    state_invariant: Dict[str, Any] = Field(default_factory=dict)

class RegressionTestSpec(BaseModel):
    version: str = "agentveto/v1"
    test_id: str
    name: str
    target_agent: str
    threat_category: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    span_kind: Optional[str] = ""
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)
    setup: Dict[str, Any] = Field(default_factory=dict)
    attack_vector: AttackVectorSpec
    expected_adjudication: ExpectedAdjudicationSpec

class RegressionTest(RegressionTestSpec):
    pass
