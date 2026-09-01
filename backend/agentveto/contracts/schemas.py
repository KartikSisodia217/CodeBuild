"""
Shared Contracts (Pydantic Models)
Single Source of Truth
Producers/Consumers reference these.
"""
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum

# TODO: Implement full schemas as defined in Interface Contracts

class AgentConfig(BaseModel):
    pass

class ToolSchema(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]

class ToolParameter(BaseModel):
    pass

class ToolMetadata(BaseModel):
    pass

class ThreatModel(BaseModel):
    pass

class ASIVector(BaseModel):
    pass

class AttackObjective(BaseModel):
    pass

class AttackPlan(BaseModel):
    target_tool: str
    vector: str

class AttackPayload(BaseModel):
    payload_content: str
    target_node: Optional[str] = None

class InterceptedCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}
    run_id: str
    schema_definition: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None

class MockRequest(BaseModel):
    pass

class MockResponse(BaseModel):
    status_code: int = 200
    response_body: str
    data: Optional[Dict[str, Any]] = None

class SandboxState(BaseModel):
    state_tree: Dict[str, Any] = {}

class StateSnapshot(BaseModel):
    timestamp: Optional[str] = None
    state: Dict[str, Any] = {}

class StateDiff(BaseModel):
    before: Dict[str, Any] = {}
    after: Dict[str, Any] = {}
    diff_keys: List[str] = []
    has_changes: bool = False

class ExecutionEvent(BaseModel):
    pass

class TrajectoryData(BaseModel):
    span_kind: str
    attributes: Dict[str, Any]

class PolicyRule(BaseModel):
    pass

class EvaluationResult(BaseModel):
    status: str
    violating_span_id: Optional[str]

class EvidenceDAG(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class DAGNode(BaseModel):
    pass

class DAGEdge(BaseModel):
    pass

class RegressionTest(BaseModel):
    pass

class RunMetadata(BaseModel):
    pass
