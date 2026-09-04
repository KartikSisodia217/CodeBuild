"""
Merchant Intelligence — Phase 6
Extracts merchant names, computes spend analytics, detects recurring merchants.
Fully deterministic. No LLM.
"""
from __future__ import annotations

import re
import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from typing import List, Dict, Optional, Tuple

from backend.ai.analysis.bank_statement_analyzer import ParsedTransaction


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────

@dataclass
class MerchantProfile:
    name: str
    normalized_name: str
    transaction_count: int
    total_spend: float
    average_spend: float
    max_single_transaction: float
    min_single_transaction: float
    first_seen: date
    last_seen: date
    is_recurring: bool
    recurrence_frequency: Optional[str]  # "monthly" | "weekly" | "irregular"
    category: Optional[str]
    monthly_spend: Dict[str, float]       # {"2024-01": 1200.00}
    trend: str                            # "GROWING" | "STABLE" | "DECLINING" | "SINGLE"
    transactions: List[ParsedTransaction] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "transaction_count": self.transaction_count,
            "total_spend": round(self.total_spend, 2),
            "average_spend": round(self.average_spend, 2),
            "max_single_transaction": round(self.max_single_transaction, 2),
            "is_recurring": self.is_recurring,
            "recurrence_frequency": self.recurrence_frequency,
            "category": self.category,
            "monthly_spend": {k: round(v, 2) for k, v in self.monthly_spend.items()},
            "trend": self.trend,
            "first_seen": str(self.first_seen),
            "last_seen": str(self.last_seen),
        }


@dataclass
class MerchantAnalysis:
    top_by_spend: List[MerchantProfile]
    top_by_frequency: List[MerchantProfile]
    recurring_merchants: List[MerchantProfile]
    largest_single_transactions: List[Tuple[str, float]]  # (merchant, amount)
    category_breakdown: Dict[str, float]                  # category → total spend
    total_merchants_detected: int
    analysis_confidence: float

    def to_dict(self) -> dict:
        return {
            "top_by_spend": [m.to_dict() for m in self.top_by_spend[:10]],
            "top_by_frequency": [m.to_dict() for m in self.top_by_frequency[:10]],
            "recurring_merchants": [m.to_dict() for m in self.recurring_merchants],
            "largest_single_transactions": [
                {"merchant": m, "amount": round(a, 2)}
                for m, a in self.largest_single_transactions[:10]
            ],
            "category_breakdown": {k: round(v, 2) for k, v in self.category_breakdown.items()},
            "total_merchants_detected": self.total_merchants_detected,
            "analysis_confidence": round(self.analysis_confidence, 2),
        }


# ─────────────────────────────────────────────
# MERCHANT EXTRACTOR
# ─────────────────────────────────────────────

class MerchantExtractor:
    """
    Extracts a clean merchant name from a raw bank transaction narration.
    Strips payment method prefixes (UPI/, NEFT, IMPS, etc.) and noise tokens.
    """

    # Known merchant prefix patterns to strip
    _PREFIX_STRIP = re.compile(
        r'^(upi[-/]|neft[-/]|rtgs[-/]|imps[-/]|neft\s+|rtgs\s+|'
        r'auto\s+deb\s+|si\s+|standing\s+instr\s+|bill\s+pay[-/]|'
        r'ecs\s+|ach\s+|nach\s+|card\s+\d+\s+|pos\s+)',
        re.IGNORECASE,
    )

    # Remove trailing noise (reference numbers, dates, bank codes)
    _SUFFIX_STRIP = re.compile(
        r'\s+(\d{6,}|[A-Z0-9]{10,}|txn[:\s]*\w+|ref[:\s]*\w+|\d{2}[-/]\d{2}[-/]\d{2,4})\s*$',
        re.IGNORECASE,
    )

    # Common words that are never merchants
    _NOISE_TOKENS = {
        'payment', 'transfer', 'credit', 'debit', 'transaction', 'towards',
        'by', 'to', 'from', 'via', 'against', 'being', 'for', 'on', 'the',
        'a', 'an', 'of', 'and', 'ltd', 'pvt', 'limited', 'llp', 'inc',
    }

    @classmethod
    def extract(cls, description: str) -> str:
        """Extract a normalized merchant name from description."""
        name = description.strip()

        # Strip payment method prefix
        name = cls._PREFIX_STRIP.sub('', name).strip()

        # Strip trailing reference noise
        name = cls._SUFFIX_STRIP.sub('', name).strip()

        # Take first meaningful segment (split on / or | or - with spaces)
        for sep in ['/', '|', ' - ']:
            parts = name.split(sep)
            if len(parts) > 1:
                # Pick the longest non-noise part
                candidates = [p.strip() for p in parts if p.strip()]
                candidates = [c for c in candidates if not cls._is_noise(c)]
                if candidates:
                    name = max(candidates, key=len)
                    break

        # Normalize whitespace and capitalization
        name = re.sub(r'\s+', ' ', name).strip()
        name = name.title() if name else "Unknown Merchant"

        # Final check: if result is too short or pure noise, fall back
        if len(name) < 3 or cls._is_noise(name.lower()):
            name = description.split()[0].title() if description.split() else "Unknown"

        return name

    @classmethod
    def normalize(cls, name: str) -> str:
        """Create a normalized key for deduplication (lowercase, alphanum only)."""
        return re.sub(r'[^a-z0-9]', '', name.lower())

    @classmethod
    def _is_noise(cls, text: str) -> bool:
        words = set(text.lower().split())
        return words.issubset(cls._NOISE_TOKENS) or len(text) < 3


# ─────────────────────────────────────────────
# MERCHANT INTELLIGENCE ENGINE
# ─────────────────────────────────────────────

