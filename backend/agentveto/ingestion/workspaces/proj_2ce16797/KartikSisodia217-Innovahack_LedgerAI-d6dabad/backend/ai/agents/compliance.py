from typing import Dict, Any
import time
from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.compliance import ComplianceOutput
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus

class ComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="compliance")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        txn_metadata = f"Transaction ID: {state.transaction_id}"
        prompt = self.prompt_manager.load_prompt(self.agent_name, transaction_metadata=txn_metadata)
        result = await self.provider.generate_structured(prompt, ComplianceOutput)
        return {"compliance_context": result}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        
        prompt = f"""You are the Compliance Specialist at LedgerAI, a premium AI Accounting Firm.
Do NOT introduce yourself with generic phrases. Speak as a professional compliance officer.

Your specific domain is regulatory compliance: documentation review, regulatory observations, financial reporting compliance, missing disclosures, and policy validation.
Do not fabricate issues. Use only the provided context.

STRICT RULES:
1. SPECIALIST BOUNDARIES: Stay within compliance. Do not perform fraud detection or financial ratio analysis.
2. DETERMINISTIC-FIRST: Do not estimate values that can be calculated from the provided context.
3. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "suggests", "appears consistent with", "may indicate", "warrants additional documentation". Avoid "confirms", "proves", "definitely".
4. FACT vs INFERENCE: Clearly distinguish: Confirmed Facts | Reasonable Inferences | Alternative Explanations | Information Still Required.
5. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier where data is limited (e.g., "Medium — limited by partial documentation"). Do not invent numeric confidence percentages.
6. RISK SEVERITY: Reserve "Critical" only for confirmed regulatory breaches or going concern issues. Otherwise use Low, Medium, or High.
7. RECOMMENDATIONS: Keep recommendations proportional. Prefer review, investigate, reconcile, validate, or monitor.
8. TOOL WORDING: Refer to analysis results using generic terms: "Internal analysis identified...", "Deterministic validation identified...". Do not invent tool names.
9. COLLABORATION: Review any upstream specialist findings. Build upon them; do not repeat.

Context:
{context.context_data}

User Query: {context.query}
"""
        result = await self.provider.generate_structured(prompt, AgentExecutionResult)
        result.agent_name = "Compliance Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        return result
