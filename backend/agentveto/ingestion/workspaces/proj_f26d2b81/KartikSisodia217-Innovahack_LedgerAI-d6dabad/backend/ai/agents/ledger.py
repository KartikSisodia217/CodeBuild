"""
Ledger Agent — Phase 6
Pre-computes balance verification, journal validation, and trial balance checks.
LLM explains discrepancies found by deterministic tools.
"""
from typing import Dict, Any
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.ledger import AccountingOutput
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.extractors.ledger import LedgerExtractor
from backend.ai.tools.ledger import LedgerTools
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Lead Ledger Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: ledger reconciliation, journal verification, debit/credit validation, and balance verification.
Act strictly as a professional accountant. Never use generic greetings.

STRICT RULES:
1. DETERMINISTIC-FIRST: Reference the Tool Outputs section — these are computed balance checks, not estimates.
2. EVIDENCE: Cite specific journal entries, account names, or debit/credit amounts from the context.
3. SPECIALIST BOUNDARIES: Do not perform fraud detection or financial ratio analysis.
4. ACCURACY: If debits ≠ credits, flag the exact difference. Never round or approximate accounting discrepancies.
5. NO HALLUCINATION: If the ledger data is insufficient to verify a balance, say so explicitly."""


class LedgerAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="ledger")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        prompt = self.prompt_manager.load_prompt(self.agent_name, raw_text=state.raw_text)
        result = await self.provider.generate_structured(prompt, AccountingOutput)
        return {"accounting_draft": result}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()

        # ── Deterministic pre-computation ──
        tool_outputs = []

        # Standard ledger extraction and validation
        ledger_data = LedgerExtractor.extract(context.context_data)
        tool_outputs.append(LedgerTools.validate_balance(ledger_data))

        # Bank statement balance verification (if applicable)
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            analysis, transactions = BankStatementAnalyzer.from_text(context.context_data)

            if transactions:
                # Verify: Opening + Credits - Debits = Closing
                opening = analysis.balance.opening_balance
                total_credits = analysis.flow.total_credits
                total_debits = analysis.flow.total_debits
                computed_closing = opening + total_credits - total_debits
                stated_closing = analysis.balance.closing_balance
                discrepancy = abs(computed_closing - stated_closing)

                balance_check = {
                    "opening_balance": round(opening, 2),
                    "total_credits": round(total_credits, 2),
                    "total_debits": round(total_debits, 2),
                    "computed_closing": round(computed_closing, 2),
                    "stated_closing": round(stated_closing, 2),
                    "discrepancy": round(discrepancy, 2),
                    "is_reconciled": discrepancy < 1.0,
                    "formula": "Opening + Credits − Debits = Closing",
                    "interpretation": (
                        "Balance reconciles to within ₹1.00 tolerance."
                        if discrepancy < 1.0
                        else f"RECONCILIATION DISCREPANCY: ₹{discrepancy:,.2f} unaccounted. Requires investigation."
                    ),
                }
                tool_outputs.append(
                    f"Balance Reconciliation Check:\n{json.dumps(balance_check, indent=2)}"
                )

                # Transaction count validation
                credit_count = analysis.flow.credit_count
                debit_count = analysis.flow.debit_count
                tool_outputs.append(
                    f"Transaction Count: {analysis.flow.transaction_count} total "
                    f"({credit_count} credits, {debit_count} debits)"
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
        result.agent_name = "Ledger Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
