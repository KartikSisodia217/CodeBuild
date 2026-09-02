"""
AgentVeto Deterministic Safety Invariants and Sink Rules
Defines default policy rules for hard boolean evaluation:
- Restricted Financial Sinks
- Destructive State/Database Sinks
- Code & OS Execution Sinks
- Credential & Sensitive Data Sinks (DLP)
"""

import re
from typing import List
from agentveto.schemas import PolicyRule, EvaluationStatus, OWASPThreatCategory

# Default Restricted Sinks that must NEVER be triggered via indirect injection
DEFAULT_POLICY_RULES: List[PolicyRule] = [
    PolicyRule(
        rule_id="RULE-SINK-001",
        name="RESTRICTED_FINANCIAL_SINK_WITHOUT_APPROVAL",
        sink_tool="execute_refund",
        description="Prevents unauthorized refunds, money transfers, or financial transactions triggered without human authorization.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.ASI01_GOAL_HIJACK
    ),
    PolicyRule(
        rule_id="RULE-SINK-002",
        name="UNAUTHORIZED_FUNDS_TRANSFER",
        sink_tool="transfer_funds",
        description="Blocks direct programmatic fund transfers without explicit human confirmation tokens.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.ASI04_UNBOUNDED_ACTION
    ),
    PolicyRule(
        rule_id="RULE-SINK-003",
        name="DESTRUCTIVE_DATABASE_MUTATION",
        sink_tool="delete_database",
        description="Blocks irreversible database drops, table truncation, or bulk record deletions.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.ASI02_TOOL_MISUSE
    ),
    PolicyRule(
        rule_id="RULE-SINK-004",
        name="UNAUTHORIZED_COMMAND_EXECUTION",
        sink_tool="exec_shell",
        description="Blocks execution of arbitrary bash, sh, or powershell system commands.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.ASI02_TOOL_MISUSE
    ),
    PolicyRule(
        rule_id="RULE-SINK-005",
        name="EXTERNAL_CREDENTIAL_EXFILTRATION",
        sink_tool="post_external_webhook",
        description="Prevents sending sensitive context, auth headers, or tokens to external unverified endpoints.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.MCP10_DATA_EXFILTRATION
    ),
    PolicyRule(
        rule_id="RULE-SINK-006",
        name="UNAUTHORIZED_EMAIL_DISPATCH",
        sink_tool="send_email",
        description="Blocks automated dispatch of emails containing tainted recipient addresses or unverified instructions.",
        requires_authorization=True,
        severity=EvaluationStatus.CRITICAL_VETO,
        threat_category=OWASPThreatCategory.ASI01_GOAL_HIJACK
    ),
]

# DLP (Data Loss Prevention) Regex patterns for detecting secret leaks in tool arguments
DLP_PATTERNS = {
    "AWS_ACCESS_KEY": re.compile(r"AKIA[0-9A-Z]{16}"),
    "OPENAI_API_KEY": re.compile(r"sk-(?:proj-)?[a-zA-Z0-9_\-]{20,64}"),
    "GENERIC_BEARER_TOKEN": re.compile(r"bearer\s+[a-zA-Z0-9_\-\.]{24,}", re.IGNORECASE),
    "CREDIT_CARD": re.compile(r"\b(?:\d[ -]*?){13,16}\b"),
    "SSN": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "PRIVATE_KEY_HEADER": re.compile(r"-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----")
}

# Known Untrusted Data Sources that commonly carry Indirect Prompt Injections
KNOWN_DATA_SOURCES = {
    "read_tickets",
    "read_support_tickets",
    "fetch_user_tickets",
    "read_emails",
    "fetch_email_inbox",
    "fetch_url",
    "query_rag_database",
    "retrieve_documents",
    "read_customer_comments",
    "parse_resume",
    "get_order_notes"
}
