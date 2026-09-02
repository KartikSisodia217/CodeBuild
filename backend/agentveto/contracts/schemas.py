"""
AgentVeto Interface Contracts — Pydantic Schemas

These schemas define the data contracts between all AgentVeto subsystems.
They are the single source of truth for all inter-component communication.

Frozen after Phase 0 (Hour 4). Changes require team sync.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# ─── Enums ───────────────────────────────────────────────────────────────────

class SpanKind(str, Enum):
    """OpenInference span kinds for telemetry."""
    LLM = "LLM"
    AGENT = "AGENT"
    TOOL = "TOOL"
    CHAIN = "CHAIN"


class VetoStatus(str, Enum):
    """Evaluation result status."""
    PASS = "PASS"
    WARN = "WARN"
    CRITICAL_VETO = "CRITICAL_VETO"


class ASICategory(str, Enum):
    """OWASP Agentic Security Initiative categories."""
    ASI01 = "ASI01"  # Goal Hijack
    MCP10 = "MCP10"  # Data Exfiltration


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
    """State difference computed by the sandbox.
    
    Uses Member 3's field names: before, after, diff_keys, has_changes.
    """
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    diff_keys: List[str] = Field(default_factory=list, description="Keys that changed")
    has_changes: bool = Field(default=False, description="Whether any changes occurred")
    run_id: str = Field(default="", description="Execution run identifier")


# ─── Trace Engine Contracts ──────────────────────────────────────────────────

class OpenInferenceSpan(BaseModel):
    """A single OpenInference-compatible telemetry span."""
    span_id: str = Field(default="", description="Unique span identifier")
    parent_id: Optional[str] = Field(default=None, description="Parent span ID")
    kind: SpanKind = Field(..., description="Span kind (LLM, AGENT, TOOL, CHAIN)")
    name: str = Field(default="", description="Span name (e.g., tool function name)")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Span attributes")
    status: str = Field(default="OK", description="Span status")
    start_time: Optional[datetime] = Field(default=None)
    end_time: Optional[datetime] = Field(default=None)
    events: List[Dict[str, Any]] = Field(default_factory=list, description="Span events")


class TrajectoryData(BaseModel):
    """Complete execution trajectory.
    
    UPGRADED: Now holds a run_id and list of spans for complete trajectory.
    Backward compatibility: also accepts legacy single-span mode via
    span_kind + attributes fields for Member 2's existing code.
    """
    # New multi-span trajectory fields
    run_id: str = Field(default="", description="Unique run identifier")
    spans: List[OpenInferenceSpan] = Field(default_factory=list, description="All spans in this trajectory")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Run metadata")
    
    # Legacy single-span fields (backward compatibility with Member 2's storage)
    span_kind: str = Field(default="", description="Legacy: span kind string")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Legacy: span attributes")


# ─── Evaluator Contracts ─────────────────────────────────────────────────────

class EvaluationResult(BaseModel):
    """Result of the deterministic evaluation."""
    status: str = Field(..., description="PASS, WARN, or CRITICAL_VETO")
    reason: str = Field(default="", description="Human-readable explanation")
    violating_span_id: Optional[str] = Field(default=None, description="Span that caused the violation")
    trajectory_summary: Dict[str, Any] = Field(default_factory=dict, description="Summary of the trajectory")
    run_id: str = Field(default="", description="Execution run identifier")


# ─── Evidence Registry Contracts ─────────────────────────────────────────────

class DAGNode(BaseModel):
    """A node in the evidence DAG."""
    id: str = Field(default="", description="Unique node identifier")
    type: str = Field(default="default", description="Node type for rendering")
    label: str = Field(default="", description="Display label")
    data: Dict[str, Any] = Field(default_factory=dict, description="Node data")
    style: Dict[str, Any] = Field(default_factory=dict, description="Visual style")


class DAGEdge(BaseModel):
    """An edge in the evidence DAG."""
    id: str = Field(default="", description="Unique edge identifier")
    source: str = Field(default="", description="Source node ID")
    target: str = Field(default="", description="Target node ID")
    label: str = Field(default="", description="Edge label")
    style: Dict[str, Any] = Field(default_factory=dict, description="Visual style")


class EvidenceDAG(BaseModel):
    """Complete evidence DAG for visualization."""
    nodes: List[Any] = Field(default_factory=list)
    edges: List[Any] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ─── Legacy stubs (kept for backward compatibility) ──────────────────────────

class AgentConfig(BaseModel):
    pass

class ToolParameter(BaseModel):
    pass

class ToolMetadata(BaseModel):
    pass

class AttackObjective(BaseModel):
    pass

class MockRequest(BaseModel):
    pass

class ExecutionEvent(BaseModel):
    pass

class PolicyRule(BaseModel):
    pass

class RegressionTest(BaseModel):
    pass

class RunMetadata(BaseModel):
    pass
