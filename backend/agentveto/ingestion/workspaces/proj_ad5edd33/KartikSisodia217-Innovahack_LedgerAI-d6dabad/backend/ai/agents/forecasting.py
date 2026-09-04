"""
Forecasting Agent — Phase 6
Pre-computes linear regression on balance/flow time series for projections.
LLM generates narrative forecasts grounded in computed trend lines.
"""
from typing import Dict, Any, List
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Forecasting Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: cash flow projections, revenue trend extrapolation, balance trajectory forecasting.
Speak as a financial planning analyst.

STRICT RULES:
1. DETERMINISTIC-FIRST: The Tool Outputs contain computed trend lines and projections. Reference these numbers.
2. DETERMINISTIC IMMUTABILITY: Consume computed slopes, intercepts, and projected values exactly as produced. Do not recompute them.
3. SCENARIO-BASED: Present base case (trend continues), upside, and downside scenarios.
4. HONEST UNCERTAINTY: Always specify the forecast horizon and the assumption that current trends hold. Projections are not guarantees.
5. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "suggests", "appears consistent with", "if current trends continue", "may indicate". Avoid asserting future outcomes as certain.
6. CONFIDENCE: Express confidence as High, Medium, or Low. A projection based on limited monthly data should be qualified (e.g., "Low — limited by short observation window").
7. FACT vs INFERENCE: Clearly distinguish historical facts from trend-based projections.
8. SPECIALIST BOUNDARIES: Do not perform audit sampling or fraud detection."""


def _linear_regression(x: List[float], y: List[float]) -> dict:
    """
    Simple linear regression: y = mx + b
    Returns slope, intercept, R².
    """
    n = len(x)
    if n < 2:
        return {"status": "insufficient_data", "required": 2}

    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi**2 for xi in x)

    denom = n * sum_x2 - sum_x**2
    if denom == 0:
        return {"status": "degenerate_data"}

    m = (n * sum_xy - sum_x * sum_y) / denom
    b = (sum_y - m * sum_x) / n

    # R²
    y_mean = sum_y / n
    ss_tot = sum((yi - y_mean)**2 for yi in y)
    y_pred = [m * xi + b for xi in x]
    ss_res = sum((yi - ypi)**2 for yi, ypi in zip(y, y_pred))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0

    return {
        "slope": round(m, 4),
        "intercept": round(b, 4),
        "r_squared": round(r2, 4),
        "interpretation": (
            f"Trend: {'increasing' if m > 0 else 'decreasing'} at "
            f"₹{abs(m):,.2f}/period. R² = {r2:.3f} "
            f"({'strong' if r2 > 0.7 else 'moderate' if r2 > 0.4 else 'weak'} fit)."
        ),
    }


class ForecastingAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="forecasting")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic pre-computation ──
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer

            analysis, _ = BankStatementAnalyzer.from_text(context.context_data)

            if analysis.monthly_flows and len(analysis.monthly_flows) >= 2:
                months = analysis.monthly_flows

                # Monthly net flow trend
                x = list(range(len(months)))
                net_vals = [m.net for m in months]
                credit_vals = [m.credits for m in months]
                debit_vals = [m.debits for m in months]

                net_trend = _linear_regression(x, net_vals)
                credit_trend = _linear_regression(x, credit_vals)
                debit_trend = _linear_regression(x, debit_vals)

                # 3-month forward projections
                n = len(months)
                forward_months = []
                for i in range(1, 4):
                    projected_net = net_trend.get("slope", 0) * (n + i - 1) + net_trend.get("intercept", 0)
                    forward_months.append({
                        "month_offset": f"+{i} months",
                        "projected_net_flow": round(projected_net, 2),
                    })

                tool_outputs.append(
                    f"Monthly Flow Trends (Linear Regression):\n"
                    f"Net Flow Trend: {json.dumps(net_trend, indent=2)}\n"
                    f"Credit Trend: {json.dumps(credit_trend, indent=2)}\n"
                    f"Debit Trend: {json.dumps(debit_trend, indent=2)}"
                )

                tool_outputs.append(
                    f"3-Month Forward Projections (if trend holds):\n"
                    f"{json.dumps(forward_months, indent=2)}"
                )

                # Historical monthly table
                monthly_table = [
                    {
                        "month": m.label,
                        "credits": round(m.credits, 2),
                        "debits": round(m.debits, 2),
                        "net": round(m.net, 2),
                    }
                    for m in months
                ]
                tool_outputs.append(
                    f"Historical Monthly Data:\n{json.dumps(monthly_table, indent=2)}"
                )

                # Burn rate and runway
                daily_burn = analysis.flow.total_debits / max(analysis.period_days, 1)
                runway_est = analysis.balance.closing_balance / daily_burn if daily_burn > 0 else float("inf")
                tool_outputs.append(
                    f"Runway Estimate: {runway_est:.0f} days at current burn rate of "
                    f"₹{daily_burn:,.2f}/day"
                )

            elif analysis.transaction_count > 0:
                tool_outputs.append(
                    f"Insufficient monthly data for trend analysis "
                    f"({len(analysis.monthly_flows)} months detected). "
                    f"Minimum 2 months required."
                )

        except Exception as e:
            tool_outputs.append("A validation module encountered a parsing issue. Remaining analyses completed successfully.")

        # Upstream findings
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
        result.agent_name = "Forecasting Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
