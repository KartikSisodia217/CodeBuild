"""
Bank Statement Analyzer — Phase 6
All 20 core metrics + Part 8 pattern detection.
Pure deterministic computation. Zero LLM dependency.
Input: List of parsed transaction dicts.
Output: BankStatementAnalysis dataclass.
"""
from __future__ import annotations

import re
import math
import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any, Tuple


# ─────────────────────────────────────────────
# TRANSACTION SCHEMA
# ─────────────────────────────────────────────

@dataclass
class ParsedTransaction:
    """Normalized transaction extracted from bank statement text."""
    date: date
    description: str
    amount: float          # Always positive
    txn_type: str          # "credit" | "debit"
    balance: Optional[float] = None
    reference: Optional[str] = None
    raw_line: str = ""

    @property
    def is_credit(self) -> bool:
        return self.txn_type == "credit"

    @property
    def is_debit(self) -> bool:
        return self.txn_type == "debit"


# ─────────────────────────────────────────────
# ANALYSIS RESULT SCHEMAS
# ─────────────────────────────────────────────

@dataclass
class BalanceSummary:
    opening_balance: float
    closing_balance: float
    peak_balance: float
    minimum_balance: float
    average_daily_balance: float
    balance_volatility: float   # standard deviation of daily closing balances
    balance_change_pct: float   # % change from opening to closing

@dataclass
class FlowSummary:
    total_credits: float
    total_debits: float
    net_cash_flow: float
    largest_credit: float
    largest_debit: float
    average_transaction: float
    median_transaction: float
    credit_debit_ratio: float   # total_credits / total_debits
    transaction_count: int
    credit_count: int
    debit_count: int

@dataclass
class StabilitySummary:
    inflow_stability: float     # 1 - CV of credit amounts (higher = more stable)
    outflow_stability: float    # 1 - CV of debit amounts
    transaction_frequency: float  # avg transactions per day

@dataclass
class PeriodFlow:
    label: str
    credits: float
    debits: float
    net: float
    transaction_count: int

@dataclass
class DetectedPattern:
    pattern_type: str   # "salary", "emi", "subscription", "rent", "utility" etc.
    description: str
    amount_range: Tuple[float, float]
    frequency: str      # "monthly" | "weekly" | "irregular"
    confidence: float   # 0.0-1.0
    evidence: List[str] = field(default_factory=list)

@dataclass
class SuspiciousTransaction:
    transaction: ParsedTransaction
    reason: str
    severity: str       # "LOW" | "MEDIUM" | "HIGH"
    confidence: float

@dataclass
class BankStatementAnalysis:
    """Complete deterministic analysis of a bank statement."""
    # Metadata
    statement_from: Optional[date]
    statement_to: Optional[date]
    period_days: int
    transaction_count: int

    # Core metrics
    balance: BalanceSummary
    flow: FlowSummary
    stability: StabilitySummary

    # Time series
    daily_flows: List[PeriodFlow]
    weekly_flows: List[PeriodFlow]
    monthly_flows: List[PeriodFlow]

    # Intelligence
    detected_patterns: List[DetectedPattern]
    suspicious_transactions: List[SuspiciousTransaction]
    dormant_periods: List[Tuple[date, date]]   # (start, end) of periods with no activity
    spending_peaks: List[Tuple[date, float]]   # (date, debit_amount) for peaks

    # Raw breakdown
    transactions: List[ParsedTransaction]

    # Analysis quality
    data_quality_score: float  # 0.0-1.0 — based on completeness
    warnings: List[str] = field(default_factory=list)

    def to_summary_dict(self) -> dict:
        """Serializable summary for API response and agent context injection."""
        return {
            "period": {
                "from": str(self.statement_from),
                "to": str(self.statement_to),
                "days": self.period_days,
            },
            "balance": {
                "opening": round(self.balance.opening_balance, 2),
                "closing": round(self.balance.closing_balance, 2),
                "peak": round(self.balance.peak_balance, 2),
                "minimum": round(self.balance.minimum_balance, 2),
                "average_daily": round(self.balance.average_daily_balance, 2),
                "volatility": round(self.balance.balance_volatility, 2),
                "change_pct": round(self.balance.balance_change_pct, 2),
            },
            "flow": {
                "total_credits": round(self.flow.total_credits, 2),
                "total_debits": round(self.flow.total_debits, 2),
                "net_cash_flow": round(self.flow.net_cash_flow, 2),
                "largest_credit": round(self.flow.largest_credit, 2),
                "largest_debit": round(self.flow.largest_debit, 2),
                "average_transaction": round(self.flow.average_transaction, 2),
                "median_transaction": round(self.flow.median_transaction, 2),
                "credit_debit_ratio": round(self.flow.credit_debit_ratio, 4),
                "transaction_count": self.flow.transaction_count,
                "credit_count": self.flow.credit_count,
                "debit_count": self.flow.debit_count,
            },
            "stability": {
                "inflow_stability": round(self.stability.inflow_stability, 4),
                "outflow_stability": round(self.stability.outflow_stability, 4),
                "transaction_frequency_per_day": round(self.stability.transaction_frequency, 4),
            },
            "monthly_flows": [
                {
                    "label": p.label,
                    "credits": round(p.credits, 2),
                    "debits": round(p.debits, 2),
                    "net": round(p.net, 2),
                }
                for p in self.monthly_flows
            ],
            "patterns": [
                {
                    "type": p.pattern_type,
                    "description": p.description,
                    "frequency": p.frequency,
                    "confidence": round(p.confidence, 2),
                    "evidence": p.evidence[:3],
                }
                for p in self.detected_patterns
            ],
            "suspicious_count": len(self.suspicious_transactions),
            "dormant_periods": len(self.dormant_periods),
            "data_quality_score": round(self.data_quality_score, 2),
            "warnings": self.warnings,
        }


