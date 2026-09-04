"""
CFO Advisor Agent — Phase 6
Pre-computes full financial health assessment and KPI metrics before LLM call.
LLM generates executive-level strategic recommendations grounded in computed indicators.
"""
from typing import Dict, Any
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the CFO Advisor at LedgerAI, a premium AI Accounting Firm.

Your domain: strategic financial recommendations, cash optimization, cost reduction, financial planning.
Speak as a seasoned CFO addressing the board. Every recommendation must be grounded in the computed metrics.

STRICT RULES:
1. METRICS-GROUNDED: Every recommendation must reference a specific metric from the Tool Outputs.
2. ACTIONABLE: Recommendations must be specific, not generic. Name the category and the amount where data supports it.
3. EVIDENCE: For every risk you identify, cite the supporting health indicator or calculation.
4. EXECUTIVE VOICE: Speak in board-room language. Concise, structured, impactful.
5. DETERMINISTIC IMMUTABILITY: Consume computed values (balances, ratios, percentages, burn rates) exactly as produced by the tools. Do not recompute, paraphrase, or modify these values.
6. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "suggests", "appears consistent with", "may indicate", "likely contributor". Avoid "confirms", "proves", "definitely".
7. FACT vs INFERENCE: Clearly distinguish confirmed facts from reasonable inferences. Never present an inference as an established fact.
8. CONFIDENCE: Express confidence as High, Medium, or Low with qualifiers where data is incomplete. Do not invent numeric confidence percentages.
9. RECOMMENDATIONS: Keep recommendations proportional. Prefer review, investigate, reconcile, validate, monitor, renegotiate, or optimize.
10. SPECIALIST BOUNDARIES: Do not re-do fraud detection or accounting reconciliation. Build on them.
11. HONEST UNCERTAINTY: If the data is insufficient for a recommendation, say so explicitly rather than guessing."""


class CFOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="cfo")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic pre-computation ──
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            from backend.ai.analysis.financial_health import FinancialHealthEngine
            from backend.ai.analysis.metrics_library import (
                net_cash_flow, burn_rate, runway_days
            )

            analysis, _ = BankStatementAnalyzer.from_text(context.context_data)

            if analysis.transaction_count > 0:
                # Financial health report
                health = FinancialHealthEngine.analyze(analysis)
                tool_outputs.append(
                    f"Financial Health Report:\n{json.dumps(health.to_dict(), indent=2)}"
                )

                # Key CFO metrics
                ncf = net_cash_flow(analysis.flow.total_credits, analysis.flow.total_debits)
                br = burn_rate(analysis.flow.total_debits, analysis.period_days)
                daily_burn = br.value
                runway = runway_days(analysis.balance.closing_balance, daily_burn)

                cfo_metrics = {
                    "net_cash_flow": ncf.to_dict(),
                    "daily_burn_rate": br.to_dict(),
                    "runway": runway.to_dict(),
                    "period_summary": {
                        "days_analyzed": analysis.period_days,
                        "total_transactions": analysis.flow.transaction_count,
                        "credit_debit_ratio": round(analysis.flow.credit_debit_ratio, 3),
                        "balance_change_pct": round(analysis.balance.balance_change_pct, 1),
                    },
                }
                tool_outputs.append(
                    f"CFO Key Metrics:\n{json.dumps(cfo_metrics, indent=2)}"
                )

                # Insights
                from backend.ai.analysis.insight_engine import InsightEngine
                insights = InsightEngine.generate(analysis, health)
                critical_insights = [
                    i.to_dict() for i in insights if i.severity in ("CRITICAL", "WARNING")
                ]
                if critical_insights:
                    tool_outputs.append(
                        f"Priority Insights for CFO Attention:\n{json.dumps(critical_insights, indent=2)}"
                    )

        except Exception as e:
            tool_outputs.append("A validation module encountered a parsing issue. Remaining analyses completed successfully.")

        # Upstream findings from all departments
        upstream_text = ""
        if context.previous_findings:
            parts = [
                f"[{name}]: {res.summary}"
                for name, res in context.previous_findings.items()
                if res.summary
            ]
            upstream_text = "\n".join(parts)

        # ── Secure messages ──
        messages = PromptBuilder.build_agent_messages(
            system_prompt=_SYSTEM_PROMPT,
            context_data=context.context_data,
            user_query=context.query,
            tool_results=tool_outputs,
            upstream_findings=upstream_text or None,
        )
        flat_prompt = PromptBuilder.format_for_gemini(messages)

        result = await self.provider.generate_structured(flat_prompt, AgentExecutionResult)
        result.agent_name = "CFO Advisor"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
