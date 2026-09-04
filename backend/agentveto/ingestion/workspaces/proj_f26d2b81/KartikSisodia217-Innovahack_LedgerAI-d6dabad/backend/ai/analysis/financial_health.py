"""
Financial Health Engine — Phase 6
Generates evidence-backed financial health indicators from deterministic analysis results.
Every indicator is derived from computed metrics — never from LLM guesses.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalysis


class RiskLevel(str):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class HealthIndicator:
    name: str
    value: float
    unit: str
    benchmark: str          # e.g. "≥ 3 months of expenses"
    interpretation: str     # Specific to this account's data
    risk_level: str         # RiskLevel value
    evidence: List[str]     # Supporting facts from analysis
    confidence: float       # 0.0-1.0

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "value": round(self.value, 4),
            "unit": self.unit,
            "benchmark": self.benchmark,
            "interpretation": self.interpretation,
            "risk_level": self.risk_level,
            "evidence": self.evidence,
            "confidence": round(self.confidence, 3),
        }


@dataclass
class FinancialHealthReport:
    indicators: List[HealthIndicator]
    overall_score: float        # 0-100 composite health score
    overall_risk: str           # Composite risk level
    summary: str                # One-sentence narrative summary

    def to_dict(self) -> dict:
        return {
            "indicators": [i.to_dict() for i in self.indicators],
            "overall_score": round(self.overall_score, 1),
            "overall_risk": self.overall_risk,
            "summary": self.summary,
        }


class FinancialHealthEngine:

    @classmethod
    def analyze(cls, analysis: BankStatementAnalysis) -> FinancialHealthReport:
        """Generate financial health report from bank statement analysis."""
        indicators: List[HealthIndicator] = []

        indicators.append(cls._liquidity_trend(analysis))
        indicators.append(cls._cash_burn_rate(analysis))
        indicators.append(cls._savings_rate(analysis))
        indicators.append(cls._expense_concentration(analysis))
        indicators.append(cls._income_stability(analysis))
        indicators.append(cls._spending_consistency(analysis))
        indicators.append(cls._emergency_buffer(analysis))
        indicators.append(cls._recurring_expense_ratio(analysis))
        indicators.append(cls._discretionary_spending(analysis))
        indicators.append(cls._budget_risk(analysis))

        # Composite score
        score = cls._compute_overall_score(indicators)
        risk = cls._compute_overall_risk(indicators)
        summary = cls._build_summary(score, risk, analysis)

        return FinancialHealthReport(
            indicators=indicators,
            overall_score=score,
            overall_risk=risk,
            summary=summary,
        )

    @staticmethod
    def _liquidity_trend(a: BankStatementAnalysis) -> HealthIndicator:
        """Is the closing balance higher or lower than opening?"""
        change_pct = a.balance.balance_change_pct
        opening = a.balance.opening_balance
        closing = a.balance.closing_balance

        if change_pct > 20:
            risk = RiskLevel.LOW
            interp = (f"Balance grew by {change_pct:.1f}% over the statement period "
                      f"(₹{opening:,.2f} → ₹{closing:,.2f}). Strong positive liquidity trend.")
        elif change_pct >= 0:
            risk = RiskLevel.LOW
            interp = (f"Balance is stable with {change_pct:.1f}% growth "
                      f"(₹{opening:,.2f} → ₹{closing:,.2f}).")
        elif change_pct >= -15:
            risk = RiskLevel.MODERATE
            interp = (f"Balance declined {abs(change_pct):.1f}% over the period "
                      f"(₹{opening:,.2f} → ₹{closing:,.2f}). Mild liquidity deterioration.")
        else:
            risk = RiskLevel.HIGH
            interp = (f"Balance fell sharply by {abs(change_pct):.1f}% "
                      f"(₹{opening:,.2f} → ₹{closing:,.2f}). Significant liquidity concern.")

        return HealthIndicator(
            name="Liquidity Trend",
            value=round(change_pct, 2),
            unit="%",
            benchmark="Positive or stable balance trajectory",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Opening balance: ₹{opening:,.2f}",
                f"Closing balance: ₹{closing:,.2f}",
                f"Net cash flow: ₹{a.flow.net_cash_flow:,.2f}",
            ],
            confidence=0.95 if a.balance.opening_balance > 0 else 0.6,
        )

    @staticmethod
    def _cash_burn_rate(a: BankStatementAnalysis) -> HealthIndicator:
        """Average daily spend."""
        daily_burn = a.flow.total_debits / max(a.period_days, 1)
        weekly_burn = daily_burn * 7
        monthly_burn = daily_burn * 30

        if daily_burn == 0:
            risk = RiskLevel.LOW
            interp = "No outflows detected in this period."
        elif monthly_burn < a.balance.average_daily_balance * 0.5:
            risk = RiskLevel.LOW
            interp = f"Monthly burn ₹{monthly_burn:,.2f} is well within average balance ₹{a.balance.average_daily_balance:,.2f}."
        elif monthly_burn < a.balance.average_daily_balance:
            risk = RiskLevel.MODERATE
            interp = f"Monthly burn ₹{monthly_burn:,.2f} consumes a significant share of average balance."
        else:
            risk = RiskLevel.HIGH
            interp = f"Monthly burn ₹{monthly_burn:,.2f} exceeds average daily balance — high depletion risk."

        return HealthIndicator(
            name="Cash Burn Rate",
            value=round(daily_burn, 2),
            unit="₹/day",
            benchmark="Monthly burn < 50% of average balance",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Total debits: ₹{a.flow.total_debits:,.2f} over {a.period_days} days",
                f"Daily burn: ₹{daily_burn:,.2f}",
                f"Weekly burn: ₹{weekly_burn:,.2f}",
                f"Monthly burn: ₹{monthly_burn:,.2f}",
            ],
            confidence=1.0,
        )

    @staticmethod
    def _savings_rate(a: BankStatementAnalysis) -> HealthIndicator:
        """(Credits - Debits) / Credits."""
        if a.flow.total_credits == 0:
            return HealthIndicator(
                name="Savings Rate", value=0.0, unit="%",
                benchmark="≥ 20% of income saved",
                interpretation="No credits detected — savings rate cannot be computed.",
                risk_level=RiskLevel.MODERATE,
                evidence=[], confidence=0.0,
            )

        rate = (a.flow.net_cash_flow / a.flow.total_credits) * 100

        if rate >= 30:
            risk = RiskLevel.LOW
            interp = f"Excellent savings rate of {rate:.1f}%. Retaining ₹{a.flow.net_cash_flow:,.2f} of ₹{a.flow.total_credits:,.2f} received."
        elif rate >= 20:
            risk = RiskLevel.LOW
            interp = f"Good savings rate of {rate:.1f}%."
        elif rate >= 10:
            risk = RiskLevel.MODERATE
            interp = f"Below-average savings rate of {rate:.1f}%. Consider reducing discretionary spend."
        elif rate >= 0:
            risk = RiskLevel.MODERATE
            interp = f"Low savings rate of {rate:.1f}%. Almost all income is being consumed."
        else:
            risk = RiskLevel.HIGH
            interp = f"Negative savings rate ({rate:.1f}%). Spending exceeds income by ₹{abs(a.flow.net_cash_flow):,.2f}."

        return HealthIndicator(
            name="Savings Rate",
            value=round(rate, 2),
            unit="%",
            benchmark="≥ 20% of income saved",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Total credits: ₹{a.flow.total_credits:,.2f}",
                f"Total debits: ₹{a.flow.total_debits:,.2f}",
                f"Net retained: ₹{a.flow.net_cash_flow:,.2f}",
            ],
            confidence=0.95,
        )

    @staticmethod
    def _expense_concentration(a: BankStatementAnalysis) -> HealthIndicator:
        """What % of spending is the top single debit?"""
        if a.flow.total_debits == 0:
            return HealthIndicator(
                name="Expense Concentration", value=0.0, unit="%",
                benchmark="No single debit > 30% of total",
                interpretation="No debits detected.",
                risk_level=RiskLevel.LOW, evidence=[], confidence=0.0,
            )

        top_debit_pct = (a.flow.largest_debit / a.flow.total_debits) * 100

        if top_debit_pct > 50:
            risk = RiskLevel.HIGH
            interp = f"Highest debit (₹{a.flow.largest_debit:,.2f}) represents {top_debit_pct:.1f}% of all spending — extreme concentration risk."
        elif top_debit_pct > 30:
            risk = RiskLevel.MODERATE
            interp = f"Highest debit (₹{a.flow.largest_debit:,.2f}) is {top_debit_pct:.1f}% of total spend — moderate concentration."
        else:
            risk = RiskLevel.LOW
            interp = f"Spending is reasonably distributed. Largest debit is {top_debit_pct:.1f}% of total."

        return HealthIndicator(
            name="Expense Concentration",
            value=round(top_debit_pct, 2),
            unit="%",
            benchmark="No single debit > 30% of total spend",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Largest single debit: ₹{a.flow.largest_debit:,.2f}",
                f"Total debits: ₹{a.flow.total_debits:,.2f}",
            ],
            confidence=1.0,
        )

    @staticmethod
    def _income_stability(a: BankStatementAnalysis) -> HealthIndicator:
        """Coefficient of variation of credit transactions."""
        stability = a.stability.inflow_stability  # 1 - CV

        if stability >= 0.85:
            risk = RiskLevel.LOW
            interp = f"Income is highly stable (stability score: {stability:.2f}). Credits are consistent in size."
        elif stability >= 0.65:
            risk = RiskLevel.MODERATE
            interp = f"Income shows moderate variability (stability: {stability:.2f}). Some irregular credits."
        else:
            risk = RiskLevel.HIGH
            interp = f"Income is highly variable (stability: {stability:.2f}). Credits are unpredictable — budget planning is challenging."

        return HealthIndicator(
            name="Income Stability",
            value=round(stability, 4),
            unit="score (0–1)",
            benchmark="≥ 0.75 (consistent income)",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Credit transactions: {a.flow.credit_count}",
                f"Average credit: ₹{(a.flow.total_credits / max(a.flow.credit_count, 1)):,.2f}",
            ],
            confidence=0.85 if a.flow.credit_count >= 3 else 0.4,
        )

    @staticmethod
    def _spending_consistency(a: BankStatementAnalysis) -> HealthIndicator:
        """Coefficient of variation of debit transactions."""
        stability = a.stability.outflow_stability  # 1 - CV

        if stability >= 0.80:
            risk = RiskLevel.LOW
            interp = "Spending is highly consistent. Predictable outflow pattern."
        elif stability >= 0.60:
            risk = RiskLevel.MODERATE
            interp = f"Spending has moderate variability (stability: {stability:.2f}). Some irregular large purchases."
        else:
            risk = RiskLevel.HIGH
            interp = f"Spending is erratic (stability: {stability:.2f}). Large swings in debit amounts suggest unplanned expenditure."

        return HealthIndicator(
            name="Spending Consistency",
            value=round(stability, 4),
            unit="score (0–1)",
            benchmark="≥ 0.70 (predictable spending)",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Debit transactions: {a.flow.debit_count}",
                f"Average debit: ₹{(a.flow.total_debits / max(a.flow.debit_count, 1)):,.2f}",
                f"Largest debit: ₹{a.flow.largest_debit:,.2f}",
            ],
            confidence=0.85 if a.flow.debit_count >= 5 else 0.4,
        )

    @staticmethod
    def _emergency_buffer(a: BankStatementAnalysis) -> HealthIndicator:
        """How many months of expenses can the closing balance cover?"""
        monthly_expenses = a.flow.total_debits / max(a.period_days / 30, 1)
        if monthly_expenses == 0:
            months = float('inf')
        else:
            months = a.balance.closing_balance / monthly_expenses

        if months >= 6:
            risk = RiskLevel.LOW
            interp = f"Closing balance covers {months:.1f} months of expenses — excellent emergency buffer."
        elif months >= 3:
            risk = RiskLevel.LOW
            interp = f"Closing balance covers {months:.1f} months of expenses — adequate buffer."
        elif months >= 1:
            risk = RiskLevel.MODERATE
            interp = f"Closing balance covers only {months:.1f} months of expenses — limited emergency reserve."
        else:
            risk = RiskLevel.HIGH
            interp = f"Closing balance (₹{a.balance.closing_balance:,.2f}) covers less than 1 month of expenses — critical buffer risk."

        return HealthIndicator(
            name="Emergency Buffer",
            value=round(months, 2),
            unit="months",
            benchmark="≥ 3 months of expenses",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Closing balance: ₹{a.balance.closing_balance:,.2f}",
                f"Estimated monthly expenses: ₹{monthly_expenses:,.2f}",
            ],
            confidence=0.80,
        )

    @staticmethod
    def _recurring_expense_ratio(a: BankStatementAnalysis) -> HealthIndicator:
        """% of spending from recurring patterns (EMI, rent, utilities, subscriptions)."""
        recurring_types = {"loan_emi", "rent", "utility", "subscription"}
        recurring_total = sum(
            p.amount_range[1] * (p.amount_range[0] / p.amount_range[1] if p.amount_range[1] > 0 else 1)
            for p in a.detected_patterns
            if p.pattern_type in recurring_types
        )
        # Better approach: count by pattern evidence counts
        recurring_txn_count = sum(
            len(p.evidence) for p in a.detected_patterns if p.pattern_type in recurring_types
        )
        recurring_est = 0.0
        if recurring_txn_count > 0 and a.flow.debit_count > 0:
            recurring_pct = (recurring_txn_count / a.flow.debit_count) * 100
        else:
            recurring_pct = 0.0

        if recurring_pct > 70:
            risk = RiskLevel.HIGH
            interp = f"Approximately {recurring_pct:.0f}% of transactions are recurring fixed expenses — very high fixed cost burden."
        elif recurring_pct > 40:
            risk = RiskLevel.MODERATE
            interp = f"About {recurring_pct:.0f}% of transactions are recurring — moderate fixed obligation ratio."
        else:
            risk = RiskLevel.LOW
            interp = f"About {recurring_pct:.0f}% of transactions are recurring — healthy flexibility in spending."

        recurring_patterns = [p.description for p in a.detected_patterns if p.pattern_type in recurring_types]

        return HealthIndicator(
            name="Recurring Expense Ratio",
            value=round(recurring_pct, 2),
            unit="%",
            benchmark="< 50% of transactions are fixed obligations",
            interpretation=interp,
            risk_level=risk,
            evidence=recurring_patterns[:5] if recurring_patterns else ["No recurring patterns detected"],
            confidence=0.70 if recurring_txn_count > 0 else 0.3,
        )

    @staticmethod
    def _discretionary_spending(a: BankStatementAnalysis) -> HealthIndicator:
        """% of debit from food/travel/entertainment relative to total debits."""
        discretionary_types = {"food", "travel", "subscription"}
        disc_txn_count = sum(
            len(p.evidence) for p in a.detected_patterns if p.pattern_type in discretionary_types
        )
        disc_pct = (disc_txn_count / a.flow.debit_count * 100) if a.flow.debit_count > 0 else 0.0

        if disc_pct > 35:
            risk = RiskLevel.HIGH
            interp = f"Discretionary spending is ~{disc_pct:.0f}% of transactions — potentially excessive lifestyle spend."
        elif disc_pct > 20:
            risk = RiskLevel.MODERATE
            interp = f"Discretionary spend at ~{disc_pct:.0f}% — watch for lifestyle inflation."
        else:
            risk = RiskLevel.LOW
            interp = f"Discretionary spending appears controlled at ~{disc_pct:.0f}% of transactions."

        return HealthIndicator(
            name="Discretionary Spending",
            value=round(disc_pct, 2),
            unit="%",
            benchmark="< 25% of transactions",
            interpretation=interp,
            risk_level=risk,
            evidence=[p.description for p in a.detected_patterns if p.pattern_type in discretionary_types][:5],
            confidence=0.65,
        )

    @staticmethod
    def _budget_risk(a: BankStatementAnalysis) -> HealthIndicator:
        """Does recurring expense > 70% of average monthly credits?"""
        monthly_credits = a.flow.total_credits / max(a.period_days / 30, 1)

        # Recurring costs estimation: count salary/emi/rent/utility evidence items
        fixed_patterns = {"loan_emi", "rent", "utility", "salary"}
        fixed_txn_count = sum(
            len(p.evidence) for p in a.detected_patterns if p.pattern_type in fixed_patterns
        )
        # Rough estimate: use debit_count ratio
        fixed_monthly_est = (fixed_txn_count / a.flow.debit_count * a.flow.total_debits / max(a.period_days / 30, 1)) if a.flow.debit_count > 0 else 0

        ratio = (fixed_monthly_est / monthly_credits * 100) if monthly_credits > 0 else 0

        if ratio > 80:
            risk = RiskLevel.CRITICAL
            interp = f"Estimated fixed obligations (~{ratio:.0f}% of income) leave very little margin — budget is under severe pressure."
        elif ratio > 60:
            risk = RiskLevel.HIGH
            interp = f"Fixed obligations estimated at ~{ratio:.0f}% of income — limited discretionary budget."
        elif ratio > 40:
            risk = RiskLevel.MODERATE
            interp = f"Fixed obligations at ~{ratio:.0f}% of income — manageable but worth monitoring."
        else:
            risk = RiskLevel.LOW
            interp = f"Fixed obligations appear well below income — healthy budget flexibility."

        return HealthIndicator(
            name="Budget Risk",
            value=round(ratio, 2),
            unit="%",
            benchmark="Fixed obligations < 60% of income",
            interpretation=interp,
            risk_level=risk,
            evidence=[
                f"Estimated monthly income: ₹{monthly_credits:,.2f}",
                f"Estimated monthly fixed costs: ₹{fixed_monthly_est:,.2f}",
            ],
            confidence=0.55,  # Estimation, not precise
        )

    @staticmethod
    def _compute_overall_score(indicators: List[HealthIndicator]) -> float:
        """Weighted average health score 0-100."""
        risk_scores = {
            RiskLevel.LOW: 100,
            RiskLevel.MODERATE: 60,
            RiskLevel.HIGH: 25,
            RiskLevel.CRITICAL: 5,
        }
        weighted_scores = [risk_scores.get(i.risk_level, 50) * i.confidence for i in indicators]
        total_weight = sum(i.confidence for i in indicators)
        if total_weight == 0:
            return 50.0
        return sum(weighted_scores) / total_weight

    @staticmethod
    def _compute_overall_risk(indicators: List[HealthIndicator]) -> str:
        risk_hierarchy = [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MODERATE, RiskLevel.LOW]
        for level in risk_hierarchy:
            if sum(1 for i in indicators if i.risk_level == level) >= 2:
                return level
        return RiskLevel.LOW

    @staticmethod
    def _build_summary(score: float, risk: str, a: BankStatementAnalysis) -> str:
        direction = "improved" if a.balance.balance_change_pct > 0 else "declined"
        return (
            f"Overall financial health score: {score:.0f}/100 (Risk: {risk}). "
            f"Balance {direction} by {abs(a.balance.balance_change_pct):.1f}% over {a.period_days} days. "
            f"Net cash flow: ₹{a.flow.net_cash_flow:,.2f} across {a.flow.transaction_count} transactions."
        )