# ─────────────────────────────────────────────
# BANK STATEMENT TEXT PARSER
# ─────────────────────────────────────────────

class BankStatementParser:
    """
    Extracts structured transactions from raw OCR text of a bank statement.
    Uses pattern-matching heuristics — no LLM.
    """

    # Common date formats seen in Indian bank statements
    DATE_PATTERNS = [
        r'(\d{2}[-/]\d{2}[-/]\d{4})',   # DD-MM-YYYY or DD/MM/YYYY
        r'(\d{2}[-/]\w{3}[-/]\d{4})',   # DD-Mon-YYYY
        r'(\d{4}[-/]\d{2}[-/]\d{2})',   # YYYY-MM-DD
        r'(\d{2}[-/]\d{2}[-/]\d{2})',   # DD/MM/YY
    ]

    # Amount patterns — handles Indian number formatting (1,00,000.00)
    AMOUNT_PATTERN = re.compile(r'(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)')

    # Markers that suggest a credit/debit column header or label
    CREDIT_MARKERS = re.compile(r'\b(cr|credit|deposit|receipt|inflow|received|incoming)\b', re.I)
    DEBIT_MARKERS = re.compile(r'\b(dr|debit|withdrawal|payment|outflow|sent|outgoing|charge)\b', re.I)

    @classmethod
    def _parse_date(cls, date_str: str) -> Optional[date]:
        """Try multiple date formats."""
        date_str = date_str.strip().replace('/', '-')
        formats = [
            '%d-%m-%Y', '%d-%b-%Y', '%Y-%m-%d',
            '%d-%m-%y', '%d-%B-%Y',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        return None

    @classmethod
    def _parse_amount(cls, amount_str: str) -> Optional[float]:
        """Parse Indian-formatted currency strings to float."""
        try:
            cleaned = re.sub(r'[₹Rs.\s,]', '', amount_str).replace('INR', '')
            if not cleaned:
                return None
            return float(cleaned)
        except (ValueError, TypeError):
            return None

    @classmethod
    def parse(cls, raw_text: str) -> List[ParsedTransaction]:
        """
        Parse raw bank statement text into structured transactions.
        Handles both tabular and line-by-line formats.
        """
        transactions: List[ParsedTransaction] = []
        lines = raw_text.split('\n')

        date_pattern = re.compile(
            r'(\d{2}[-/]\d{2}[-/]\d{4}|\d{2}[-/]\w{3}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{2})'
        )
        amount_pattern = re.compile(r'([\d,]+\.\d{2})')

        for line in lines:
            line = line.strip()
            if not line or len(line) < 10:
                continue

            # Find date
            date_match = date_pattern.search(line)
            if not date_match:
                continue

            txn_date = cls._parse_date(date_match.group(1))
            if not txn_date:
                continue

            # Find all amounts on this line
            amounts_found = [cls._parse_amount(m) for m in amount_pattern.findall(line)]
            amounts_found = [a for a in amounts_found if a is not None and a > 0]

            if not amounts_found:
                continue

            # Determine description (text between date and first amount)
            after_date = line[date_match.end():].strip()
            first_amount_match = amount_pattern.search(after_date)
            description = after_date[:first_amount_match.start()].strip() if first_amount_match else after_date

            # Classify as credit or debit
            # Strategy: look for explicit markers, then column position heuristic
            txn_type = "debit"  # default conservative assumption
            line_lower = line.lower()

            # Explicit markers
            if cls.CREDIT_MARKERS.search(description) or 'cr' in line_lower.split():
                txn_type = "credit"
            elif cls.DEBIT_MARKERS.search(description) or 'dr' in line_lower.split():
                txn_type = "debit"
            else:
                # Heuristic: if 2+ amounts, first is transaction, second is running balance
                # In many formats: debit in col3, credit in col4, balance in col5
                # We look for "Cr" or "Dr" suffix on amounts
                if re.search(r'\b\d[\d,.]+\s*Cr\b', line, re.I):
                    txn_type = "credit"
                elif re.search(r'\b\d[\d,.]+\s*Dr\b', line, re.I):
                    txn_type = "debit"

            # Primary amount = first amount found (balance is usually last)
            primary_amount = amounts_found[0]
            balance = amounts_found[-1] if len(amounts_found) > 1 else None

            # Clean description
            description = re.sub(r'\s+', ' ', description).strip()
            if len(description) < 2:
                description = "Transaction"

            transactions.append(ParsedTransaction(
                date=txn_date,
                description=description,
                amount=primary_amount,
                txn_type=txn_type,
                balance=balance,
                raw_line=line,
            ))

        return transactions


# ─────────────────────────────────────────────
# PATTERN DETECTORS
# ─────────────────────────────────────────────

class PatternDetector:
    """Detects recurring financial patterns in transaction lists."""

    SALARY_KEYWORDS = re.compile(
        r'\b(salary|sal|payroll|pay|stipend|wages|compensation|neft.*employer|'
        r'employer.*neft|monthly.*pay|pay.*monthly)\b', re.I
    )
    EMI_KEYWORDS = re.compile(
        r'\b(emi|loan|equated|mortgage|housing.*loan|home.*loan|car.*loan|'
        r'auto.*loan|personal.*loan|repayment)\b', re.I
    )
    RENT_KEYWORDS = re.compile(r'\b(rent|lease|property|landlord|tenant)\b', re.I)
    UTILITY_KEYWORDS = re.compile(
        r'\b(electricity|bescom|msedcl|bses|torrent|tata.*power|gas|piped.*gas|'
        r'water.*bill|broadband|internet|jio|airtel|vodafone|vi|bsnl|dtv|dish)\b', re.I
    )
    SUBSCRIPTION_KEYWORDS = re.compile(
        r'\b(netflix|hotstar|amazon.*prime|spotify|apple|youtube.*premium|'
        r'zee5|sonyliv|voot|adobe|microsoft|365|google.*workspace|notion|'
        r'slack|zoom|dropbox|aws|azure|gcp|subscription)\b', re.I
    )
    ATM_KEYWORDS = re.compile(r'\b(atm|cash.*withdraw|cdm|cash.*machine)\b', re.I)
    UPI_KEYWORDS = re.compile(r'\b(upi|gpay|phonepe|paytm|bhim|neft.*upi)\b', re.I)
    CHEQUE_KEYWORDS = re.compile(r'\b(chq|cheque|check|clg)\b', re.I)
    CASH_DEPOSIT_KEYWORDS = re.compile(r'\b(cash.*dep|cdm.*deposit|deposit.*cash)\b', re.I)
    REFUND_KEYWORDS = re.compile(r'\b(refund|reversal|cashback|chargeback|return)\b', re.I)

    @classmethod
    def detect_all(cls, transactions: List[ParsedTransaction]) -> List[DetectedPattern]:
        patterns: List[DetectedPattern] = []

        patterns.extend(cls._detect_by_keyword_group(transactions, cls.SALARY_KEYWORDS, "salary", "Salary / Payroll Credit", "monthly"))
        patterns.extend(cls._detect_by_keyword_group(transactions, cls.EMI_KEYWORDS, "loan_emi", "Loan EMI / Repayment", "monthly"))
        patterns.extend(cls._detect_by_keyword_group(transactions, cls.RENT_KEYWORDS, "rent", "Rent / Lease Payment", "monthly"))
        patterns.extend(cls._detect_by_keyword_group(transactions, cls.UTILITY_KEYWORDS, "utility", "Utility Bill Payment", "monthly"))
        patterns.extend(cls._detect_by_keyword_group(transactions, cls.SUBSCRIPTION_KEYWORDS, "subscription", "Subscription Payment", "monthly"))
        patterns.extend(cls._detect_usage_pattern(transactions, cls.ATM_KEYWORDS, "atm_usage", "ATM Cash Withdrawals"))
        patterns.extend(cls._detect_usage_pattern(transactions, cls.UPI_KEYWORDS, "upi_usage", "UPI Transactions"))
        patterns.extend(cls._detect_usage_pattern(transactions, cls.CHEQUE_KEYWORDS, "cheque_usage", "Cheque Clearances"))
        patterns.extend(cls._detect_usage_pattern(transactions, cls.CASH_DEPOSIT_KEYWORDS, "cash_deposit", "Cash Deposits"))
        patterns.extend(cls._detect_usage_pattern(transactions, cls.REFUND_KEYWORDS, "refund", "Refunds / Reversals"))

        return patterns

    @classmethod
    def _detect_by_keyword_group(
        cls,
        transactions: List[ParsedTransaction],
        pattern: re.Pattern,
        pattern_type: str,
        description: str,
        frequency: str,
    ) -> List[DetectedPattern]:
        matching = [t for t in transactions if pattern.search(t.description)]
        if not matching:
            return []

        amounts = [t.amount for t in matching]
        evidence = [f"{t.date} | {t.description} | ₹{t.amount:,.2f}" for t in matching[:5]]

        # Confidence: higher if multiple occurrences with similar amounts
        if len(matching) >= 3:
            cv = statistics.stdev(amounts) / (statistics.mean(amounts) + 1e-9)
            conf = max(0.5, min(0.95, 1.0 - cv))
        elif len(matching) == 2:
            conf = 0.6
        else:
            conf = 0.4

        return [DetectedPattern(
            pattern_type=pattern_type,
            description=f"{description} ({len(matching)} occurrences)",
            amount_range=(min(amounts), max(amounts)),
            frequency=frequency,
            confidence=conf,
            evidence=evidence,
        )]

    @classmethod
    def _detect_usage_pattern(
        cls,
        transactions: List[ParsedTransaction],
        pattern: re.Pattern,
        pattern_type: str,
        description: str,
    ) -> List[DetectedPattern]:
        matching = [t for t in transactions if pattern.search(t.description)]
        if not matching:
            return []

        amounts = [t.amount for t in matching]
        total = sum(amounts)
        evidence = [f"{t.date} | {t.description} | ₹{t.amount:,.2f}" for t in matching[:5]]

        return [DetectedPattern(
            pattern_type=pattern_type,
            description=f"{description}: {len(matching)} transactions totalling ₹{total:,.2f}",
            amount_range=(min(amounts), max(amounts)),
            frequency="irregular",
            confidence=0.9,  # keyword-matched, high confidence
            evidence=evidence,
        )]


# ─────────────────────────────────────────────
# SUSPICIOUS TRANSACTION DETECTOR
# ─────────────────────────────────────────────

class SuspiciousTransactionDetector:

    @classmethod
    def detect(cls, transactions: List[ParsedTransaction]) -> List[SuspiciousTransaction]:
        suspicious: List[SuspiciousTransaction] = []
        amounts = [t.amount for t in transactions]

        if len(amounts) < 3:
            return []

        mean_amt = statistics.mean(amounts)
        std_amt = statistics.stdev(amounts)
        threshold_2s = mean_amt + 2 * std_amt
        threshold_3s = mean_amt + 3 * std_amt

        for txn in transactions:
            # Large transaction flag
            if txn.amount > threshold_3s:
                suspicious.append(SuspiciousTransaction(
                    transaction=txn,
                    reason=f"Amount ₹{txn.amount:,.2f} is more than 3σ above mean (₹{mean_amt:,.2f})",
                    severity="HIGH",
                    confidence=0.85,
                ))
            elif txn.amount > threshold_2s:
                suspicious.append(SuspiciousTransaction(
                    transaction=txn,
                    reason=f"Amount ₹{txn.amount:,.2f} is more than 2σ above mean (₹{mean_amt:,.2f})",
                    severity="MEDIUM",
                    confidence=0.7,
                ))

            # Round number detection (Benford's Law proxy)
            if cls._is_round_number(txn.amount) and txn.amount > mean_amt:
                suspicious.append(SuspiciousTransaction(
                    transaction=txn,
                    reason=f"Suspiciously round number ₹{txn.amount:,.2f} — possible manual entry or structuring",
                    severity="LOW",
                    confidence=0.5,
                ))

        # Duplicate detection (same amount + same day)
        seen: Dict[str, ParsedTransaction] = {}
        for txn in transactions:
            key = f"{txn.date}|{txn.amount:.2f}|{txn.txn_type}"
            if key in seen:
                suspicious.append(SuspiciousTransaction(
                    transaction=txn,
                    reason=f"Duplicate transaction: same amount ₹{txn.amount:,.2f}, same date {txn.date}, same type",
                    severity="HIGH",
                    confidence=0.9,
                ))
            else:
                seen[key] = txn

        return suspicious

    @staticmethod
    def _is_round_number(amount: float) -> bool:
        """Returns True if amount ends in 000 or 0000."""
        int_amount = int(amount)
        return int_amount >= 1000 and (int_amount % 1000 == 0)


# ─────────────────────────────────────────────
# MAIN ANALYZER
# ─────────────────────────────────────────────

class BankStatementAnalyzer:
    """
    Main entry point. Given a list of ParsedTransactions (from parser or upstream),
    computes the full BankStatementAnalysis.
    """

    @classmethod
    def from_text(cls, raw_text: str) -> "tuple[BankStatementAnalysis, List[ParsedTransaction]]":
        """Parse text and analyze in one step."""
        transactions = BankStatementParser.parse(raw_text)
        analysis = cls.analyze(transactions)
        return analysis, transactions

    @classmethod
    def analyze(cls, transactions: List[ParsedTransaction]) -> BankStatementAnalysis:
        warnings: List[str] = []

        if not transactions:
            return cls._empty_analysis(warnings=["No transactions could be extracted from the document."])

        # Sort chronologically
        transactions = sorted(transactions, key=lambda t: t.date)

        credits = [t for t in transactions if t.is_credit]
        debits = [t for t in transactions if t.is_debit]
        all_amounts = [t.amount for t in transactions]

        credit_amounts = [t.amount for t in credits]
        debit_amounts = [t for t in debits]
        debit_vals = [t.amount for t in debits]

        total_credits = sum(credit_amounts)
        total_debits = sum(debit_vals)

        # ── Period
        statement_from = transactions[0].date
        statement_to = transactions[-1].date
        period_days = max(1, (statement_to - statement_from).days + 1)

        # ── Balance summary
        opening_balance = cls._infer_opening_balance(transactions)
        closing_balance = cls._infer_closing_balance(transactions, opening_balance, total_credits, total_debits)
        daily_balances = cls._compute_daily_balances(transactions, opening_balance, statement_from, statement_to)

        peak_balance = max(daily_balances.values()) if daily_balances else closing_balance
        min_balance = min(daily_balances.values()) if daily_balances else 0.0
        avg_daily = statistics.mean(daily_balances.values()) if daily_balances else 0.0
        bal_vol = statistics.stdev(daily_balances.values()) if len(daily_balances) > 1 else 0.0
        bal_change_pct = ((closing_balance - opening_balance) / opening_balance * 100) if opening_balance else 0.0

        balance_summary = BalanceSummary(
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            peak_balance=peak_balance,
            minimum_balance=min_balance,
            average_daily_balance=avg_daily,
            balance_volatility=bal_vol,
            balance_change_pct=bal_change_pct,
        )

        # ── Flow summary
        largest_credit = max(credit_amounts) if credit_amounts else 0.0
        largest_debit = max(debit_vals) if debit_vals else 0.0
        avg_txn = statistics.mean(all_amounts) if all_amounts else 0.0
        median_txn = statistics.median(all_amounts) if all_amounts else 0.0
        cd_ratio = (total_credits / total_debits) if total_debits > 0 else float('inf')

        flow_summary = FlowSummary(
            total_credits=total_credits,
            total_debits=total_debits,
            net_cash_flow=total_credits - total_debits,
            largest_credit=largest_credit,
            largest_debit=largest_debit,
            average_transaction=avg_txn,
            median_transaction=median_txn,
            credit_debit_ratio=cd_ratio,
            transaction_count=len(transactions),
            credit_count=len(credits),
            debit_count=len(debits),
        )

        # ── Stability
        inflow_cv = (statistics.stdev(credit_amounts) / statistics.mean(credit_amounts)) if len(credit_amounts) > 1 and statistics.mean(credit_amounts) > 0 else 0.0
        outflow_cv = (statistics.stdev(debit_vals) / statistics.mean(debit_vals)) if len(debit_vals) > 1 and statistics.mean(debit_vals) > 0 else 0.0

        stability = StabilitySummary(
            inflow_stability=max(0.0, 1.0 - inflow_cv),
            outflow_stability=max(0.0, 1.0 - outflow_cv),
            transaction_frequency=len(transactions) / period_days,
        )

        # ── Period flows
        daily_flows = cls._aggregate_by_day(transactions)
        weekly_flows = cls._aggregate_by_week(transactions)
        monthly_flows = cls._aggregate_by_month(transactions)

        # ── Pattern detection
        patterns = PatternDetector.detect_all(transactions)

        # ── Suspicious transactions
        suspicious = SuspiciousTransactionDetector.detect(transactions)

        # ── Dormant periods (5+ day gaps in activity)
        dormant = cls._detect_dormant_periods(transactions, threshold_days=5)

        # ── Spending peaks (days with debits > 2× average daily debit)
        avg_daily_debit = total_debits / period_days if period_days > 0 else 0
        daily_debits: Dict[date, float] = defaultdict(float)
        for t in debits:
            daily_debits[t.date] += t.amount
        spending_peaks = [
            (d, amt) for d, amt in sorted(daily_debits.items())
            if amt > 2 * avg_daily_debit
        ]

        # ── Data quality
        data_quality = cls._compute_quality_score(transactions, warnings)

        return BankStatementAnalysis(
            statement_from=statement_from,
            statement_to=statement_to,
            period_days=period_days,
            transaction_count=len(transactions),
            balance=balance_summary,
            flow=flow_summary,
            stability=stability,
            daily_flows=daily_flows,
            weekly_flows=weekly_flows,
            monthly_flows=monthly_flows,
            detected_patterns=patterns,
            suspicious_transactions=suspicious,
            dormant_periods=dormant,
            spending_peaks=spending_peaks,
            transactions=transactions,
            data_quality_score=data_quality,
            warnings=warnings,
        )

    @staticmethod
    def _infer_opening_balance(transactions: List[ParsedTransaction]) -> float:
        """
        Infer opening balance from running balances if available,
        otherwise return 0.0 with a warning.
        """
        # Try to back-calculate: first transaction balance ± first transaction amount
        first = transactions[0]
        if first.balance is not None:
            if first.is_credit:
                return first.balance - first.amount
            else:
                return first.balance + first.amount
        return 0.0

    @staticmethod
    def _infer_closing_balance(
        transactions: List[ParsedTransaction],
        opening: float,
        total_credits: float,
        total_debits: float,
    ) -> float:
        """Use last transaction's balance if available, else compute from flows."""
        last = transactions[-1]
        if last.balance is not None:
            return last.balance
        return opening + total_credits - total_debits

    @staticmethod
    def _compute_daily_balances(
        transactions: List[ParsedTransaction],
        opening_balance: float,
        start: date,
        end: date,
    ) -> Dict[date, float]:
        """Build a running daily balance dict."""
        # Group transactions by date
        by_date: Dict[date, List[ParsedTransaction]] = defaultdict(list)
        for t in transactions:
            by_date[t.date].append(t)

        daily_balances: Dict[date, float] = {}
        running = opening_balance
        current = start
        while current <= end:
            for txn in by_date.get(current, []):
                if txn.is_credit:
                    running += txn.amount
                else:
                    running -= txn.amount
            daily_balances[current] = running
            current += timedelta(days=1)
        return daily_balances

    @staticmethod
    def _aggregate_by_day(transactions: List[ParsedTransaction]) -> List[PeriodFlow]:
        by_day: Dict[date, PeriodFlow] = {}
        for t in transactions:
            if t.date not in by_day:
                by_day[t.date] = PeriodFlow(
                    label=str(t.date), credits=0, debits=0, net=0, transaction_count=0
                )
            pf = by_day[t.date]
            if t.is_credit:
                pf.credits += t.amount
            else:
                pf.debits += t.amount
            pf.net = pf.credits - pf.debits
            pf.transaction_count += 1
        return sorted(by_day.values(), key=lambda x: x.label)

    @staticmethod
    def _aggregate_by_week(transactions: List[ParsedTransaction]) -> List[PeriodFlow]:
        by_week: Dict[str, PeriodFlow] = {}
        for t in transactions:
            year, week, _ = t.date.isocalendar()
            key = f"{year}-W{week:02d}"
            if key not in by_week:
                by_week[key] = PeriodFlow(label=key, credits=0, debits=0, net=0, transaction_count=0)
            pf = by_week[key]
            if t.is_credit:
                pf.credits += t.amount
            else:
                pf.debits += t.amount
            pf.net = pf.credits - pf.debits
            pf.transaction_count += 1
        return sorted(by_week.values(), key=lambda x: x.label)

    @staticmethod
    def _aggregate_by_month(transactions: List[ParsedTransaction]) -> List[PeriodFlow]:
        by_month: Dict[str, PeriodFlow] = {}
        for t in transactions:
            key = t.date.strftime("%Y-%m")
            if key not in by_month:
                by_month[key] = PeriodFlow(label=key, credits=0, debits=0, net=0, transaction_count=0)
            pf = by_month[key]
            if t.is_credit:
                pf.credits += t.amount
            else:
                pf.debits += t.amount
            pf.net = pf.credits - pf.debits
            pf.transaction_count += 1
        return sorted(by_month.values(), key=lambda x: x.label)

    @staticmethod
    def _detect_dormant_periods(
        transactions: List[ParsedTransaction], threshold_days: int = 5
    ) -> List[Tuple[date, date]]:
        dormant: List[Tuple[date, date]] = []
        for i in range(1, len(transactions)):
            gap = (transactions[i].date - transactions[i - 1].date).days
            if gap >= threshold_days:
                dormant.append((transactions[i - 1].date, transactions[i].date))
        return dormant

    @staticmethod
    def _compute_quality_score(transactions: List[ParsedTransaction], warnings: List[str]) -> float:
        if not transactions:
            return 0.0
        score = 1.0
        # Penalize if no balances available
        with_balance = sum(1 for t in transactions if t.balance is not None)
        if with_balance == 0:
            score -= 0.2
            warnings.append("No running balances detected — opening/closing balance inferred from flows.")
        elif with_balance < len(transactions) * 0.5:
            score -= 0.1
            warnings.append("Less than 50% of transactions have running balance data.")
        # Penalize very few transactions
        if len(transactions) < 5:
            score -= 0.2
            warnings.append("Fewer than 5 transactions parsed — analysis may be incomplete.")
        # Penalize if large portion unclassified
        generic = sum(1 for t in transactions if t.description == "Transaction")
        if generic > len(transactions) * 0.3:
            score -= 0.15
            warnings.append("More than 30% of transactions have no recognisable description.")
        return max(0.0, round(score, 2))

    @classmethod
    def _empty_analysis(cls, warnings: List[str]) -> BankStatementAnalysis:
        empty_balance = BalanceSummary(0, 0, 0, 0, 0, 0, 0)
        empty_flow = FlowSummary(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        empty_stability = StabilitySummary(0, 0, 0)
        return BankStatementAnalysis(
            statement_from=None, statement_to=None, period_days=0,
            transaction_count=0, balance=empty_balance, flow=empty_flow,
            stability=empty_stability, daily_flows=[], weekly_flows=[],
            monthly_flows=[], detected_patterns=[], suspicious_transactions=[],
            dormant_periods=[], spending_peaks=[], transactions=[],
            data_quality_score=0.0, warnings=warnings,
        )
