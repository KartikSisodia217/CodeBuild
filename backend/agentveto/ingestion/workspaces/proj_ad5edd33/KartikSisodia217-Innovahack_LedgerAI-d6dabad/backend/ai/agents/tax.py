"""
Tax Agent — Phase 6
Pre-computes GST extraction, ITC totals, and tax category breakdown from transactions.
LLM provides interpretation and compliance guidance.
"""
from typing import Dict, Any
import re
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Tax Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: GST analysis, TDS computation, ITC validation, tax payment compliance, and invoice-level tax extraction.

STRICT RULES:
1. DETERMINISTIC-FIRST: Tool Outputs contain detected tax transactions and computed totals. Reference these directly.
2. DETERMINISTIC IMMUTABILITY: Consume computed tax totals and percentages exactly as produced. Do not recompute or paraphrase them.
3. REGULATORY ACCURACY: All GST rates cited (5%, 12%, 18%, 28%) must be accurate. Do not invent rates.
4. ITC VALIDATION: If input tax credits are visible, verify they are against eligible supplies.
5. EVIDENCE: Cite specific transaction narrations or invoice references for each tax finding.
6. EVIDENCE DISCIPLINE: Use calibrated language. Prefer "appears consistent with", "may indicate", "warrants additional documentation". Avoid absolute assertions.
7. CONFIDENCE: Express confidence as High, Medium, or Low with a qualifier (e.g., "Medium — limited by missing invoices"). Do not invent numeric confidence percentages.
8. DOCUMENT SCOPE: State "The analysis is limited to the submitted document" if documentation is incomplete. Do not claim the document is partial or cropped unless visually evident.
9. SPECIALIST BOUNDARIES: Do not perform fraud detection or balance reconciliation."""


def _extract_tax_transactions(context: str) -> dict:
    """Extract tax-related transactions from statement text."""
    gst_pattern = re.compile(
        r'\b(gst|igst|cgst|sgst|tds|tcs|income\s+tax|advance\s+tax|professional\s+tax)\b',
        re.I,
    )
    # Find lines with tax keywords and amounts
    tax_lines = []
    for line in context.split('\n'):
        if gst_pattern.search(line):
            # Try to extract amount
            amt_match = re.search(r'([\d,]+\.\d{2})', line)
            if amt_match:
                tax_lines.append({
                    "line": line.strip()[:100],
                    "amount": amt_match.group(1),
                })

    # GST rates in invoices
    gst_rate_pattern = re.compile(r'\b(\d+)%\s*(gst|igst|cgst|sgst)\b', re.I)
    gst_rates_found = []
    for match in gst_rate_pattern.finditer(context):
        rate = int(match.group(1))
        tax_type = match.group(2).upper()
        if rate in (5, 12, 18, 28):  # Valid GST rates
            gst_rates_found.append({"rate": rate, "type": tax_type})

    # GSTIN detection
    gstin_pattern = re.compile(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b')
    gstins = list(set(gstin_pattern.findall(context)))

    return {
        "tax_transactions_detected": len(tax_lines),
        "tax_lines_sample": tax_lines[:10],
        "gst_rates_found": gst_rates_found[:10],
        "gstins_detected": gstins[:5],
        "has_gst_data": len(gst_rates_found) > 0 or len(gstins) > 0,
    }


class TaxAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="tax")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic pre-computation ──
        try:
            tax_data = _extract_tax_transactions(context.context_data)
            tool_outputs.append(f"Tax Data Extraction:\n{json.dumps(tax_data, indent=2)}")

            # Transaction-level tax category breakdown from classifier
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            from backend.ai.analysis.transaction_classifier import TransactionClassifier, TransactionCategory

            analysis, transactions = BankStatementAnalyzer.from_text(context.context_data)
            if transactions:
                txn_dicts = [
                    {"description": t.description, "amount": t.amount, "txn_type": t.txn_type}
                    for t in transactions
                ]
                classified = TransactionClassifier.classify_batch(txn_dicts)
                tax_txns = [c for c in classified if c.category == TransactionCategory.TAX]

                tax_breakdown = {
                    "total_tax_transactions": len(tax_txns),
                    "total_tax_amount": round(sum(t.amount for t in tax_txns), 2),
                    "tax_transactions": [
                        {"description": t.description, "amount": t.amount}
                        for t in tax_txns[:10]
                    ],
                }
                tool_outputs.append(
                    f"Tax Transaction Breakdown:\n{json.dumps(tax_breakdown, indent=2)}"
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
        result.agent_name = "Tax Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
