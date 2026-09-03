import pytest
from datetime import date
from backend.ai.analysis.bank_statement_analyzer import BankStatementAnalyzer, ParsedTransaction

def test_bank_statement_analyzer():
    txns = [
        ParsedTransaction(date=date(2026, 7, 1), description="SALARY", amount=50000.0, txn_type="credit"),
        ParsedTransaction(date=date(2026, 7, 2), description="RENT NEFT", amount=15000.0, txn_type="debit"),
        ParsedTransaction(date=date(2026, 7, 5), description="NETFLIX", amount=999.0, txn_type="debit"),
        ParsedTransaction(date=date(2026, 7, 10), description="SWIGGY", amount=500.0, txn_type="debit"),
    ]
    
    result = BankStatementAnalyzer.analyze(txns)
    
    assert result.flow.total_credits == 50000.0
    assert result.flow.total_debits == 16499.0
    
    assert result.detected_patterns is not None
    assert any(p.pattern_type == "salary" for p in result.detected_patterns)