class MerchantIntelligence:

    @classmethod
    def analyze(
        cls,
        transactions: List[ParsedTransaction],
        classified_categories: Optional[Dict[str, str]] = None,
    ) -> MerchantAnalysis:
        """
        Full merchant analysis from parsed transactions.
        classified_categories: optional dict of description → category from TransactionClassifier.
        """
        if not transactions:
            return MerchantAnalysis([], [], [], [], {}, 0, 0.0)

        # Build merchant profiles
        merchant_txns: Dict[str, List[ParsedTransaction]] = defaultdict(list)
        merchant_names: Dict[str, str] = {}  # normalized_key → display_name

        for txn in transactions:
            if txn.is_debit:  # Merchant analysis on debits (spending)
                merchant = MerchantExtractor.extract(txn.description)
                key = MerchantExtractor.normalize(merchant)
                if key not in merchant_names:
                    merchant_names[key] = merchant
                merchant_txns[key].append(txn)

        profiles: List[MerchantProfile] = []
        for key, txns in merchant_txns.items():
            profile = cls._build_profile(
                name=merchant_names[key],
                normalized_name=key,
                transactions=txns,
                category=classified_categories.get(key) if classified_categories else None,
            )
            profiles.append(profile)

        # Category breakdown
        category_breakdown: Dict[str, float] = defaultdict(float)
        for p in profiles:
            cat = p.category or "Uncategorized"
            category_breakdown[cat] += p.total_spend

        # Sort and select
        top_by_spend = sorted(profiles, key=lambda p: p.total_spend, reverse=True)
        top_by_frequency = sorted(profiles, key=lambda p: p.transaction_count, reverse=True)
        recurring = [p for p in profiles if p.is_recurring]

        # Largest single transactions (merchant, amount)
        all_txn_amounts = [
            (MerchantExtractor.extract(t.description), t.amount)
            for t in transactions if t.is_debit
        ]
        largest_singles = sorted(all_txn_amounts, key=lambda x: x[1], reverse=True)

        # Analysis confidence: higher if merchants are well-identified
        identified = sum(1 for p in profiles if p.name != "Unknown Merchant")
        confidence = identified / len(profiles) if profiles else 0.0

        return MerchantAnalysis(
            top_by_spend=top_by_spend,
            top_by_frequency=top_by_frequency,
            recurring_merchants=recurring,
            largest_single_transactions=largest_singles,
            category_breakdown=dict(category_breakdown),
            total_merchants_detected=len(profiles),
            analysis_confidence=confidence,
        )

    @classmethod
    def _build_profile(
        cls,
        name: str,
        normalized_name: str,
        transactions: List[ParsedTransaction],
        category: Optional[str],
    ) -> MerchantProfile:
        amounts = [t.amount for t in transactions]
        dates = [t.date for t in transactions]

        total = sum(amounts)
        avg = total / len(amounts)
        max_amt = max(amounts)
        min_amt = min(amounts)
        first_seen = min(dates)
        last_seen = max(dates)

        # Monthly spend breakdown
        monthly: Dict[str, float] = defaultdict(float)
        for t in transactions:
            key = t.date.strftime("%Y-%m")
            monthly[key] += t.amount

        # Recurrence detection
        is_recurring, frequency = cls._detect_recurrence(dates, amounts)

        # Trend (compare first half vs second half of months)
        trend = cls._compute_trend(monthly)

        return MerchantProfile(
            name=name,
            normalized_name=normalized_name,
            transaction_count=len(transactions),
            total_spend=total,
            average_spend=avg,
            max_single_transaction=max_amt,
            min_single_transaction=min_amt,
            first_seen=first_seen,
            last_seen=last_seen,
            is_recurring=is_recurring,
            recurrence_frequency=frequency,
            category=category,
            monthly_spend=dict(monthly),
            trend=trend,
            transactions=transactions,
        )

    @staticmethod
    def _detect_recurrence(
        dates: List[date], amounts: List[float]
    ) -> Tuple[bool, Optional[str]]:
        """
        Detect if this merchant has a recurring payment pattern.
        Recurring = 2+ transactions with consistent intervals and similar amounts.
        """
        if len(dates) < 2:
            return False, None

        sorted_dates = sorted(dates)
        gaps = [(sorted_dates[i+1] - sorted_dates[i]).days for i in range(len(sorted_dates)-1)]

        avg_gap = sum(gaps) / len(gaps)
        gap_variance = statistics.stdev(gaps) if len(gaps) > 1 else 0

        # Amount consistency check (CV < 0.15 means very consistent)
        amount_cv = statistics.stdev(amounts) / (statistics.mean(amounts) + 1e-9) if len(amounts) > 1 else 0

        # Recurring if gap is consistent AND amounts are similar
        if gap_variance < avg_gap * 0.3 and amount_cv < 0.25:
            if 25 <= avg_gap <= 35:
                return True, "monthly"
            elif 6 <= avg_gap <= 8:
                return True, "weekly"
            elif 13 <= avg_gap <= 15:
                return True, "bi-weekly"
            elif 80 <= avg_gap <= 100:
                return True, "quarterly"
            else:
                return True, "irregular"

        return False, None

    @staticmethod
    def _compute_trend(monthly_spend: Dict[str, float]) -> str:
        if len(monthly_spend) < 2:
            return "SINGLE"
        months = sorted(monthly_spend.keys())
        values = [monthly_spend[m] for m in months]
        # Compare first half vs second half average
        mid = len(values) // 2
        first_half_avg = sum(values[:mid]) / max(mid, 1)
        second_half_avg = sum(values[mid:]) / max(len(values) - mid, 1)
        ratio = second_half_avg / (first_half_avg + 1e-9)
        if ratio > 1.15:
            return "GROWING"
        elif ratio < 0.85:
            return "DECLINING"
        return "STABLE"
