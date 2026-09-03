from typing import Dict, Any
import time
from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.gst import GSTOutput
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.extractors.gst import GSTExtractor
from backend.ai.tools.gst import GSTTools
from backend.ai.confidence.confidence_engine import ConfidenceEngine, ConfidenceMetadata
from backend.ai.rag.retriever import Retriever

class GSTAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="gst")
        self.retriever = Retriever(k=3)

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        draft = state.accounting_draft.model_dump_json() if state.accounting_draft else "{}"
        docs = await self.retriever.retrieve(query="SEZ zero-rated supply LUT rules IGST")
        rag_context = "\n".join([d.page_content for d in docs]) if docs else "No specific rules found in DB."
        prompt = self.prompt_manager.load_prompt(self.agent_name, accounting_draft=draft, rag_context=rag_context)
        result = await self.provider.generate_structured(prompt, GSTOutput)
        return {"gst_context": result}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        
        gst_data = GSTExtractor.extract(context.context_data)
        tool_outputs = []
        tool_outputs.append(GSTTools.calculate_tax(gst_data))
        tool_outputs.append(GSTTools.verify_itc_eligibility(gst_data))
        
        prompt = f"""You are the Lead Tax Consultant (GST Specialist) at LedgerAI, a premium AI Accounting Firm.
Do NOT introduce yourself with generic phrases. Speak as a professional tax advisor.

Structure your response with:
1. GST Category
2. Applicable Rate
3. Tax Liability
4. ITC Eligibility
5. Compliance Notes

STRICT RULES:
1. DETERMINISTIC-FIRST: Tool Outputs contain computed tax amounts. Reference them directly.
2. DETERMINISTIC IMMUTABILITY: Consume computed tax totals exactly as produced. Do not recompute or paraphrase them.
3. EVIDENCE DISCIPLINE: Every finding must cite explicit evidence from the provided Context or Tool Outputs. Use calibrated language: "appears consistent with", "may indicate", "warrants additional documentation".
4. FACT vs INFERENCE: Clearly distinguish: Confirmed Facts | Reasonable Inferences | Information Still Required.
5. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier (e.g., "Medium — limited by missing invoices"). Do not invent numeric confidence percentages.
6. TOOL WORDING: Refer to analysis using generic terms. Do not reference or invent named backend tools such as ForensicPaymentMatcher.
7. SPECIALIST BOUNDARIES: Stay within GST and indirect tax. Do not perform fraud detection or broad financial analysis.

Context:
{context.context_data}

Tool Outputs:
{chr(10).join(tool_outputs)}

User Query: {context.query}
"""
        result = await self.provider.generate_structured(prompt, AgentExecutionResult)
        result.agent_name = "GST Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        # tool_calls handled by ExecutionContext tool_outputs
        
        result.status = ExecutionStatus.COMPLETED
        
        return result
