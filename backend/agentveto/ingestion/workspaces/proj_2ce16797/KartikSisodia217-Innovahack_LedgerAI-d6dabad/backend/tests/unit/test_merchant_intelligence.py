import pytest
from datetime import date
from backend.ai.analysis.merchant_intelligence import MerchantIntelligence
from backend.ai.analysis.bank_statement_analyzer import ParsedTransaction

def test_merchant_analysis():
    txns = [
        ParsedTransaction(date=date(2026, 7, 21), description="SWIGGY", amount=150.0, txn_type="debit"),
        ParsedTransaction(date=date(2026, 7, 22), description="SWIGGY", amount=200.0, txn_type="debit"),
        ParsedTransaction(date=date(2026, 7, 23), description="NETFLIX", amount=999.0, txn_type="debit"),
    ]
    
    result = MerchantIntelligence.analyze(txns)
    
    # Check top merchants
    top = result.top_by_spend
    assert len(top) > 0
    swiggy_spend = next((m for m in top if m.name == "Swiggy"), None)
    assert swiggy_spend is not None
    assert swiggy_spend.total_spend == 350.0
    
    # Check category breakdown (uncategorized if not provided)
    breakdown = result.category_breakdown
    assert "Uncategorized" in breakdown
    assert breakdown["Uncategorized"] >= 350.0
