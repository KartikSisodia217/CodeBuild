from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExecutionStatus(str, Enum):
    REGISTERED = "REGISTERED"
    QUEUED = "QUEUED"
    STARTED = "STARTED"
    WAITING_FOR_DEPENDENCIES = "WAITING_FOR_DEPENDENCIES"
    RUNNING_TOOLS = "RUNNING_TOOLS"
    RUNNING_LLM = "RUNNING_LLM"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

class ConfidenceMetrics(BaseModel):
    evidence: float = Field(0.0, description="Confidence in the source evidence quality (0-1).")
    tools: float = Field(0.0, description="Confidence in the deterministic tool outputs (0-1).")
    reasoning: float = Field(0.0, description="Confidence in the logical reasoning path (0-1).")
    coverage: float = Field(0.0, description="Data completeness and coverage (0-1).")
    dependencies: float = Field(0.0, description="Confidence derived from upstream specialist findings (0-1).")
    overall: float = Field(0.0, description="Aggregated overall confidence (0-1).")

class ToolReport(BaseModel):
    tool_name: str
    purpose: str
    result: Any
    execution_time_ms: float
    status: str = "SUCCESS" # SUCCESS or FAILED
    error_message: Optional[str] = None

class AgentExecutionResult(BaseModel):
    agent_name: str
    status: ExecutionStatus
    execution_time_ms: float = 0.0
    
    # Successful execution data
    confidence: Optional[ConfidenceMetrics] = None
    summary: Optional[str] = None
    findings: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    tools_invoked: List[ToolReport] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    
    # Failure/Skip data
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    skip_reason: Optional[str] = None

class ExecutionContext(BaseModel):
    request_id: str
    execution_trace_id: str
    query: str
    context_data: str # The raw retrieved docs/ledger
    execution_mode: str = "execution" # 'execution' or 'planning'
    debug: bool = False
    
    # Dynamically updated during DAG execution
    previous_findings: Dict[str, AgentExecutionResult] = Field(default_factory=dict)
    
    # Read-only runtime info injected by dispatcher
    available_tools: List[str] = Field(default_factory=list)
    runtime_health: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)

class ExecutionReport(BaseModel):
    request_id: str
    execution_trace_id: str
    intent: str
    execution_mode: str
    selected_specialists: List[str]
    execution_graph: Dict[str, AgentExecutionResult]
    cross_validation_flags: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    final_confidence: float = 0.0
    total_time_ms: float = 0.0
    synthesis_result: Optional[Dict[str, Any]] = None # The final Lead Partner JSON output
