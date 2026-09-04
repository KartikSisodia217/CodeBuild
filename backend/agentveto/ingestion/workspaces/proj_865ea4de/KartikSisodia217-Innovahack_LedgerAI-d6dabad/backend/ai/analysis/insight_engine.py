"""
Insight Engine — Phase 6
Converts deterministic metric outputs into evidence-backed, comparative narratives.
The LLM explains. The tools calculate. This module formats what the tools calculated.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalysis
from backend.ai.analysis.financial_health import FinancialHealthReport


@dataclass
class Insight:
    headline: str           # "Closing balance increased 12× during the period"
    narrative: str          # Full explanation with numbers
    evidence: List[str]     # Supporting transactions / data points
    calculation: str        # Formula used to derive this insight
    confidence: float       # 0.0-1.0
    specialist: str         # Which specialist domain generated this
    category: str           # "Liquidity" | "Risk" | "Pattern" | "Anomaly" | "Efficiency"
    severity: str           # "INFO" | "WARNING" | "CRITICAL"

    def to_dict(self) -> dict:
        return {
            "headline": self.headline,
            "narrative": self.narrative,
            "evidence": self.evidence,
            "calculation": self.calculation,
            "confidence": round(self.confidence, 3),
            "specialist": self.specialist,
            "category": self.category,
            "severity": self.severity,
        }


class InsightEngine:
    """
    Generates human-readable, evidence-backed insights from analysis results.
    Comparisons, ratios, and magnitudes — not generic descriptions.
    """

    @classmethod
    def generate(
        cls,
        analysis: BankStatementAnalysis,
        health: Optional[FinancialHealthReport] = None,
    ) -> List[Insight]:
        insights: List[Insight] = []

        insights.extend(cls._balance_insights(analysis))
        insights.extend(cls._flow_insights(analysis))
        insights.extend(cls._pattern_insights(analysis))
        insights.extend(cls._anomaly_insights(analysis))
        insights.extend(cls._frequency_insights(analysis))

        if health:
            insights.extend(cls._health_insights(health))

        # Sort: CRITICAL first, then WARNING, then INFO
        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        insights.sort(key=lambda x: severity_order.get(x.severity, 3))

        return insights

    # ────────────────────────────
    # BALANCE INSIGHTS
    # ────────────────────────────

    @classmethod
    def _balance_insights(cls, a: BankStatementAnalysis) -> List[Insight]:
        results = []
        opening = a.balance.opening_balance
        closing = a.balance.closing_balance
        peak = a.balance.peak_balance
        minimum = a.balance.minimum_balance

        # Balance change magnitude
        if opening > 0:
            multiplier = closing / opening
            if multiplier >= 2:
                results.append(Insight(
                    headline=f"Closing balance is {multiplier:.1f}× the opening balance",
                    narrative=(
                        f"The account grew from ₹{opening:,.2f} to ₹{closing:,.2f} — "
                        f"a {a.balance.balance_change_pct:.1f}% increase over {a.period_days} days. "
                        f"This represents a {multiplier:.1f}× multiplication of the opening balance."
                    ),
                    evidence=[
                        f"Opening balance: ₹{opening:,.2f}",
                        f"Closing balance: ₹{closing:,.2f}",
                        f"Change: +₹{closing - opening:,.2f}",
                    ],
                    calculation=f"Closing / Opening = ₹{closing:,.2f} / ₹{opening:,.2f} = {multiplier:.2f}×",
                    confidence=0.95,
                    specialist="Financial Analyst",
                    category="Liquidity",
                    severity="INFO",
                ))
            elif multiplier < 0.7:
                drop_pct = (1 - multiplier) * 100
                results.append(Insight(
                    headline=f"Closing balance dropped {drop_pct:.0f}% below opening",
                    narrative=(
                        f"Balance fell from ₹{opening:,.2f} to ₹{closing:,.2f} — "
                        f"a {drop_pct:.1f}% decline over {a.period_days} days. "
                        f"Net outflows of ₹{abs(a.flow.net_cash_flow):,.2f} drove this decline."
                    ),
                    evidence=[
                        f"Opening balance: ₹{opening:,.2f}",
                        f"Closing balance: ₹{closing:,.2f}",
                        f"Net outflow: ₹{abs(a.flow.net_cash_flow):,.2f}",
                    ],
                    calculation=f"1 − (Closing / Opening) = 1 − {multiplier:.2f} = {drop_pct:.1f}%",
                    confidence=0.95,
                    specialist="Financial Analyst",
                    category="Liquidity",
                    severity="WARNING" if drop_pct > 30 else "INFO",
                ))

        # Peak vs closing gap
        if peak > 0 and closing < peak * 0.5:
            peak_drop = (peak - closing) / peak * 100
            results.append(Insight(
                headline=f"Closing balance is {peak_drop:.0f}% below peak balance",
                narrative=(
                    f"Balance peaked at ₹{peak:,.2f} but closed at ₹{closing:,.2f} — "
                    f"a {peak_drop:.0f}% drawdown from the high-water mark."
                ),
                evidence=[
                    f"Peak balance: ₹{peak:,.2f}",
                    f"Closing balance: ₹{closing:,.2f}",
                    f"Drawdown: ₹{peak - closing:,.2f}",
                ],
                calculation=f"(Peak − Closing) / Peak = (₹{peak:,.2f} − ₹{closing:,.2f}) / ₹{peak:,.2f} = {peak_drop:.1f}%",
                confidence=0.90,
                specialist="Financial Analyst",
                category="Liquidity",
                severity="WARNING" if peak_drop > 50 else "INFO",
            ))

        # Balance volatility
        if a.balance.balance_volatility > a.balance.average_daily_balance * 0.5:
            results.append(Insight(
                headline="High balance volatility detected",
                narrative=(
                    f"Daily balance standard deviation is ₹{a.balance.balance_volatility:,.2f}, "
                    f"which is {a.balance.balance_volatility / (a.balance.average_daily_balance + 1):.1f}× "
                    f"the average daily balance (₹{a.balance.average_daily_balance:,.2f}). "
                    "Large swings indicate irregular inflow/outflow timing."
                ),
                evidence=[
                    f"Balance std deviation: ₹{a.balance.balance_volatility:,.2f}",
                    f"Average daily balance: ₹{a.balance.average_daily_balance:,.2f}",
                    f"Peak: ₹{peak:,.2f}",
                    f"Minimum: ₹{minimum:,.2f}",
                ],
                calculation=f"σ(daily balance) = ₹{a.balance.balance_volatility:,.2f}",
                confidence=0.88,
                specialist="Financial Analyst",
                category="Risk",
                severity="WARNING",
            ))

        return results

    # ────────────────────────────
    # FLOW INSIGHTS
    # ────────────────────────────

    @classmethod
    def _flow_insights(cls, a: BankStatementAnalysis) -> List[Insight]:
        results = []

        # Largest debit as % of average balance
        if a.balance.average_daily_balance > 0:
            debit_pct = a.flow.largest_debit / a.balance.average_daily_balance * 100
            if debit_pct > 50:
                results.append(Insight(
                    headline=f"Largest debit consumed {debit_pct:.0f}% of average balance",
                    narrative=(
                        f"The largest single debit of ₹{a.flow.largest_debit:,.2f} represents "
                        f"{debit_pct:.0f}% of the average daily balance (₹{a.balance.average_daily_balance:,.2f}). "
                        "This indicates a high-impact individual transaction."
                    ),
                    evidence=[
                        f"Largest debit: ₹{a.flow.largest_debit:,.2f}",
                        f"Average daily balance: ₹{a.balance.average_daily_balance:,.2f}",
                    ],
                    calculation=f"₹{a.flow.largest_debit:,.2f} / ₹{a.balance.average_daily_balance:,.2f} × 100 = {debit_pct:.1f}%",
                    confidence=0.95,
                    specialist="Audit Specialist",
                    category="Risk",
                    severity="WARNING" if debit_pct > 80 else "INFO",
                ))

        # Credit/Debit ratio
        ratio = a.flow.credit_debit_ratio
        if ratio < 1.0:
            results.append(Insight(
                headline=f"Outflows exceed inflows — Credit/Debit ratio is {ratio:.2f}",
                narrative=(
                    f"Total credits (₹{a.flow.total_credits:,.2f}) are less than total debits "
                    f"(₹{a.flow.total_debits:,.2f}). The credit/debit ratio of {ratio:.2f} indicates "
                    f"net cash consumption of ₹{abs(a.flow.net_cash_flow):,.2f}."
                ),
                evidence=[
                    f"Total credits: ₹{a.flow.total_credits:,.2f}",
                    f"Total debits: ₹{a.flow.total_debits:,.2f}",
                    f"Ratio: {ratio:.3f}",
                ],
                calculation=f"Credits / Debits = ₹{a.flow.total_credits:,.2f} / ₹{a.flow.total_debits:,.2f} = {ratio:.3f}",
                confidence=1.0,
                specialist="Financial Analyst",
                category="Liquidity",
                severity="WARNING" if ratio < 0.85 else "INFO",
            ))

        # Average vs median gap (skewness indicator)
        if a.flow.median_transaction > 0:
            skew_ratio = a.flow.average_transaction / a.flow.median_transaction
            if skew_ratio > 2.0:
                results.append(Insight(
                    headline=f"Transaction distribution is right-skewed — a few large transactions dominate",
                    narrative=(
                        f"The average transaction (₹{a.flow.average_transaction:,.2f}) is "
                        f"{skew_ratio:.1f}× the median (₹{a.flow.median_transaction:,.2f}). "
                        "This skewness is caused by a small number of high-value transactions "
                        "pulling the average up."
                    ),
                    evidence=[
                        f"Average transaction: ₹{a.flow.average_transaction:,.2f}",
                        f"Median transaction: ₹{a.flow.median_transaction:,.2f}",
                        f"Ratio: {skew_ratio:.1f}×",
                    ],
                    calculation=f"Mean / Median = ₹{a.flow.average_transaction:,.2f} / ₹{a.flow.median_transaction:,.2f} = {skew_ratio:.2f}×",
                    confidence=0.90,
                    specialist="Financial Analyst",
                    category="Pattern",
                    severity="INFO",
                ))

        return results

    # ────────────────────────────
    # PATTERN INSIGHTS
    # ────────────────────────────

    @classmethod
    def _pattern_insights(cls, a: BankStatementAnalysis) -> List[Insight]:
        results = []

        for pattern in a.detected_patterns:
            if pattern.pattern_type == "salary" and pattern.confidence >= 0.7:
                results.append(Insight(
                    headline="Regular salary/income deposits detected",
                    narrative=(
                        f"Found {len(pattern.evidence)} salary-related credits. "
                        f"Credit amounts range from ₹{pattern.amount_range[0]:,.2f} to ₹{pattern.amount_range[1]:,.2f}. "
                        f"Detection confidence: {pattern.confidence*100:.0f}%."
                    ),
                    evidence=pattern.evidence[:3],
                    calculation=f"Keyword pattern match: salary/payroll/NEFT employer",
                    confidence=pattern.confidence,
                    specialist="Expense Intelligence Specialist",
                    category="Pattern",
                    severity="INFO",
                ))

            elif pattern.pattern_type == "loan_emi" and pattern.confidence >= 0.65:
                results.append(Insight(
                    headline=f"Loan EMI pattern detected ({len(pattern.evidence)} occurrences)",
                    narrative=(
                        f"Regular EMI debits found totalling across {len(pattern.evidence)} payments. "
                        f"Average EMI range: ₹{pattern.amount_range[0]:,.2f}–₹{pattern.amount_range[1]:,.2f}."
                    ),
                    evidence=pattern.evidence[:3],
                    calculation="Pattern match: EMI/loan repayment keywords + recurrence",
                    confidence=pattern.confidence,
                    specialist="Financial Analyst",
                    category="Pattern",
                    severity="INFO",
                ))

            elif pattern.pattern_type == "subscription" and len(pattern.evidence) >= 2:
                results.append(Insight(
                    headline=f"Active subscriptions detected",
                    narrative=pattern.description,
                    evidence=pattern.evidence[:5],
                    calculation="Pattern match: Netflix/Spotify/AWS/SaaS service keywords",
                    confidence=pattern.confidence,
                    specialist="Expense Intelligence Specialist",
                    category="Pattern",
                    severity="INFO",
                ))

        # Dormant periods
        if a.dormant_periods:
            longest_gap = max((e - s).days for s, e in a.dormant_periods)
            if longest_gap >= 7:
                results.append(Insight(
                    headline=f"Account inactive for up to {longest_gap} consecutive days",
                    narrative=(
                        f"The account had {len(a.dormant_periods)} periods of inactivity. "
                        f"Longest gap: {longest_gap} days. "
                        "Extended inactivity may indicate missed bill payments or account underuse."
                    ),
                    evidence=[f"{s} → {e} ({(e - s).days} days)" for s, e in a.dormant_periods[:3]],
                    calculation=f"max(gap_days) = {longest_gap}",
                    confidence=0.95,
                    specialist="Audit Specialist",
                    category="Pattern",
                    severity="WARNING" if longest_gap >= 14 else "INFO",
                ))

        return results

    # ────────────────────────────
    # ANOMALY INSIGHTS
    # ────────────────────────────

    @classmethod
    def _anomaly_insights(cls, a: BankStatementAnalysis) -> List[Insight]:
        results = []

        high_severity = [s for s in a.suspicious_transactions if s.severity == "HIGH"]
        if high_severity:
            results.append(Insight(
                headline=f"{len(high_severity)} high-severity anomalous transaction(s) detected",
                narrative=(
                    f"Found {len(high_severity)} transaction(s) that deviate significantly "
                    "from the normal pattern (>3σ above mean or exact duplicate). "
                    "These require review."
                ),
                evidence=[f"₹{s.transaction.amount:,.2f} on {s.transaction.date}: {s.reason}" for s in high_severity[:5]],
                calculation="Statistical outlier: amount > μ + 3σ or exact duplicate detected",
                confidence=0.85,
                specialist="Fraud Detection Specialist",
                category="Anomaly",
                severity="CRITICAL" if len(high_severity) > 2 else "WARNING",
            ))

        medium_severity = [s for s in a.suspicious_transactions if s.severity == "MEDIUM"]
        if medium_severity:
            results.append(Insight(
                headline=f"{len(medium_severity)} moderately unusual transaction(s) flagged",
                narrative=(
                    f"Found {len(medium_severity)} transaction(s) between 2σ–3σ above the mean. "
                    "These are above-average but not necessarily suspicious."
                ),
                evidence=[f"₹{s.transaction.amount:,.2f}: {s.reason}" for s in medium_severity[:3]],
                calculation="Statistical outlier: amount > μ + 2σ",
                confidence=0.70,
                specialist="Fraud Detection Specialist",
                category="Anomaly",
                severity="WARNING",
            ))

        # Spending peaks
        if a.spending_peaks:
            peak_date, peak_amt = max(a.spending_peaks, key=lambda x: x[1])
            avg_daily_debit = a.flow.total_debits / max(a.period_days, 1)
            multiple = peak_amt / (avg_daily_debit + 1e-9)
            results.append(Insight(
                headline=f"Spending spike: {multiple:.1f}× average daily spend on {peak_date}",
                narrative=(
                    f"On {peak_date}, total debits were ₹{peak_amt:,.2f} — "
                    f"{multiple:.1f}× the average daily debit of ₹{avg_daily_debit:,.2f}."
                ),
                evidence=[f"Peak date: {peak_date}", f"Spend: ₹{peak_amt:,.2f}", f"Average: ₹{avg_daily_debit:,.2f}/day"],
                calculation=f"₹{peak_amt:,.2f} / ₹{avg_daily_debit:,.2f} = {multiple:.1f}×",
                confidence=0.90,
                specialist="Fraud Detection Specialist",
                category="Anomaly",
                severity="WARNING" if multiple > 5 else "INFO",
            ))

        return results

    # ────────────────────────────
    # FREQUENCY INSIGHTS
    # ────────────────────────────

    @classmethod
    def _frequency_insights(cls, a: BankStatementAnalysis) -> List[Insight]:
        results = []
        freq = a.stability.transaction_frequency

        results.append(Insight(
            headline=f"Average {freq:.1f} transactions per day over {a.period_days} days",
            narrative=(
                f"The account processed {a.flow.transaction_count} total transactions "
                f"({a.flow.credit_count} credits, {a.flow.debit_count} debits) "
                f"over {a.period_days} days — averaging {freq:.1f} transactions/day."
            ),
            evidence=[
                f"Total transactions: {a.flow.transaction_count}",
                f"Period: {a.period_days} days",
                f"Credits: {a.flow.credit_count}",
                f"Debits: {a.flow.debit_count}",
            ],
            calculation=f"{a.flow.transaction_count} txns / {a.period_days} days = {freq:.2f}/day",
            confidence=1.0,
            specialist="Financial Analyst",
            category="Efficiency",
            severity="INFO",
        ))

        return results

    # ────────────────────────────
    # HEALTH INSIGHTS
    # ────────────────────────────

    @classmethod
    def _health_insights(cls, health: FinancialHealthReport) -> List[Insight]:
        results = []
        for indicator in health.indicators:
            if indicator.risk_level in ("HIGH", "CRITICAL"):
                results.append(Insight(
                    headline=f"⚠ {indicator.name}: {indicator.interpretation.split('.')[0]}",
                    narrative=indicator.interpretation,
                    evidence=indicator.evidence,
                    calculation=f"Formula: {indicator.benchmark}",
                    confidence=indicator.confidence,
                    specialist="CFO Advisor",
                    category="Risk",
                    severity="CRITICAL" if indicator.risk_level == "CRITICAL" else "WARNING",
                ))
        return results
