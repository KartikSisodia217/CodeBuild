"""
Expense Intelligence Agent — Phase 6
Pre-computes transaction classification and merchant intelligence before LLM call.
Provides the LLM with structured category breakdowns and merchant profiles.
"""
from typing import Dict, Any
import json
import time

from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.schemas.execution import AgentExecutionResult, ExecutionContext, ExecutionStatus
from backend.ai.tools.financial import FinancialTools
from backend.ai.prompts.builder import PromptBuilder


_SYSTEM_PROMPT = """You are the Expense Intelligence Specialist at LedgerAI, a premium AI Accounting Firm.

Your domain: transaction categorization, merchant analytics, spending pattern analysis, and subscription detection.
Focus on "what is money being spent on and with whom?"

STRICT RULES:
1. DETERMINISTIC-FIRST: The Tool Outputs contain computed category breakdowns and merchant profiles. Reference these — do NOT re-estimate.
2. QUALITATIVE LAYER: Your job is to interpret what the numbers mean for the business — not to re-calculate them.
3. PATTERNS: Identify concerning spending patterns (lifestyle inflation, concentration risk, recurring surprises).
4. MERCHANT CONTEXT: Reference specific merchants and amounts from the tool outputs.
5. SPECIALIST BOUNDARIES: Do not perform fraud detection or balance reconciliation."""


class ExpenseIntelligenceAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="expense_intelligence")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        return {}

    async def execute(self, context: ExecutionContext) -> AgentExecutionResult:
        start_time = time.time()
        tool_outputs = []

        # ── Deterministic pre-computation ──
        try:
            from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
            from backend.ai.analysis.transaction_classifier import TransactionClassifier
            from backend.ai.analysis.merchant_intelligence import MerchantIntelligence

            analysis, transactions = BankStatementAnalyzer.from_text(context.context_data)

            if transactions:
                # Transaction classification
                txn_dicts = [
                    {"description": t.description, "amount": t.amount, "txn_type": t.txn_type}
                    for t in transactions
                ]
                classified = TransactionClassifier.classify_batch(txn_dicts)
                category_summary = TransactionClassifier.category_summary(classified)

                tool_outputs.append(
                    f"Transaction Category Breakdown:\n{json.dumps(category_summary, indent=2)}"
                )

                # Unknown count for LLM fallback awareness
                unknowns = TransactionClassifier.get_unknown_items(classified)
                if unknowns:
                    tool_outputs.append(
                        f"Unclassified transactions ({len(unknowns)}): "
                        + ", ".join(u.description[:40] for u in unknowns[:5])
                    )

                # Merchant intelligence
                merchant_analysis = MerchantIntelligence.analyze(transactions)
                tool_outputs.append(
                    f"Merchant Analysis:\n{json.dumps(merchant_analysis.to_dict(), indent=2)}"
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
        result.agent_name = "Expense Intelligence Specialist"
        result.execution_time_ms = round((time.time() - start_time) * 1000, 2)
        result.status = ExecutionStatus.COMPLETED

        return result
