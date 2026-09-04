import json
from typing import Dict, Any, List
from backend.ai.providers.factory import ProviderFactory
from backend.ai.schemas.execution import ExecutionReport
from backend.observability.logger import StructuredLogger

logger = StructuredLogger("Synthesizer")

class ResponseSynthesizer:
    def __init__(self):
        self.provider = ProviderFactory.get_provider("gemini")

    def _determine_response_mode(self, report: ExecutionReport) -> str:
        """
        Determines the optimal response mode (conversational vs executive_report)
        based on prioritized signals to ensure adaptive formatting.
        Priority:
        1. Document presence / RAG retrieval
        2. Intent classification
        3. Multi-specialist orchestration
        4. Task complexity / Execution metadata
        5. Default -> Conversational Mode
        """
        # 1. Document presence / RAG retrieval
        if report.intent == "Document":
            return "executive_report"
            
        # 2. Intent classification (analytical tasks)
        analytical_intents = {
            "Audit", "Fraud", "Risk", "Compliance", 
            "Legal", "CFO", "Forecasting", "Financial", "Invoice"
        }
        if report.intent in analytical_intents:
            return "executive_report"
            
        # 3. Multi-specialist orchestration
        if len(report.selected_specialists) > 1:
            return "executive_report"
            
        # 4. Task complexity & Execution metadata
        if len(report.errors) > 0 or len(report.cross_validation_flags) > 0:
            return "executive_report"
            
        # 5. Default to Conversational Mode
        return "conversational"

    async def synthesize(self, query: str, report: ExecutionReport) -> ExecutionReport:
        """
        Takes the full ExecutionReport, synthesizes the successful outputs,
        acknowledges failures, and returns the augmented report.
        Automatically chooses between Conversational and Executive Report modes.
        """
        logger.debug("Synthesis_Start", trace_id=report.execution_trace_id)

        if report.execution_mode == "planning":
            # Just return a planning response
            report.synthesis_result = {
                "text": "Based on your request, LedgerAI will construct an Execution Plan routing through the specialized departments in sequence to analyze this task without executing it yet. View the trace below.",
                "chartData": []
            }
            return report

        # Only pass SUCCESSFUL results to the Lead Partner
        successful_outputs = {}
        for agent, res in report.execution_graph.items():
            if res.status.value == "COMPLETED":
                successful_outputs[agent] = res.model_dump()

        response_mode = self._determine_response_mode(report)
        logger.info(f"Selected Response Mode: {response_mode}", trace_id=report.execution_trace_id)

        if response_mode == "conversational":
            prompt = f"""You are the Lead Partner of LedgerAI, a premium AI Accounting Firm.
You have delegated a user's request to your specialized departments.
They have provided the following internal analyses, including findings, evidence, tool outputs, and confidence assessments.

User Request: {query}

Internal Department Analyses (JSON):
{json.dumps(successful_outputs, indent=2)}

Known Execution Errors (You MUST acknowledge missing analysis if this list is not empty):
{json.dumps(report.errors, indent=2)}

=== SYNTHESIS RULES (Conversational Mode) ===
1. Return a natural, conversational response. Do NOT force report sections, headings, or bullet points unless absolutely necessary for clarity.
2. Answer the user directly, concisely, and professionally.
3. If appropriate, optionally and briefly mention which specialist(s) contributed to the findings.
4. DETERMINISTIC IMMUTABILITY: Every computed value (balance, total, percentage, reconciliation figure, transaction count) from the specialist outputs must be reproduced exactly as provided. Do NOT recompute, paraphrase, or modify any deterministic calculation.
5. Communicate confidence naturally within the text when appropriate rather than emitting a dedicated "Final Confidence Level" section.

CRITICAL: Your final output MUST NOT contain any backend or implementation details. Do NOT use phrases like "Successfully fetched data" or "The database shows". Just deliver the final professional answer directly.

You MUST respond with a raw JSON object (NO Markdown formatting, NO ```json) matching this exact schema:
{{
  "text": "Your synthesized conversational answer to the user.",
  "chartData": [
     {{ "label": "String", "value": 100 }}
  ],
  "final_confidence_level": "Medium"
}}
"""
        else:
            prompt = f"""You are the Lead Partner of LedgerAI, a premium AI Accounting Firm.
You have delegated a user's request to your specialized departments.
They have provided the following internal analyses, including findings, evidence, tool outputs, and confidence assessments.

User Request: {query}

Internal Department Analyses (JSON):
{json.dumps(successful_outputs, indent=2)}

Known Execution Errors (You MUST acknowledge missing analysis if this list is not empty):
{json.dumps(report.errors, indent=2)}

Synthesize these findings into ONE cohesive, professional executive report directed to the user.
DO NOT simply concatenate their responses. Merge the knowledge fluidly as if the firm is speaking with one voice.

=== SYNTHESIS RULES (Executive Report Mode) ===
1. DETERMINISTIC IMMUTABILITY: Every computed value (balance, total, percentage, reconciliation figure, transaction count) from the specialist outputs must be reproduced exactly as provided. Do NOT recompute, paraphrase, or modify any deterministic calculation.
2. FACTS vs INFERENCES: Maintain strict separation.
3. CONFIDENCE: Express final confidence formally (High, Medium, or Low).
4. DYNAMIC SECTIONS: Assemble the report dynamically. EVERY section is optional.
   CRITICAL: ONLY include sections that are actually relevant. Do NOT generate empty headings or placeholder text.
   For example:
   - Omit "Financial Metrics" if no metrics exist.
   - Omit "Cross-Validation and Disagreements" if only one specialist participated or there are no disagreements.
   - Omit "Execution Failures" if no failures occurred.
   - Omit "Supporting Evidence" if there is no meaningful evidence beyond reasoning.
5. FORMATTING: The final report must be clean professional text. Do NOT use Markdown emphasis (**bold**, __underline__), Markdown bullets intended for LLM formatting, or raw Markdown headers (#, ##). Use plain headings and plain bullets only.

Your report MUST resemble work produced by a professional accounting firm. Make it purposeful rather than template-driven.

CRITICAL: Your final output MUST NOT contain any backend or implementation details.

You MUST respond with a raw JSON object (NO Markdown formatting, NO ```json) matching this exact schema:
{{
  "text": "Your synthesized executive report to the user.",
  "chartData": [
     {{ "label": "String", "value": 100 }}
  ],
  "final_confidence_level": "High"
}}
"""

        try:
            reply_text = await self.provider.generate_text(prompt)
            reply_json = json.loads(reply_text.strip().removeprefix("```json").removesuffix("```").strip())
            report.final_confidence = reply_json.get("final_confidence_level", "Medium")
            report.synthesis_result = reply_json
            logger.info("Synthesis_Success", trace_id=report.execution_trace_id, final_confidence=report.final_confidence)
        except Exception as e:
            logger.error("Synthesis_Failed", error=str(e), trace_id=report.execution_trace_id)
            report.synthesis_result = {
                "text": "A validation module encountered a parsing issue. The report could not be fully synthesized. Please try again or contact support if the issue persists.",
                "chartData": []
            }

        return report
