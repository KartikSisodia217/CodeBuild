"""
Financial Agent — Phase 6
Pre-computes bank statement metrics and health indicators before LLM call.
The LLM interprets the numbers; the tools produce them.
"""
from typing import Dict, Any
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.financial import AnalystOutput
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.extractors.financial import FinancialExtractor
from backend.ai.tools.financial import FinancialTools
from backend.ai.confidence.confidence_engine import ConfidenceEngine, ConfidenceMetadata
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Financial Analyst at LedgerAI, a premium AI Accounting Firm.

Your domain: cash flow, revenue analysis, expense analysis, profitability, liquidity, and financial health.
Speak as a seasoned financial analyst. Never introduce yourself with generic phrases.

STRICT RULES:
1. DETERMINISTIC-FIRST: The Tool Outputs section contains calculated numbers. Reference them directly — do NOT re-estimate what is already computed.
2. DETERMINISTIC IMMUTABILITY: Consume computed values (balances, totals, percentages, ratios) exactly as produced. Do not recompute, paraphrase, or modify these values.
3. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "suggests", "appears consistent with", "may indicate", "likely contributor". Avoid "confirms", "proves", "definitely", "caused by".
4. FACT vs INFERENCE: Clearly distinguish confirmed facts from reasonable inferences. Never present an inference as an established fact.
5. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier where data is incomplete. Do not invent numeric confidence percentages.
6. ACCOUNTING TERMINOLOGY: Use consistent accounting language: Cash Flow, Operating Expenses, Net Profit, Accounts Receivable, Accounts Payable, Working Capital, Liquidity. Do not switch terminology mid-report.
7. SPECIALIST BOUNDARIES: Stay within your domain. Do not repeat ledger reconciliation or fraud detection.
8. COLLABORATION: Build upon upstream findings. Do not duplicate them.
9. NO HALLUCINATION: If the data is insufficient to support a finding, say so explicitly."""


class FinancialAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="financial")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        prompt = self.prompt_manager.load_prompt(self.agent_name, final_ledger=state.model_dump_json())
        result = await self.provider.generate_structured(prompt, AnalystOutput)
        return {"analyst_insights": result}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()

        # ── Deterministic pre-computation ──
        tool_outputs = []

        # Standard ratio computation
        fin_data = FinancialExtractor.extract(context.context_data)
        tool_outputs.append(FinancialTools.calculate_ratios(fin_data))

        # Bank statement analysis (if applicable)
        bank_summary = None
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            analysis, _ = BankStatementAnalyzer.from_text(context.context_data)
            if analysis.transaction_count > 0:
                bank_summary = analysis.to_summary_dict()
                tool_outputs.append(
                    f"Bank Statement Metrics:\n{json.dumps(bank_summary, indent=2)}"
                )

                # Financial health indicators
                from backend.ai.analysis.financial_health import FinancialHealthEngine
                health = FinancialHealthEngine.analyze(analysis)
                tool_outputs.append(
                    f"Financial Health Indicators:\n{json.dumps(health.to_dict(), indent=2)}"
                )
        except Exception:
            pass  # Not a bank statement — continue with standard analysis

        # Upstream findings summary
        upstream_text = ""
        if context.previous_findings:
            parts = []
            for agent_name, res in context.previous_findings.items():
                if res.summary:
                    parts.append(f"[{agent_name}]: {res.summary}")
            upstream_text = "\n".join(parts)

        # ── Build secure message array ──
        messages = PromptBuilder.build_agent_messages(
            system_prompt=_SYSTEM_PROMPT,
            context_data=context.context_data,
            user_query=context.query,
            tool_results=tool_outputs,
            upstream_findings=upstream_text or None,
        )

        # Flatten for Gemini (structured output path)
        flat_prompt = PromptBuilder.format_for_gemini(messages)

        result = await self.provider.generate_structured(flat_prompt, AgentExecutionResult)
        result.agent_name = "Financial Analyst"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
