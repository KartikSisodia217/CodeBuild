from typing import List, Dict, Any
from asteval import Interpreter
from backend.ai.tools.registry import registry, ToolDefinition

# Import Phase 6 Deterministic Engines
from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer
from backend.ai.analysis.transaction_classifier import TransactionClassifier
from backend.ai.analysis.merchant_intelligence import MerchantIntelligence
from backend.ai.analysis.metrics_library import (
    current_ratio, quick_ratio, net_cash_flow, burn_rate, runway_days
)

aeval = Interpreter()

class CashFlowCalculator:
    @staticmethod
    def calculate(inflows: List[float], outflows: List[float]) -> Dict[str, Any]:
        total_in = sum(inflows)
        total_out = sum(outflows)
        return {
            "total_inflows": total_in,
            "total_outflows": total_out,
            "net_cash_flow": total_in - total_out
        }

class RatioCalculator:
    @staticmethod
    def calculate(revenue: float, costs: float, current_assets: float, current_liabilities: float) -> Dict[str, Any]:
        profit_margin = ((revenue - costs) / revenue) * 100 if revenue > 0 else 0
        current_ratio = (current_assets / current_liabilities) if current_liabilities > 0 else 0
        return {
            "profit_margin": round(profit_margin, 2),
            "current_ratio": round(current_ratio, 2)
        }

