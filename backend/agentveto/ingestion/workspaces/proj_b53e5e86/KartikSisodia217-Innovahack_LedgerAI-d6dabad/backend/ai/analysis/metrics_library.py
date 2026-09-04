"""
Accounting Metrics Library — Phase 6
All metrics are deterministic. Each returns MetricResult(value, formula, interpretation, confidence).
No LLM is used in this module.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class MetricResult:
    name: str
    value: float
    formula: str
    interpretation: str
    confidence: float  # 0.0 – 1.0
    unit: str = ""

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "value": round(self.value, 4),
            "formula": self.formula,
            "interpretation": self.interpretation,
            "confidence": round(self.confidence, 4),
            "unit": self.unit,
        }


def _safe_div(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    """Division that never raises ZeroDivisionError."""
    if denominator == 0:
        return fallback
    return numerator / denominator


# ─────────────────────────────────────────────
# CASH FLOW
# ─────────────────────────────────────────────

def net_cash_flow(total_credits: float, total_debits: float) -> MetricResult:
    value = total_credits - total_debits
    sign = "+" if value >= 0 else ""
    interp = (
        f"Net cash position is {sign}₹{value:,.2f}. "
        + ("Account is net positive — more received than spent." if value >= 0
           else "Account is net negative — more spent than received.")
    )
    return MetricResult(
        name="Net Cash Flow",
        value=value,
        formula="Total Credits − Total Debits",
        interpretation=interp,
        confidence=1.0,
        unit="₹",
    )


def operating_cash_flow(credits: List[float], debits: List[float]) -> MetricResult:
    value = sum(credits) - sum(debits)
    return MetricResult(
        name="Operating Cash Flow",
        value=value,
        formula="Σ Credits − Σ Debits",
        interpretation=f"Operating cash generated/used: ₹{value:,.2f}",
        confidence=1.0,
        unit="₹",
    )


def burn_rate(total_debits: float, period_days: int) -> MetricResult:
    daily = _safe_div(total_debits, period_days)
    weekly = daily * 7
    return MetricResult(
        name="Burn Rate",
        value=round(daily, 2),
        formula="Total Debits ÷ Period Days",
        interpretation=(
            f"Average daily spend: ₹{daily:,.2f}. "
            f"Weekly burn: ₹{weekly:,.2f}."
        ),
        confidence=1.0,
        unit="₹/day",
    )


def runway_days(closing_balance: float, daily_burn: float) -> MetricResult:
    days = _safe_div(closing_balance, daily_burn)
    return MetricResult(
        name="Runway (Days)",
        value=round(days, 1),
        formula="Closing Balance ÷ Daily Burn Rate",
        interpretation=(
            f"At current burn, funds last approximately {days:.0f} days "
            f"({days/30:.1f} months)."
            if days > 0 else "Cannot compute runway — zero daily burn."
        ),
        confidence=0.9 if daily_burn > 0 else 0.0,
        unit="days",
    )


# ─────────────────────────────────────────────
# LIQUIDITY
# ─────────────────────────────────────────────

def current_ratio(current_assets: float, current_liabilities: float) -> MetricResult:
    value = _safe_div(current_assets, current_liabilities)
    if value >= 2.0:
        interp = f"Current ratio {value:.2f} — strong liquidity (benchmark ≥ 2.0)."
    elif value >= 1.0:
        interp = f"Current ratio {value:.2f} — adequate liquidity (benchmark ≥ 2.0)."
    else:
        interp = f"Current ratio {value:.2f} — liquidity risk; liabilities exceed assets."
    return MetricResult(
        name="Current Ratio",
        value=value,
        formula="Current Assets ÷ Current Liabilities",
        interpretation=interp,
        confidence=1.0 if current_liabilities > 0 else 0.0,
    )


def quick_ratio(current_assets: float, inventory: float, current_liabilities: float) -> MetricResult:
    value = _safe_div(current_assets - inventory, current_liabilities)
    interp = (
        f"Quick ratio {value:.2f} — {'adequate' if value >= 1.0 else 'potentially insufficient'} "
        "liquid assets to cover short-term obligations."
    )
    return MetricResult(
        name="Quick Ratio",
        value=value,
        formula="(Current Assets − Inventory) ÷ Current Liabilities",
        interpretation=interp,
        confidence=1.0 if current_liabilities > 0 else 0.0,
    )


def cash_ratio(cash: float, current_liabilities: float) -> MetricResult:
    value = _safe_div(cash, current_liabilities)
    return MetricResult(
        name="Cash Ratio",
        value=value,
        formula="Cash ÷ Current Liabilities",
        interpretation=f"Cash ratio {value:.2f} — {value*100:.1f}% of liabilities coverable by cash alone.",
        confidence=1.0 if current_liabilities > 0 else 0.0,
    )


# ─────────────────────────────────────────────
# PROFITABILITY & MARGIN
# ─────────────────────────────────────────────

def gross_margin(revenue: float, cogs: float) -> MetricResult:
    gp = revenue - cogs
    value = _safe_div(gp, revenue) * 100
    return MetricResult(
        name="Gross Margin",
        value=round(value, 2),
        formula="(Revenue − COGS) ÷ Revenue × 100",
        interpretation=f"Gross margin is {value:.1f}% — ₹{gp:,.2f} gross profit on ₹{revenue:,.2f} revenue.",
        confidence=1.0 if revenue > 0 else 0.0,
        unit="%",
    )


def operating_margin(operating_income: float, revenue: float) -> MetricResult:
    value = _safe_div(operating_income, revenue) * 100
    interp = f"Operating margin {value:.1f}% — {'healthy' if value > 15 else 'thin' if value > 5 else 'loss-making'} operations."
    return MetricResult(
        name="Operating Margin",
        value=round(value, 2),
        formula="Operating Income ÷ Revenue × 100",
        interpretation=interp,
        confidence=1.0 if revenue > 0 else 0.0,
        unit="%",
    )


def net_margin(net_income: float, revenue: float) -> MetricResult:
    value = _safe_div(net_income, revenue) * 100
    return MetricResult(
        name="Net Margin",
        value=round(value, 2),
        formula="Net Income ÷ Revenue × 100",
        interpretation=f"Net margin {value:.1f}% — {value:.1f} paise profit per ₹1 revenue.",
        confidence=1.0 if revenue > 0 else 0.0,
        unit="%",
    )


# ─────────────────────────────────────────────
# SOLVENCY
# ─────────────────────────────────────────────

def debt_ratio(total_liabilities: float, total_assets: float) -> MetricResult:
    value = _safe_div(total_liabilities, total_assets)
    interp = (
        f"Debt ratio {value:.2f} — "
        + ("low leverage, conservative financing." if value < 0.4
           else "moderate leverage." if value < 0.6
           else "high leverage — significant debt burden.")
    )
    return MetricResult(
        name="Debt Ratio",
        value=round(value, 4),
        formula="Total Liabilities ÷ Total Assets",
        interpretation=interp,
        confidence=1.0 if total_assets > 0 else 0.0,
    )


def debt_to_equity(total_liabilities: float, shareholders_equity: float) -> MetricResult:
    value = _safe_div(total_liabilities, shareholders_equity)
    return MetricResult(
        name="Debt-to-Equity Ratio",
        value=round(value, 4),
        formula="Total Liabilities ÷ Shareholders' Equity",
        interpretation=f"D/E ratio {value:.2f}x — creditors hold {value:.2f}x equity holders' stake.",
        confidence=1.0 if shareholders_equity > 0 else 0.0,
    )


def interest_coverage(ebit: float, interest_expense: float) -> MetricResult:
    value = _safe_div(ebit, interest_expense)
    interp = (
        f"Interest coverage {value:.1f}x — "
        + ("comfortably covers interest." if value >= 3
           else "marginally covers interest." if value >= 1.5
           else "interest coverage below safe threshold — repayment risk.")
    )
    return MetricResult(
        name="Interest Coverage Ratio",
        value=round(value, 2),
        formula="EBIT ÷ Interest Expense",
        interpretation=interp,
        confidence=1.0 if interest_expense > 0 else 0.0,
    )


# ─────────────────────────────────────────────
# EFFICIENCY
# ─────────────────────────────────────────────

def asset_turnover(revenue: float, total_assets: float) -> MetricResult:
    value = _safe_div(revenue, total_assets)
    return MetricResult(
        name="Asset Turnover",
        value=round(value, 4),
        formula="Revenue ÷ Total Assets",
        interpretation=f"Asset turnover {value:.2f}x — generates ₹{value:.2f} revenue per ₹1 of assets.",
        confidence=1.0 if total_assets > 0 else 0.0,
        unit="x",
    )


def receivables_turnover(net_credit_sales: float, avg_accounts_receivable: float) -> MetricResult:
    value = _safe_div(net_credit_sales, avg_accounts_receivable)
    days = _safe_div(365, value)
    return MetricResult(
        name="Receivables Turnover",
        value=round(value, 2),
        formula="Net Credit Sales ÷ Avg. Accounts Receivable",
        interpretation=f"Receivables turn over {value:.1f}x/year — average collection period: {days:.0f} days.",
        confidence=1.0 if avg_accounts_receivable > 0 else 0.0,
        unit="x/year",
    )


def payables_turnover(total_purchases: float, avg_accounts_payable: float) -> MetricResult:
    value = _safe_div(total_purchases, avg_accounts_payable)
    dpo = _safe_div(365, value)
    return MetricResult(
        name="Payables Turnover",
        value=round(value, 2),
        formula="Total Purchases ÷ Avg. Accounts Payable",
        interpretation=f"Payables turn over {value:.1f}x/year — average payment period: {dpo:.0f} days.",
        confidence=1.0 if avg_accounts_payable > 0 else 0.0,
        unit="x/year",
    )


# ─────────────────────────────────────────────
# WORKING CAPITAL
# ─────────────────────────────────────────────

def working_capital(current_assets: float, current_liabilities: float) -> MetricResult:
    value = current_assets - current_liabilities
    interp = (
        f"Working capital ₹{value:,.2f} — "
        + ("positive; short-term obligations are covered." if value >= 0
           else "negative; short-term liquidity risk.")
    )
    return MetricResult(
        name="Working Capital",
        value=value,
        formula="Current Assets − Current Liabilities",
        interpretation=interp,
        confidence=1.0,
        unit="₹",
    )


# ─────────────────────────────────────────────
# GROWTH
# ─────────────────────────────────────────────

def revenue_growth(current_revenue: float, prior_revenue: float) -> MetricResult:
    value = _safe_div(current_revenue - prior_revenue, prior_revenue) * 100
    return MetricResult(
        name="Revenue Growth",
        value=round(value, 2),
        formula="(Current − Prior) ÷ Prior × 100",
        interpretation=f"Revenue {'grew' if value >= 0 else 'declined'} by {abs(value):.1f}% vs prior period.",
        confidence=1.0 if prior_revenue > 0 else 0.0,
        unit="%",
    )


def expense_growth(current_expenses: float, prior_expenses: float) -> MetricResult:
    value = _safe_div(current_expenses - prior_expenses, prior_expenses) * 100
    interp = (
        f"Expenses {'increased' if value >= 0 else 'decreased'} by {abs(value):.1f}% vs prior period. "
        + ("Monitor for cost inflation." if value > 20 else "")
    )
    return MetricResult(
        name="Expense Growth",
        value=round(value, 2),
        formula="(Current − Prior) ÷ Prior × 100",
        interpretation=interp,
        confidence=1.0 if prior_expenses > 0 else 0.0,
        unit="%",
    )
