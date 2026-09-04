"""
Prompt Builder — Phase 6
Enforces strict message separation to prevent prompt injection.
User-controlled text (document content, query) is always isolated from system instructions.
"""
from __future__ import annotations

import re
from typing import List, Dict, Optional


# Patterns that could be injection attempts in user-controlled text
_INJECTION_PATTERNS = [
    re.compile(r'\[SYSTEM\]', re.I),
    re.compile(r'\[INST\]', re.I),
    re.compile(r'<\|im_start\|>', re.I),
    re.compile(r'<\|im_end\|>', re.I),
    re.compile(r'ignore (all )?(previous|prior|above) instructions?', re.I),
    re.compile(r'you are now', re.I),
    re.compile(r'new instruction:', re.I),
    re.compile(r'disregard (all )?(previous|prior)', re.I),
    re.compile(r'forget (all )?(previous|prior)', re.I),
    re.compile(r'act as', re.I),
    re.compile(r'roleplay as', re.I),
    re.compile(r'pretend (you are|to be)', re.I),
]

# Replacement tag for detected injection content
_REDACTION_TAG = "[CONTENT REDACTED: POTENTIAL INJECTION]"


class PromptBuilder:
    """
    Builds structured message arrays for LLM providers.
    Separates: System | Context | Tool Results | User Query
    Sanitizes user-controlled text before injection into messages.
    """

    @staticmethod
    def sanitize(text: str) -> str:
        """
        Remove or neutralize prompt injection patterns from user-controlled text.
        Applied to: document content, transaction narrations, user queries.
        """
        if not text:
            return text
        for pattern in _INJECTION_PATTERNS:
            text = pattern.sub(_REDACTION_TAG, text)
        return text

    @classmethod
    def build_agent_messages(
        cls,
        system_prompt: str,
        context_data: str,
        user_query: str,
        tool_results: Optional[List[str]] = None,
        upstream_findings: Optional[str] = None,
    ) -> List[Dict[str, str]]:
        """
        Build a structured message list for agent execution.
        
        Message roles:
        - system: Immutable agent instructions (trusted)
        - user (context): Retrieved document content (sanitized)
        - user (tools): Deterministic tool outputs (trusted — computed internally)
        - user (query): The actual user question (sanitized)
        
        Returns a list of {role, content} dicts compatible with LangChain message format.
        """
        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Context (RAG retrieved docs or OCR text) — sanitized
        if context_data and context_data.strip():
            sanitized_context = cls.sanitize(context_data)
            messages.append({
                "role": "user",
                "content": (
                    f"[DOCUMENT CONTEXT — extracted from uploaded document]\n"
                    f"{sanitized_context}\n"
                    f"[END DOCUMENT CONTEXT]"
                ),
            })

        # Upstream specialist findings — trusted internal data
        if upstream_findings and upstream_findings.strip():
            messages.append({
                "role": "user",
                "content": (
                    f"[UPSTREAM SPECIALIST FINDINGS — internal, trusted]\n"
                    f"{upstream_findings}\n"
                    f"[END UPSTREAM FINDINGS]"
                ),
            })

        # Deterministic tool outputs — trusted, computed internally
        if tool_results:
            tool_text = "\n".join(f"• {r}" for r in tool_results if r)
            if tool_text.strip():
                messages.append({
                    "role": "user",
                    "content": (
                        f"[DETERMINISTIC TOOL OUTPUTS — computed, not estimated]\n"
                        f"{tool_text}\n"
                        f"[END TOOL OUTPUTS]"
                    ),
                })

        # User query — sanitized
        sanitized_query = cls.sanitize(user_query)
        messages.append({
            "role": "user",
            "content": f"[USER QUERY]\n{sanitized_query}",
        })

        return messages

    @classmethod
    def build_synthesis_messages(
        cls,
        query: str,
        specialist_outputs: str,
        errors: str,
    ) -> List[Dict[str, str]]:
        """Build messages for the Lead Partner synthesis call."""
        system = (
            "You are the Lead Partner of LedgerAI, a premium AI Accounting Firm. "
            "You synthesize findings from specialist departments into a professional, "
            "cohesive client-facing report. You never fabricate data. "
            "You always cite the specialists' findings and evidence. "
            "You never introduce yourself or use generic filler phrases. "
            "You deliver clean professional text suitable for direct export to PDF — no Markdown emphasis or formatting artifacts."
        )
        messages = [{"role": "system", "content": system}]

        messages.append({
            "role": "user",
            "content": (
                f"[SPECIALIST ANALYSES — internal findings from departments]\n"
                f"{specialist_outputs}\n"
                f"[END SPECIALIST ANALYSES]"
            ),
        })

        if errors.strip() and errors != "[]":
            messages.append({
                "role": "user",
                "content": f"[EXECUTION FAILURES — acknowledge these gaps]\n{errors}\n[END FAILURES]",
            })

        sanitized_query = cls.sanitize(query)
        messages.append({
            "role": "user",
            "content": (
                f"[CLIENT REQUEST]\n{sanitized_query}\n[END CLIENT REQUEST]\n\n"
                "Now synthesize the specialist findings into ONE cohesive professional response. "
                "Merge the knowledge fluidly. Cite evidence explicitly. "
                "Follow these synthesis rules:\n"
                "1. DETERMINISTIC IMMUTABILITY: Reproduce every computed value (balance, total, percentage, count) exactly as provided by the specialists. Do NOT recompute or paraphrase them.\n"
                "2. FACTS vs INFERENCES: Maintain strict separation. Never present an inference as an established fact.\n"
                "3. EVIDENCE DISCIPLINE: Use calibrated language — prefer suggests, appears consistent with, may indicate. Avoid confirms, proves, definitely, caused by.\n"
                "4. CONFIDENCE: Express final confidence as High, Medium, or Low with a qualifier — do not produce a numeric percentage.\n"
                "5. FORMATTING: Deliver clean professional text. No Markdown bold (**), no Markdown underline (__), no Markdown hash headers. Plain headings and plain bullets only.\n"
                "6. TOOL WORDING: Use generic terms such as Internal analysis identified or Transaction comparison identified. Do not reference or invent named backend systems.\n\n"
                "Structure if applicable: Executive Summary | Overview | Department Findings | "
                "Cross-Validation | Execution Failures | Evidence | Financial Metrics | "
                "Risk Assessment | Recommendations | Appendix.\n\n"
                "CRITICAL: Do NOT include implementation details. "
                "Deliver the professional answer directly.\n\n"
                "Respond with raw JSON (no markdown):\n"
                '{"text": "...", "chartData": [...], "final_confidence_level": "High"}'
            ),
        })

        return messages

    @classmethod
    def format_for_gemini(cls, messages: List[Dict[str, str]]) -> str:
        """
        Flatten structured messages to a single prompt string for LangChain Gemini.
        Preserves role separation through clear section markers.
        This is used when the provider doesn't support native multi-turn yet.
        """
        parts = []
        for msg in messages:
            role = msg["role"].upper()
            content = msg["content"]
            if role == "SYSTEM":
                parts.append(f"=== SYSTEM INSTRUCTIONS (IMMUTABLE) ===\n{content}\n===")
            else:
                parts.append(content)
        return "\n\n".join(parts)
