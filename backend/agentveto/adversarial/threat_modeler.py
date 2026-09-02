"""
AgentVeto Threat Modeler — Member 1 (Kartik)

Deterministic mapping of tool schemas to OWASP ASI categories.
Identifies Sources vs. Sinks and maps threat vectors.

This module does NOT use an LLM — all classification is rule-based.
"""

from typing import List, Dict, Any, Set, Tuple
from agentveto.contracts.schemas import (
    ToolSchema,
    ThreatModel,
    ASIVector,
    ToolCapability,
)


# ─── Deterministic Classification Rules ──────────────────────────────────────

# Keywords indicating a tool is a DATA SOURCE (read operations)
SOURCE_KEYWORDS: List[str] = [
    "read", "get", "fetch", "retrieve", "list", "search", "query", "download",
    "lookup", "find", "check", "view", "show", "display", "load", "pull",
    "scan", "browse", "inspect", "monitor",
]

# Keywords indicating a tool is a SINK (state-changing operations)
SINK_KEYWORDS: List[str] = [
    "write", "update", "delete", "post", "put", "create", "send", "execute",
    "run", "issue", "modify", "remove", "change", "refund", "deploy",
    "publish", "alter", "set", "cancel", "transfer", "approve", "reject",
    "revoke", "grant", "assign", "terminate", "shutdown", "restart", "install",
]

# Keywords indicating administrative/high-privilege operations
ADMIN_KEYWORDS: List[str] = [
    "admin", "root", "sudo", "privilege", "system", "config", "settings",
    "policy", "role", "permission", "access",
]

# Keywords indicating external communication
EXTERNAL_KEYWORDS: List[str] = [
    "email", "sms", "message", "slack", "webhook", "http", "api", "send",
    "notify", "broadcast", "publish",
]


import re

def _text_contains_keyword(text: str, keywords: List[str]) -> bool:
    """Check if any keyword appears as a whole word in the text."""
    text_lower = text.lower()
    for kw in keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            return True
    return False


class ThreatModeler:
    """
    Deterministic threat modeler that maps tool schemas to OWASP ASI categories.
    """

    def analyze(self, tool_schemas: List[ToolSchema]) -> ThreatModel:
        """
        Analyze a list of tool schemas and produce a complete threat model.
        """
        vectors: List[ASIVector] = []
        source_tools: List[str] = []
        sink_tools: List[str] = []
        risk_categories: Set[str] = set()

        # Pass 1: Classify capabilities
        tool_capabilities = {}
        for schema in tool_schemas:
            capability = self._classify_capability(schema)
            tool_capabilities[schema.name] = capability
            
            if capability in (ToolCapability.DATA_SOURCE, ToolCapability.DUAL):
                source_tools.append(schema.name)
            if capability in (ToolCapability.SINK, ToolCapability.DUAL):
                sink_tools.append(schema.name)

        has_pair = bool(source_tools and sink_tools)

        # Pass 2: Assign Threat Vectors based on architectural rules
        for schema in tool_schemas:
            capability = tool_capabilities[schema.name]
            
            is_admin = _text_contains_keyword(f"{schema.name} {schema.description}", ADMIN_KEYWORDS)
            is_external = _text_contains_keyword(f"{schema.name} {schema.description}", EXTERNAL_KEYWORDS)

            # Rule 1: All Sinks are flagged with MCP10 (Data Exfiltration target)
            if capability in (ToolCapability.SINK, ToolCapability.DUAL) or is_external:
                vectors.append(ASIVector(
                    tool=schema.name,
                    vector="MCP10",
                    capability=capability,
                    confidence=0.9 if is_external else 0.8,
                    description=f"Sink/External tool '{schema.name}' could be used for data exfiltration",
                ))
            
            # Rule 2: If we have a source-sink pair, ALL sinks are ALSO flagged with ASI01
            if has_pair and capability in (ToolCapability.SINK, ToolCapability.DUAL):
                vectors.append(ASIVector(
                    tool=schema.name,
                    vector="ASI01",
                    capability=capability,
                    confidence=0.95 if is_admin else 0.9,
                    description=f"{'High-privilege ' if is_admin else ''}Sink '{schema.name}' vulnerable to Goal Hijack from a source",
                ))

        for v in vectors:
            risk_categories.add(v.vector)

        overall_risk = "LOW"
        if has_pair:
            overall_risk = "CRITICAL"
        elif vectors:
            overall_risk = "HIGH"

        return ThreatModel(
            vulnerable_tools=vectors,
            risk_vectors=sorted(risk_categories),
            source_tools=source_tools,
            sink_tools=sink_tools,
            has_source_sink_pair=has_pair,
            overall_risk=overall_risk,
        )

    def _classify_capability(self, schema: ToolSchema) -> ToolCapability:
        """Classify a tool based on keywords in name and description."""
        name_desc_text = f"{schema.name} {schema.description}"

        is_source = _text_contains_keyword(name_desc_text, SOURCE_KEYWORDS)
        is_sink = _text_contains_keyword(name_desc_text, SINK_KEYWORDS)

        if is_source and is_sink:
            return ToolCapability.DUAL
        elif is_source:
            return ToolCapability.DATA_SOURCE
        elif is_sink:
            return ToolCapability.SINK
        else:
            return ToolCapability.NEUTRAL


def generate_threat_model(schemas: List[ToolSchema]) -> ThreatModel:
    """Convenience function that instantiates ThreatModeler and runs analysis."""
    return ThreatModeler().analyze(schemas)
