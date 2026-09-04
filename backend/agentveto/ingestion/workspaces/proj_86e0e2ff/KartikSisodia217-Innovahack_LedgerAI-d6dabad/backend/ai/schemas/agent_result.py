from typing import List, Optional
from pydantic import BaseModel, Field

class ToolReport(BaseModel):
    tool_name: str = Field(description="Name of the deterministic tool invoked.")
    purpose: str = Field(description="Why this tool was invoked.")
    result: str = Field(description="The factual result returned by the tool.")
    confidence: str = Field(description="Confidence in the tool result (usually 100% for deterministic tools).")

class AgentResult(BaseModel):
    agent: str = Field(description="The name of the agent generating this result.")
    activation_reason: str = Field(description="Why this agent was selected and what it analyzed.")
    skip_reason: Optional[str] = Field(default=None, description="If skipped, explain why it was unnecessary.")
    
    finding_confidence: str = Field(description="Confidence percentage in the factual findings (e.g., '95%').")
    evidence_confidence: str = Field(description="Confidence percentage in the source evidence quality.")
    tool_confidence: str = Field(description="Confidence percentage in the deterministic tool outputs.")
    overall_confidence: str = Field(description="Aggregated overall confidence score for this agent's analysis.")
    
    summary: str = Field(description="A brief executive summary of the agent's analysis.")
    findings: List[str] = Field(default_factory=list, description="Specific factual findings extracted from the context.")
    evidence: List[str] = Field(default_factory=list, description="Explicit citations/quotes from the text/ledger proving the findings.")
    reasoning: str = Field(description="Detailed explanation connecting the evidence to the findings and recommendations.")
    risks: List[str] = Field(default_factory=list, description="Specific risks identified during this analysis.")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations based on the findings.")
    suggested_action: Optional[str] = Field(default=None, description="Suggested next action if applicable.")
    
    sources: List[str] = Field(default_factory=list, description="List of source document names or transaction IDs used.")
    warnings: List[str] = Field(default_factory=list, description="Any warnings, caveats, or missing information.")
    execution_time: float = Field(default=0.0, description="Execution time in seconds (populated by the agent loop).")
    tools_used: List[ToolReport] = Field(default_factory=list, description="Detailed report of deterministic tools executed.")
