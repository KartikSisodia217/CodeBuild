import pytest
from backend.ai.analysis.transaction_classifier import TransactionClassifier, TransactionCategory

def test_classify_food():
    result = TransactionClassifier.classify(
        amount=150.0, description="SWIGGY INSTAMART", txn_type="debit"
    )
    assert result.category == TransactionCategory.FOOD
    assert result.confidence >= 0.8

def test_classify_transport():
    result = TransactionClassifier.classify(
        amount=500.0, description="UBER TRIP", txn_type="debit"
    )
    assert result.category == TransactionCategory.TRAVEL
    assert result.confidence >= 0.8

def test_classify_salary():
    result = TransactionClassifier.classify(
        amount=50000.0, description="NEFT SALARY ACME CORP", txn_type="credit"
    )
    assert result.category == TransactionCategory.SALARY
    assert result.confidence >= 0.8
