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

class InterceptedCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    run_id: str

class ExecutionContext(BaseModel):
    pass

class MockRequest(BaseModel):
    pass

class MockResponse(BaseModel):
    response_body: str

class SandboxState(BaseModel):
    pass

class StateSnapshot(BaseModel):
    pass

class StateDiff(BaseModel):
    initial_state: bool
    final_state: bool

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