class DuplicateDetection:
    @staticmethod
    def detect(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        seen = {}
        duplicates = []
        for txn in transactions:
            key = f"{txn.get('amount')}_{txn.get('date')}_{txn.get('vendor')}"
            if key in seen:
                duplicates.append(txn)
            else:
                seen[key] = txn
        return {
            "duplicate_count": len(duplicates),
            "duplicates": duplicates
        }

class OutlierDetection:
    @staticmethod
    def detect(amounts: List[float], threshold: float = 2.0) -> Dict[str, Any]:
        if not amounts:
            return {"outliers": []}
        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5
        outliers = [x for x in amounts if abs(x - mean) > threshold * std_dev]
        return {
            "mean": round(mean, 2),
            "std_dev": round(std_dev, 2),
            "outliers": outliers
        }

class TrendDetection:
    @staticmethod
    def detect(values_over_time: List[float]) -> Dict[str, Any]:
        if len(values_over_time) < 2:
            return {"trend": "Insufficient data"}
        first, last = values_over_time[0], values_over_time[-1]
        trend = "Upward" if last > first else "Downward" if last < first else "Stable"
        growth_rate = ((last - first) / first) * 100 if first > 0 else 0
        return {
            "trend": trend,
            "growth_rate": round(growth_rate, 2)
        }

class VarianceCalculator:
    @staticmethod
    def calculate(budgeted: float, actual: float) -> Dict[str, Any]:
        variance = actual - budgeted
        variance_percent = (variance / budgeted) * 100 if budgeted > 0 else 0
        return {
            "variance": variance,
            "variance_percent": round(variance_percent, 2),
            "is_favorable": variance <= 0 # Assuming expenses
        }

class ReconciliationEngine:
    @staticmethod
    def reconcile(ledger_balance: float, bank_balance: float, outstanding_checks: float, deposits_in_transit: float) -> Dict[str, Any]:
        adjusted_bank = bank_balance - outstanding_checks + deposits_in_transit
        is_reconciled = round(ledger_balance, 2) == round(adjusted_bank, 2)
        difference = ledger_balance - adjusted_bank
        return {
            "is_reconciled": is_reconciled,
            "difference": difference
        }

class AgingAnalysis:
    @staticmethod
    def analyze(invoices: List[Dict[str, Any]]) -> Dict[str, Any]:
        buckets = {"0-30": 0, "31-60": 0, "61-90": 0, "90+": 0}
        for inv in invoices:
            days = inv.get("days_overdue", 0)
            amt = inv.get("amount", 0)
            if days <= 30: buckets["0-30"] += amt
            elif days <= 60: buckets["31-60"] += amt
            elif days <= 90: buckets["61-90"] += amt
            else: buckets["90+"] += amt
        return {
            "aging_buckets": buckets
        }

class FinancialKPIEngine:
    @staticmethod
    def calculate(data: Dict[str, float]) -> Dict[str, Any]:
        working_capital = data.get("current_assets", 0) - data.get("current_liabilities", 0)
        debt_to_equity = data.get("total_liabilities", 0) / data.get("shareholders_equity", 1) if data.get("shareholders_equity") else 0
        return {
            "working_capital": working_capital,
            "debt_to_equity": round(debt_to_equity, 2)
        }

# Register all tools
registry.register(ToolDefinition(
    name="Cash Flow Calculator", description="Calculates net cash flow",
    inputs=["inflows", "outflows"], outputs=["total_inflows", "total_outflows", "net_cash_flow"],
    handler=CashFlowCalculator.calculate
))

registry.register(ToolDefinition(
    name="Ratio Calculator", description="Calculates financial ratios like profit margin and current ratio",
    inputs=["revenue", "costs", "current_assets", "current_liabilities"], outputs=["profit_margin", "current_ratio"],
    handler=RatioCalculator.calculate
))

registry.register(ToolDefinition(
    name="Duplicate Detection", description="Detects exact duplicate transactions",
    inputs=["transactions"], outputs=["duplicate_count", "duplicates"],
    handler=DuplicateDetection.detect
))

registry.register(ToolDefinition(
    name="Outlier Detection", description="Detects statistical anomalies in amounts",
    inputs=["amounts", "threshold"], outputs=["mean", "std_dev", "outliers"],
    handler=OutlierDetection.detect
))

registry.register(ToolDefinition(
    name="Trend Detection", description="Detects upward or downward trends in a time series",
    inputs=["values_over_time"], outputs=["trend", "growth_rate"],
    handler=TrendDetection.detect
))

registry.register(ToolDefinition(
    name="Variance Calculator", description="Calculates budget vs actual variance",
    inputs=["budgeted", "actual"], outputs=["variance", "variance_percent", "is_favorable"],
    handler=VarianceCalculator.calculate
))

registry.register(ToolDefinition(
    name="Reconciliation Engine", description="Reconciles a ledger balance with a bank balance",
    inputs=["ledger_balance", "bank_balance", "outstanding_checks", "deposits_in_transit"], outputs=["is_reconciled", "difference"],
    handler=ReconciliationEngine.reconcile
))

registry.register(ToolDefinition(
    name="Aging Analysis", description="Buckets invoices by days overdue",
    inputs=["invoices"], outputs=["aging_buckets"],
    handler=AgingAnalysis.analyze
))

registry.register(ToolDefinition(
    name="Financial KPI Engine", description="Calculates complex working capital metrics",
    inputs=["data"], outputs=["working_capital", "debt_to_equity"],
    handler=FinancialKPIEngine.calculate
))

registry.register(ToolDefinition(
    name="Balance Validator", description="Validates debits vs credits in a ledger",
    inputs=["debits", "credits"], outputs=["is_balanced", "difference"],
    handler=lambda debits, credits: {"is_balanced": sum(debits) == sum(credits), "difference": sum(debits) - sum(credits)}
))

registry.register(ToolDefinition(
    name="Calculator", description="Basic mathematical calculations for tax implications",
    inputs=["expression"], outputs=["result"],
    handler=lambda expression: {"result": aeval(expression)} # Replaced eval with secure asteval
))

# ── Phase 6 Tools ──

registry.register(ToolDefinition(
    name="Bank Statement Analyzer", 
    description="Deterministically analyzes bank statements to compute metrics and detect patterns",
    inputs=["text_content"], outputs=["analysis_summary", "transaction_count", "suspicious_transactions"],
    handler=lambda text: BankStatementAnalyzer.from_text(text)[0].to_summary_dict()
))

registry.register(ToolDefinition(
    name="Transaction Classifier", 
    description="Categorizes transactions using rules and keywords",
    inputs=["transactions"], outputs=["category_summary"],
    handler=lambda txns: TransactionClassifier.category_summary(TransactionClassifier.classify_batch(txns))
))

registry.register(ToolDefinition(
    name="Merchant Intelligence", 
    description="Extracts merchant profiles and spending trends from transactions",
    inputs=["transactions"], outputs=["merchant_profiles", "recurring_merchants"],
    handler=lambda txns: MerchantIntelligence.analyze(txns).to_dict()
))

