"""
AgentVeto Interface Contracts — Pydantic Schemas

These schemas define the data contracts between all AgentVeto subsystems.
They are the single source of truth for all inter-component communication.

Frozen after Phase 0 (Hour 4). Changes require team sync.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


# ─── Enums ───────────────────────────────────────────────────────────────────


# --- Enums (from Member 4) ---
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



# Legacy aliases — kept for backward compatibility with imported test fixtures.
VetoStatus = EvaluationStatus
ASICategory = OWASPThreatCategory


class ToolCapability(str, Enum):
    """Tool capability classification."""
    DATA_SOURCE = "DATA_SOURCE"  # Read operations
    SINK = "SINK"                # State-changing operations
    DUAL = "DUAL"                # Both read and write
    NEUTRAL = "NEUTRAL"          # No significant security impact


# ─── Agent Adapter Contracts ─────────────────────────────────────────────────

class ToolSchema(BaseModel):
    """Schema describing a single tool available to the target agent."""
    name: str = Field(..., description="Tool function name")
    description: str = Field(default="", description="Human-readable description")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="JSON Schema of tool parameters")
    required: List[str] = Field(default_factory=list, description="List of required parameter names")


class InterceptedCall(BaseModel):
    """Data captured when a tool call is intercepted by the Agent Adapter.
    
    Maintains backward compatibility with Member 3's SandboxManager via
    schema_definition alias.
    """
    tool_name: str = Field(..., description="Name of the intercepted tool")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Arguments passed to the tool")
    run_id: str = Field(..., description="Unique identifier for this execution run")
    schema_definition: Optional[Dict[str, Any]] = Field(default=None, description="Schema of the intercepted tool (legacy)")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional execution context")
    tool_schema: Optional[ToolSchema] = Field(default=None, description="Structured schema of the intercepted tool")
    timestamp: Optional[datetime] = Field(default=None)


# ─── Threat Modeler Contracts ────────────────────────────────────────────────

class ASIVector(BaseModel):
    """A single OWASP ASI threat vector identified for a tool.
    
    Fields 'tool' and 'vector' are kept for backward compatibility with
    Member 1's original tests. New code should prefer 'tool_name' style access.
    """
    tool: str = Field(..., description="The tool this vector applies to")
    vector: str = Field(..., description="The ASI category string (e.g., 'ASI01', 'MCP10')")
    capability: ToolCapability = Field(default=ToolCapability.NEUTRAL, description="Tool capability classification")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score")
    description: str = Field(default="", description="Human-readable description of the threat")

    @property
    def tool_name(self) -> str:
        return self.tool

    @property
    def asi_category(self) -> ASICategory:
        return ASICategory(self.vector)


class ThreatModel(BaseModel):
    """Complete threat model for a set of tools."""
    vulnerable_tools: List[ASIVector] = Field(default_factory=list, description="Identified threat vectors")
    risk_vectors: List[str] = Field(default_factory=list, description="Unique risk category strings found")
    source_tools: List[str] = Field(default_factory=list, description="Tools classified as data sources")
    sink_tools: List[str] = Field(default_factory=list, description="Tools classified as sinks")
    has_source_sink_pair: bool = Field(default=False, description="Whether both source and sink tools exist")
    overall_risk: str = Field(default="LOW", description="Overall risk assessment: LOW, MEDIUM, HIGH, CRITICAL")


# ─── Adversarial Engine Contracts ────────────────────────────────────────────

class AttackPlan(BaseModel):
    """Structured plan for an adversarial attack.
    
    Maintains backward compatibility with the original field names
    (vector, injection_point, success_condition) while adding new fields.
    """
    target_tool: str = Field(..., description="The tool to target with the attack")
    vector: str = Field(..., description="The ASI vector being exploited (e.g., 'ASI01')")
    attack_strategy: str = Field(..., description="High-level description of the attack approach")
    injection_point: str = Field(default="tool_response", description="Where to inject the payload")
    success_condition: str = Field(default="", description="What constitutes attack success")
    attack_objective: str = Field(default="", description="What the attack aims to achieve")
    source_tool: Optional[str] = Field(default=None, description="Data source tool to poison")
    sink_tool: Optional[str] = Field(default=None, description="Sink tool the agent should be tricked into calling")
    contextual_constraints: Dict[str, Any] = Field(default_factory=dict, description="Additional attack constraints")


class AttackPayload(BaseModel):
    """Generated adversarial payload.
    
    Maintains backward compatibility with Member 3's SandboxManager via
    payload_content field. The 'payload' property provides cleaner access.
    """
    payload_content: str = Field(..., description="The malicious content to inject")
    target_node: Optional[str] = Field(default=None, description="Tool whose response will contain this payload (legacy)")
    target_tool: str = Field(default="", description="Tool whose response will contain this payload")
    attack_vector: str = Field(default="ASI01", description="The ASI vector this payload exploits")
    content_type: str = Field(default="indirect_prompt_injection", description="Type of attack content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional payload metadata")

    @property
    def payload(self) -> str:
        """Alias for payload_content for cleaner access."""
        return self.payload_content


# ─── Mock Sandbox Contracts ──────────────────────────────────────────────────

class MockResponse(BaseModel):
    """Response generated by the mock sandbox.
    
    Member 3's SandboxManager returns response_body as a JSON string
    and data as parsed dict. Both are kept.
    """
    status_code: int = Field(default=200, description="HTTP-like status code")
    response_body: str = Field(default="", description="The synthetic API response as JSON string")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Parsed response dict")
    tool_name: str = Field(default="", description="The tool this response is for")
    is_poisoned: bool = Field(default=False, description="Whether this response contains an attack payload")
    run_id: str = Field(default="", description="Execution run identifier")


class SandboxState(BaseModel):
    """Sandbox state tree."""
    state_tree: Dict[str, Any] = Field(default_factory=dict)


class StateSnapshot(BaseModel):
    """State at a point in time."""
    timestamp: Optional[str] = None
    state: Dict[str, Any] = Field(default_factory=dict)


class StateDiff(BaseModel):
    """State difference computed by the sandbox."""
    run_id: Optional[str] = Field(default=None, description="Execution run identifier")
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    diff_keys: List[str] = Field(default_factory=list, description="Keys that changed")
    unauthorized_changes: List[str] = Field(default_factory=list)
    has_changes: bool = Field(default=False, description="Whether any changes occurred")
    state_mutated: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __init__(self, **data):
        if "has_changes" in data and "state_mutated" not in data:
            data["state_mutated"] = data["has_changes"]
        if "state_mutated" in data and "has_changes" not in data:
            data["has_changes"] = data["state_mutated"]
        super().__init__(**data)


# ─── Trace Engine Contracts ──────────────────────────────────────────────────

class OpenInferenceSpan(BaseModel):
    """A single OpenInference-compatible telemetry span."""
    span_id: str = Field(default_factory=lambda: f"span_{uuid.uuid4().hex[:8]}", description="Unique span identifier")
    parent_id: Optional[str] = Field(default=None, description="Parent span ID")
    kind: SpanKind = Field(default=SpanKind.TOOL, description="Span kind (LLM, AGENT, TOOL, CHAIN)")
    span_kind: Optional[str] = None
    name: str = Field(default="", description="Span name (e.g., tool function name)")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Span attributes")
    status: str = Field(default="OK", description="Span status")
    status_code: str = "OK"
    status_message: Optional[str] = None
    start_time: Optional[Union[datetime, str]] = Field(default=None)
    end_time: Optional[Union[datetime, str]] = Field(default=None)
    events: List[Dict[str, Any]] = Field(default_factory=list, description="Span events")
    
    # Member 4 additions
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


class TrajectoryData(BaseModel):
    """Complete execution trajectory."""
    run_id: str = Field(default_factory=lambda: f"run_{uuid.uuid4().hex[:12]}", description="Unique run identifier")
    agent_name: str = "TargetAgent"
    system_prompt: Optional[str] = None
    user_prompt: str = ""
    spans: List[OpenInferenceSpan] = Field(default_factory=list, description="All spans in this trajectory")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Run metadata")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    
    # Legacy single-span fields (backward compatibility with Member 2's storage)
    span_kind: Optional[str] = Field(default="", description="Legacy: span kind string")
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Legacy: span attributes")


# ─── Member 4 Contracts ─────────────────────────────────────────────────────

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
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
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
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
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

# ─── Project Ingestion Contracts ──────────────────────────────────────────────

class ToolCandidate(BaseModel):
    name: str = Field(..., description="Name of the discovered tool")
    source_file: str = Field(..., description="File where the tool is defined")
    schema_hint: Optional[Dict[str, Any]] = Field(default=None, description="Statically inferred schema if available")
    line_number: Optional[int] = Field(default=None, description="Line number of tool definition")

class AgentCandidate(BaseModel):
    name: str = Field(..., description="Name of the agent or primary file")
    file: str = Field(..., description="File path")
    entry_point: Optional[str] = Field(default=None, description="Inferred entry point")
    integration: str = Field(..., description="Type of integration detected (e.g., 'python_interceptor')")
    tools: List[ToolCandidate] = Field(default_factory=list, description="Tools associated with this agent")

class ProjectManifest(BaseModel):
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}")
    project_name: str = Field(default="Unknown Project")
    language: str = Field(default="python")
    framework: Optional[str] = Field(default=None)
    supported: bool = Field(default=False)
    integration_type: Optional[str] = Field(default=None)
    agents: List[AgentCandidate] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

