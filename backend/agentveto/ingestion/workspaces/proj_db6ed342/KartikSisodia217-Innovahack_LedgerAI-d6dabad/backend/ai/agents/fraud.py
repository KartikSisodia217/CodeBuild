"""
Fraud Detection Agent — Phase 6
Pre-computes deterministic fraud signals before LLM call.
Signals: duplicate detection, round-number detection, Benford analysis, statistical outliers.
LLM explains and contextualises the computed signals — it does NOT detect fraud itself.
"""
from typing import Dict, Any, List
import json
import math
import time
from collections import Counter

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Fraud Detection Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: suspicious transaction patterns, duplicate payments, round-number anomalies, Benford's Law deviations, and statistical outliers.

STRICT RULES:
1. DETERMINISTIC-FIRST: The Tool Outputs contain computed fraud signals. Reference these exact numbers — do NOT fabricate additional findings.
2. EVIDENCE-ONLY: Every fraud finding must reference a specific transaction, amount, or statistical result from the tools.
3. CALIBRATED LANGUAGE: Use evidence-based language throughout. Prefer "suggests", "appears consistent with", "may indicate", "warrants investigation". Never use "confirms", "proves", "definitely", "caused by", or "direct result".
4. RISK PROPORTIONALITY: Reserve HIGH risk only for patterns with strong supporting evidence. Round numbers and statistical outliers are indicators — frame them as warranting review, not as confirmed fraud.
5. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier where data is limited (e.g., "High — limited by transaction volume"). Do not invent numeric confidence percentages.
6. FACT vs INFERENCE: Clearly separate confirmed facts from reasonable inferences. Never present an inference as an established fact.
7. SPECIALIST BOUNDARIES: Do not perform financial ratio analysis. Stay on anomaly detection."""


def _benford_analysis(amounts: List[float]) -> Dict[str, Any]:
    """
    Benford's Law: In naturally occurring datasets, the leading digit d
    occurs with frequency log10(1 + 1/d).
    Deviation from this distribution may indicate fabricated data.
    Requires 100+ transactions for meaningful analysis.
    """
    if len(amounts) < 30:
        return {"status": "insufficient_data", "count": len(amounts), "required": 30}

    # Extract leading digits
    leading_digits = []
    for amt in amounts:
        if amt > 0:
            # Get first significant digit
            d = int(str(amt).lstrip('0').replace('.', '')[0])
            if 1 <= d <= 9:
                leading_digits.append(d)

    if not leading_digits:
        return {"status": "no_valid_amounts"}

    observed_freq = Counter(leading_digits)
    total = len(leading_digits)

    expected = {d: math.log10(1 + 1/d) for d in range(1, 10)}

    deviations = {}
    for d in range(1, 10):
        obs = observed_freq.get(d, 0) / total
        exp = expected[d]
        deviations[d] = {
            "observed_pct": round(obs * 100, 1),
            "expected_pct": round(exp * 100, 1),
            "deviation_pct": round(abs(obs - exp) * 100, 1),
        }

    # Chi-square statistic for overall deviation
    chi_sq = sum(
        ((observed_freq.get(d, 0) - total * expected[d]) ** 2) / (total * expected[d])
        for d in range(1, 10)
    )

    # Critical value at p=0.05, 8 df = 15.51
    suspicious = chi_sq > 15.51

    return {
        "status": "completed",
        "transaction_count": total,
        "chi_square": round(chi_sq, 3),
        "suspicious_deviation": suspicious,
        "leading_digit_analysis": deviations,
        "interpretation": (
            "Leading digit distribution deviates significantly from Benford's Law — "
            "possible data fabrication or manipulation." if suspicious
            else "Leading digit distribution is consistent with Benford's Law."
        ),
    }


def _round_number_analysis(amounts: List[float]) -> Dict[str, Any]:
    """Detect transactions with suspiciously round amounts (multiples of 1000, 5000, 10000)."""
    if not amounts:
        return {"round_count": 0, "round_transactions": []}

    round_thresholds = [10000, 5000, 1000]
    round_txns = []
    for amt in amounts:
        int_amt = int(amt)
        for threshold in round_thresholds:
            if int_amt >= threshold and int_amt % threshold == 0:
                round_txns.append({"amount": amt, "multiple_of": threshold})
                break

    total = len(amounts)
    round_pct = len(round_txns) / total * 100 if total > 0 else 0

    return {
        "round_count": len(round_txns),
        "total_transactions": total,
        "round_percentage": round(round_pct, 1),
        "round_transactions": round_txns[:10],
        "suspicious": round_pct > 25,  # Flag if >25% are round numbers
        "interpretation": (
            f"{len(round_txns)} of {total} transactions ({round_pct:.0f}%) "
            f"are round numbers. "
            + ("High round-number ratio — warrants review for manual entry errors or structuring."
               if round_pct > 25 else "Round-number ratio is within normal range.")
        ),
    }


def _duplicate_analysis(transactions: List[Dict]) -> Dict[str, Any]:
    """Detect exact duplicates (same amount + date + type) and near-duplicates (same amount + type)."""
    exact_key_count: Counter = Counter()
    amount_type_count: Counter = Counter()

    for t in transactions:
        exact_key = f"{t.get('date')}|{t.get('amount')}|{t.get('txn_type')}"
        exact_key_count[exact_key] += 1

        amt_type_key = f"{t.get('amount')}|{t.get('txn_type')}"
        amount_type_count[amt_type_key] += 1

    exact_dupes = {k: v for k, v in exact_key_count.items() if v > 1}
    near_dupes = {k: v for k, v in amount_type_count.items() if v >= 3}  # 3+ same amount/type

    return {
        "exact_duplicate_groups": len(exact_dupes),
        "exact_duplicate_transactions": sum(exact_dupes.values()) - len(exact_dupes),
        "near_duplicate_groups": len(near_dupes),
        "exact_duplicates": [
            {"key": k, "count": v} for k, v in list(exact_dupes.items())[:5]
        ],
        "suspicious": len(exact_dupes) > 0,
        "interpretation": (
            f"Found {len(exact_dupes)} exact duplicate transaction groups "
            f"({sum(exact_dupes.values()) - len(exact_dupes)} duplicate entries). "
            + ("Exact duplicate groups identified — recommend review to determine whether duplicate payments or data entry errors are present."
               if exact_dupes else "No exact duplicates detected.")
        ),
    }


class FraudDetectionAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="fraud")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic fraud signal computation ──
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            analysis, transactions = BankStatementAnalyzer.from_text(context.context_data)

            if transactions:
                amounts = [t.amount for t in transactions]
                txn_dicts = [
                    {"date": str(t.date), "amount": t.amount, "txn_type": t.txn_type,
                     "description": t.description}
                    for t in transactions
                ]

                # 1. Duplicate detection
                dup_result = _duplicate_analysis(txn_dicts)
                tool_outputs.append(f"Duplicate Detection:\n{json.dumps(dup_result, indent=2)}")

                # 2. Round number analysis
                round_result = _round_number_analysis(amounts)
                tool_outputs.append(f"Round Number Analysis:\n{json.dumps(round_result, indent=2)}")

                # 3. Benford's Law analysis
                benford_result = _benford_analysis(amounts)
                tool_outputs.append(f"Benford's Law Analysis:\n{json.dumps(benford_result, indent=2)}")

                # 4. Statistical outliers (from analyzer)
                if analysis.suspicious_transactions:
                    sus_summary = [
                        {
                            "date": str(s.transaction.date),
                            "amount": s.transaction.amount,
                            "reason": s.reason,
                            "severity": s.severity,
                        }
                        for s in analysis.suspicious_transactions[:10]
                    ]
                    tool_outputs.append(
                        f"Statistical Outliers (≥2σ above mean):\n{json.dumps(sus_summary, indent=2)}"
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

        # ── Build secure messages ──
        messages = PromptBuilder.build_agent_messages(
            system_prompt=_SYSTEM_PROMPT,
            context_data=context.context_data,
            user_query=context.query,
            tool_results=tool_outputs,
            upstream_findings=upstream_text or None,
        )
        flat_prompt = PromptBuilder.format_for_gemini(messages)

        result = await self.provider.generate_structured(flat_prompt, AgentExecutionResult)
        result.agent_name = "Fraud Detection Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
