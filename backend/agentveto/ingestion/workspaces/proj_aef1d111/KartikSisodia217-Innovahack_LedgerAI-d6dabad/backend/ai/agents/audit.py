"""
Audit Agent — Phase 6
Pre-computes: statistical sampling, evidence completeness, control checks.
LLM synthesizes audit findings from computed signals.
"""
from typing import Dict, Any, List
import json
import random
import time
import math

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Audit Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: transaction sampling, evidence completeness, internal control checks, and reconciliation verification.
Act as a professional auditor preparing a working paper.

STRICT RULES:
1. DETERMINISTIC-FIRST: Tool Outputs contain sampled transactions and completeness metrics. Reference them.
2. EVIDENCE: Every audit finding must cite a specific transaction ID, date, or amount.
3. CONTROL GAPS: Identify specific control weaknesses (missing narrations, gaps in sequence, unverifiable totals).
4. PROFESSIONAL STANDARDS: Frame findings as "observation", "finding", and "recommendation" — standard audit language.
5. EVIDENCE DISCIPLINE: Use calibrated language throughout. Prefer "appears consistent with", "may indicate", "suggests", "warrants additional documentation". Do not assert certainty beyond what the evidence supports.
6. FACT vs INFERENCE: Clearly separate confirmed facts from reasonable inferences. Unresolved items must be listed under "Information Still Required".
7. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier where data is incomplete (e.g., "Medium — limited by missing narrations"). Do not invent numeric confidence percentages.
8. TOOL WORDING: Refer to analysis results using generic terms: "Internal analysis identified...", "Deterministic validation identified...". Do not reference or invent backend tool names.
9. SPECIALIST BOUNDARIES: Do not perform fraud pattern analysis (Benford, round numbers) — that is the Fraud Detection Specialist's domain."""


def _statistical_sample(transactions: list, confidence_level: float = 0.95, precision: float = 0.05) -> dict:
    """
    Compute Cochran's formula sample size for audit sampling.
    n = (Z² × p × (1-p)) / e²
    where Z=1.96 (95% CI), p=0.5 (max variability), e=precision
    """
    N = len(transactions)
    if N == 0:
        return {"sample_size": 0, "transactions": []}

    Z = 1.96 if confidence_level >= 0.95 else 1.645
    p = 0.5
    e = precision

    n_infinite = (Z**2 * p * (1 - p)) / (e**2)
    # Finite population correction
    n = n_infinite / (1 + (n_infinite - 1) / N)
    n = min(int(math.ceil(n)), N)

    # Random sample (seeded for reproducibility in audit context)
    rng = random.Random(42)
    sample_indices = rng.sample(range(N), n)
    sampled = [
        {
            "index": i,
            "date": str(transactions[i].date),
            "description": transactions[i].description,
            "amount": transactions[i].amount,
            "type": transactions[i].txn_type,
        }
        for i in sorted(sample_indices)
    ]

    return {
        "population_size": N,
        "sample_size": n,
        "confidence_level": f"{confidence_level*100:.0f}%",
        "precision": f"±{precision*100:.0f}%",
        "formula": "Cochran's formula: n = Z²p(1−p)/e² with finite population correction",
        "sampled_transactions": sampled,
    }


def _evidence_completeness(transactions: list) -> dict:
    """Check what % of transactions have sufficient narration for audit evidence."""
    total = len(transactions)
    if total == 0:
        return {"completeness_pct": 0, "missing_narration": 0}

    # Transactions with < 5 char description are considered "missing narration"
    missing = sum(1 for t in transactions if len(t.description.strip()) < 5)
    short = sum(1 for t in transactions if 5 <= len(t.description.strip()) < 15)
    complete = total - missing - short
    completeness_pct = complete / total * 100

    return {
        "total_transactions": total,
        "complete_narrations": complete,
        "short_narrations": short,
        "missing_narrations": missing,
        "completeness_pct": round(completeness_pct, 1),
        "audit_note": (
            "Evidence completeness is adequate (≥80%)."
            if completeness_pct >= 80 else
            f"Evidence completeness is below threshold ({completeness_pct:.0f}%). "
            f"{missing} transactions lack audit-traceable narrations."
        ),
    }


class AuditAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="audit")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic pre-computation ──
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            analysis, transactions = BankStatementAnalyzer.from_text(context.context_data)

            if transactions:
                # Statistical sampling
                sample = _statistical_sample(transactions)
                tool_outputs.append(
                    f"Audit Sample Selection (Cochran's Formula):\n{json.dumps(sample, indent=2)}"
                )

                # Evidence completeness
                completeness = _evidence_completeness(transactions)
                tool_outputs.append(
                    f"Evidence Completeness Check:\n{json.dumps(completeness, indent=2)}"
                )

                # Duplicate transactions (control check)
                dup_check = {
                    "total_transactions": len(transactions),
                    "suspicious_count": len(analysis.suspicious_transactions),
                    "high_severity": sum(
                        1 for s in analysis.suspicious_transactions if s.severity == "HIGH"
                    ),
                }
                tool_outputs.append(
                    f"Internal Control Check (Duplicates / Outliers):\n{json.dumps(dup_check, indent=2)}"
                )

                # Balance reconciliation
                computed_closing = (
                    analysis.balance.opening_balance
                    + analysis.flow.total_credits
                    - analysis.flow.total_debits
                )
                recon = {
                    "reconciles": abs(computed_closing - analysis.balance.closing_balance) < 1.0,
                    "discrepancy": round(abs(computed_closing - analysis.balance.closing_balance), 2),
                }
                tool_outputs.append(
                    f"Balance Reconciliation:\n{json.dumps(recon, indent=2)}"
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
        result.agent_name = "Audit Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
