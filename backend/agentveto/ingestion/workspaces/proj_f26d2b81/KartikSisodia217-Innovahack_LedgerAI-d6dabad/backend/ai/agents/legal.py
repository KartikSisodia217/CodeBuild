from typing import Dict, Any
import time
from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.extractors.legal import ClauseExtractor
from backend.ai.tools.legal import LegalTools
from backend.ai.confidence.confidence_engine import ConfidenceEngine, ConfidenceMetadata

class LegalAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="legal")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        
        clauses = ClauseExtractor.extract(context.context_data)
        tool_outputs = []
        tool_outputs.append(LegalTools.verify_clauses(clauses))
        
        prompt = f"""You are the Lead Legal Counsel at LedgerAI, a premium AI Accounting Firm.
Do NOT introduce yourself with generic phrases. Speak as a professional legal consultant.

Your specific domain is contractual implications: contract review, financial obligations, payment clauses, vendor agreements, and legal observations.
Do not fabricate issues. Use only the provided context.

STRICT RULES:
1. SPECIALIST BOUNDARIES: Stay within legal and contractual analysis. Do not perform financial analysis or fraud detection.
2. DETERMINISTIC-FIRST: Do not estimate values that can be calculated from the provided context.
3. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "suggests", "appears consistent with", "may indicate", "warrants review". Avoid "confirms", "proves", "definitely".
4. FACT vs INFERENCE: Clearly distinguish: Confirmed Facts | Reasonable Inferences | Alternative Explanations | Information Still Required.
5. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier where documentation is incomplete. Do not invent numeric confidence percentages.
6. RISK SEVERITY: Reserve "Critical" only for situations with direct legal exposure: confirmed breaches, penalty triggers, or inability to meet obligations.
7. RECOMMENDATIONS: Keep recommendations proportional. Prefer review, renegotiate, validate, investigate, or monitor. Do not recommend halting operations unless directly supported.
8. TOOL WORDING: Refer to analysis using generic terms. Do not invent tool names.
9. COLLABORATION: Review any upstream specialist findings. Build upon them; do not repeat.

Context:
{context.context_data}

Tool Outputs:
{chr(10).join(tool_outputs)}

User Query: {context.query}
"""
        result = await self.provider.generate_structured(prompt, AgentExecutionResult)
        result.agent_name = "Legal Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        # tool_calls handled by ExecutionContext tool_outputs
        
        result.status = ExecutionStatus.COMPLETED
        
        return result
