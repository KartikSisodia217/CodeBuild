"""
Shared Contracts (Pydantic Models) - Single Source of Truth
Defines all shared data contracts across all 4 Members:
- Member 1 (Adversarial ML Lead): ThreatModel, ASIVector, AttackPlan, AttackPayload, ToolSchema
- Member 2 (Interception & Trace Engineer): InterceptedCall, TrajectoryData, OpenInferenceSpan
- Member 3 (Generative Sandbox Engineer): MockRequest, MockResponse, StateDiff, SandboxState
- Member 4 (Policy & Evidence Engineer): PolicyRule, EvaluationResult, EvaluationStatus, EvidenceDAG, RegressionTest
"""

import uuid
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field


# ==========================================
# Enums
# ==========================================

class SpanKind(str, Enum):
    AGENT = "AGENT"
    TOOL = "TOOL"
    LLM = "LLM"
    CHAIN = "CHAIN"


class EvaluationStatus(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    CRITICAL_VETO = "CRITICAL_VETO"


class OWASPThreatCategory(str, Enum):
    ASI01_GOAL_HIJACK = "ASI01: Agent Goal Hijacking (Indirect Prompt Injection)"
    ASI02_TOOL_MISUSE = "ASI02: Tool Misuse & Unauthorized Invocation"
    ASI03_PRIVILEGE_ESCALATION = "ASI03: Privilege Escalation & Confused Deputy"
    ASI04_UNBOUNDED_ACTION = "ASI04: Unbounded Financial / Environmental Action"
    ASI06_MEMORY_POISONING = "ASI06: Memory & RAG State Poisoning"
    ASI08_CASCADING_FAILURE = "ASI08: Cascading Tool Loops & Retry Storms"
    MCP10_DATA_EXFILTRATION = "MCP10: Sensitive Data Exfiltration"
    UNKNOWN = "UNKNOWN: General Security Anomaly"


# ==========================================
# Member 1 Contracts (Threat Modeler & Attacker)
# ==========================================

class AgentConfig(BaseModel):
    name: str = "TargetAgent"
    system_prompt: Optional[str] = None
    tools: List[str] = Field(default_factory=list)


class ToolSchema(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    required: List[str] = Field(default_factory=list)


class ToolParameter(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    required: bool = False


class ToolMetadata(BaseModel):
    name: str
    is_source: bool = False
    is_sink: bool = False
    threat_category: Optional[str] = None


class ASIVector(BaseModel):
    tool: str
    vector: str
    category: Optional[str] = "ASI01"
    is_source: bool = False
    is_sink: bool = False


class ThreatModel(BaseModel):
    vulnerable_tools: List[Dict[str, Any]] = Field(default_factory=list)
    risk_vectors: List[ASIVector] = Field(default_factory=list)
    confidence: float = 1.0


class AttackObjective(BaseModel):
    target_tool: str
    intent: str
    threat_category: str


class AttackPlan(BaseModel):
    target_tool: str
    vector: str
    plan_id: str = Field(default_factory=lambda: f"plan_{uuid.uuid4().hex[:8]}")
    payload_intent: Optional[str] = None


class AttackPayload(BaseModel):
    payload_content: str
    target_node: Optional[str] = None
    payload: Optional[str] = None  # alias for payload_content

    def __init__(self, **data):
        if "payload" in data and "payload_content" not in data:
            data["payload_content"] = data["payload"]
        if "payload_content" in data and "payload" not in data:
            data["payload"] = data["payload_content"]
        super().__init__(**data)


# ==========================================
# Member 2 Contracts (Interception & Trace Engine)
# ==========================================

class InterceptedCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    args: Optional[Dict[str, Any]] = None  # alias
    run_id: str
    schema_definition: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

    def __init__(self, **data):
        if "args" in data and "arguments" not in data:
            data["arguments"] = data["args"]
        if "arguments" in data and "args" not in data:
            data["args"] = data["arguments"]
        super().__init__(**data)


class OpenInferenceSpan(BaseModel):
    span_id: str = Field(default_factory=lambda: f"span_{uuid.uuid4().hex[:8]}")
    parent_id: Optional[str] = None
    name: str
    kind: SpanKind = SpanKind.TOOL
    span_kind: Optional[str] = None
    start_time: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    end_time: Optional[str] = None
    status_code: str = "OK"
    status_message: Optional[str] = None
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
    threat_category: Optional[Union[OWASPThreatCategory, str]] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)


class TrajectoryData(BaseModel):
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}")
    agent_name: str = "TargetAgent"
    system_prompt: Optional[str] = None
    user_prompt: str = ""
    spans: List[OpenInferenceSpan] = Field(default_factory=list)
    span_kind: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ExecutionEvent(BaseModel):
    event_type: str
    run_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    payload: Dict[str, Any] = Field(default_factory=dict)


# ==========================================
# Member 3 Contracts (Generative Sandbox & State)
# ==========================================

class MockRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    schema_definition: Optional[Dict[str, Any]] = None


class MockResponse(BaseModel):
    status_code: int = 200
    response_body: str = ""
    data: Optional[Dict[str, Any]] = None
    is_poisoned: bool = False


class SandboxState(BaseModel):
    state_tree: Dict[str, Any] = Field(default_factory=dict)


class StateSnapshot(BaseModel):
    timestamp: Optional[str] = None
    state: Dict[str, Any] = Field(default_factory=dict)


class StateDiff(BaseModel):
    run_id: Optional[str] = None
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    diff_keys: List[str] = Field(default_factory=list)
    unauthorized_changes: List[str] = Field(default_factory=list)
    has_changes: bool = False
    state_mutated: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    def __init__(self, **data):
        if "has_changes" in data and "state_mutated" not in data:
            data["state_mutated"] = data["has_changes"]
        if "state_mutated" in data and "has_changes" not in data:
            data["has_changes"] = data["state_mutated"]
        super().__init__(**data)


# ==========================================
# Member 4 Contracts (Policy, Evidence DAG & YAML)
# ==========================================

class PolicyRule(BaseModel):
    rule_id: str = "RULE-001"
    name: str = "RESTRICTED_SINK_RULE"
    sink_tool: str = "execute_refund"
    description: str = "Blocks unauthorized tool executions"
    requires_authorization: bool = True
    severity: EvaluationStatus = EvaluationStatus.CRITICAL_VETO
    threat_category: Optional[Union[OWASPThreatCategory, str]] = None
    condition_expression: Optional[str] = None


class EvaluationResult(BaseModel):
    evaluation_id: str = Field(default_factory=lambda: f"eval_{uuid.uuid4().hex[:8]}")
    run_id: str = ""
    status: Union[EvaluationStatus, str] = EvaluationStatus.PASS
    violating_span_id: Optional[str] = None
    violating_tool: Optional[str] = None
    injection_source_span_id: Optional[str] = None
    rule_name: Optional[str] = None
    reason: str = ""
    threat_category: Optional[Union[OWASPThreatCategory, str]] = None
    state_diff: Optional[StateDiff] = None
    latency_ms: float = 0.0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    details: Dict[str, Any] = Field(default_factory=dict)


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


class DAGNode(BaseModel):
    id: str
    type: str = "custom"
    data: Optional[Dict[str, Any]] = None
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})


class DAGEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False
    style: Optional[Dict[str, Any]] = None
    label: Optional[str] = None


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


class EvidenceDAG(BaseModel):
    run_id: str = ""
    agent_name: str = ""
    nodes: List[Union[EvidenceDAGNode, Dict[str, Any]]] = Field(default_factory=list)
    edges: List[Union[EvidenceDAGEdge, Dict[str, Any]]] = Field(default_factory=list)
    evaluation: Optional[EvaluationResult] = None
    summary: str = ""
    veto_count: int = 0
    warning_count: int = 0


class AttackVectorSpec(BaseModel):
    poisoned_source_tool: str
    payload: str
    target_sink_tool: str
    threat_category: str


class ExpectedAdjudicationSpec(BaseModel):
    verdict: EvaluationStatus
    violation_rule: str
    state_invariant: Dict[str, Any] = Field(default_factory=dict)


class RegressionTestSpec(BaseModel):
    version: str = "agentveto/v1"
    test_id: str
    name: str
    target_agent: str
    threat_category: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    setup: Dict[str, Any] = Field(default_factory=dict)
    attack_vector: AttackVectorSpec
    expected_adjudication: ExpectedAdjudicationSpec


class RegressionTest(RegressionTestSpec):
    pass


class RunMetadata(BaseModel):
    run_id: str
    started_at: str
    completed_at: Optional[str] = None
    status: str
