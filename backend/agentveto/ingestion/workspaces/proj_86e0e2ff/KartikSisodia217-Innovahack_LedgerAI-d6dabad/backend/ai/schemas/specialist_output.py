from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SignalCard(BaseModel):
    """
    The atomic unit of specialist output.
    One finding = one card. No prose.
    """
    metric: str       # snake_case metric name
    value: float      # Numeric value
    unit: str         # "₹", "%", "days", "×", "count"
    severity: str     # "INFO" | "WARNING" | "CRITICAL"
    confidence: float # 0.0-1.0
    evidence: str     # Single-sentence citation of the number's source
    domain: str       # "liquidity" | "fraud" | "tax" | "audit" | "risk" | "forecast"


class SpecialistOutput(BaseModel):
    """
    What every specialist LLM call produces.
    Deliberately minimal — the synthesizer generates prose.
    """
    # ONE decisive sentence. Not a paragraph. Not a section header.
    headline: str = Field(
        description="A single decisive sentence stating the most important finding. "
                    "Include the key number. Example: 'Cash burn of ₹3,200/day will exhaust "
                    "reserves in 38 days at current trajectory.'"
    )
    
    # Ranked signals — most severe first. Maximum 6.
    signal_cards: List[SignalCard] = Field(
        default_factory=list,
        description="Atomic findings ranked by severity DESC. Maximum 6 cards. "
                    "Each card references a specific computed metric."
    )
    
    # Specific, quantified actions. Maximum 3.
    recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable recommendations. Must cite specific amounts/timeframes. "
                    "BAD: 'Reduce expenses'. GOOD: 'Cut ₹18,500 subscription spend (23% of debits) within 30 days.'"
    )
    
    # 0.0-1.0 — specialist's self-assessed confidence in reasoning quality
    confidence_overall: float = Field(
        default=0.8,
        description="Confidence in the analysis quality based on data completeness. "
                    "1.0 = all data present. 0.5 = significant gaps."
    )
    
    # Only data-quality warnings — not findings
    warnings: List[str] = Field(
        default_factory=list,
        description="Data quality caveats only. E.g. 'Only 1 month of data — trend analysis limited.'"
    )


class CompactUpstreamSummary(BaseModel):
    """Passed to downstream specialists. Deliberately compact."""
    agent: str
    headline: str
    # Top 3 signals only — not the full list
    top_signals: List[SignalCard] = Field(default_factory=list, max_length=3)
    top_recommendation: Optional[str] = None
