import pytest
from backend.services.ocr import OCRValidator

def test_ocr_validator_empty_text():
    text = ""
    validated, score = OCRValidator.validate_and_score(text)
    assert score == 100.0

def test_ocr_validator_gibberish():
    text = "01/O1/2024 !@#$%^&*()_+ ~~~ ||| 1O,000"
    validated, score = OCRValidator.validate_and_score(text)
    assert score < 85.0

def test_ocr_validator_valid_bank_statement():
    text = """
    HDFC Bank Statement
    Account Number: 1234567890
    Date: 2026-07-23
    Date       Description      Debit    Credit
    2026-07-21 AMZN PRIME      999.00
    2026-07-22 SALARY                   50000.00
    """
    validated, score = OCRValidator.validate_and_score(text)
    assert score > 60.0
