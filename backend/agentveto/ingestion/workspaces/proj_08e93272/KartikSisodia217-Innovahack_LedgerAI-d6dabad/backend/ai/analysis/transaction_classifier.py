"""
Transaction Classifier — Phase 6
Deterministic rule-based classification first; LLM fallback only for unknowns.
Batch-processes transactions to minimize LLM calls.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Dict


class TransactionCategory(str, Enum):
    SALARY = "Salary"
    VENDOR_PAYMENT = "Vendor Payment"
    CUSTOMER_RECEIPT = "Customer Receipt"
    INTEREST = "Interest"
    FOOD = "Food & Dining"
    TRAVEL = "Travel & Transport"
    UTILITIES = "Utilities"
    RENT = "Rent"
    TRANSFER = "Transfer"
    TAX = "Tax"
    INVESTMENT = "Investment"
    SUBSCRIPTION = "Subscription"
    ATM = "ATM Withdrawal"
    CASH_DEPOSIT = "Cash Deposit"
    REFUND = "Refund"
    INSURANCE = "Insurance"
    HEALTHCARE = "Healthcare"
    SHOPPING = "Shopping"
    EDUCATION = "Education"
    LOAN_EMI = "Loan EMI"
    UNKNOWN = "Unknown"


@dataclass
class ClassifiedTransaction:
    description: str
    amount: float
    txn_type: str
    category: TransactionCategory
    confidence: float           # 0.0-1.0
    method: str                 # "rule" | "llm"
    rule_matched: Optional[str] = None


# ─────────────────────────────────────────────
# RULE ENGINE
# ─────────────────────────────────────────────

class _Rule:
    def __init__(self, pattern: str, category: TransactionCategory, confidence: float = 0.9):
        self.pattern = re.compile(pattern, re.IGNORECASE)
        self.category = category
        self.confidence = confidence
        self.name = pattern[:50]


_RULES: List[_Rule] = [
    # Salary / Payroll
    _Rule(r'\b(salary|sal\b|payroll|wages|stipend|compensation)\b', TransactionCategory.SALARY, 0.95),
    _Rule(r'\bneft.*(employer|company|pvt|ltd|llp|corp)\b', TransactionCategory.SALARY, 0.85),
    _Rule(r'\b(employer|company).*(neft|imps|credit)\b', TransactionCategory.SALARY, 0.80),
    _Rule(r'\bmonthly\s+pay(ment)?\b', TransactionCategory.SALARY, 0.75),

    # Loan EMI
    _Rule(r'\b(emi|equated\s+monthly|loan\s+repayment|housing\s+loan|home\s+loan|car\s+loan|'
          r'auto\s+loan|personal\s+loan|education\s+loan|loan\s+emi)\b', TransactionCategory.LOAN_EMI, 0.95),
    _Rule(r'\b(mortgage|repayment|loan\s+due)\b', TransactionCategory.LOAN_EMI, 0.85),

    # Rent
    _Rule(r'\b(rent|lease\s+payment|rental|landlord|tenant\s+rent)\b', TransactionCategory.RENT, 0.92),

    # Utilities
    _Rule(r'\b(electricity|power\s+bill|bescom|msedcl|bses|tata\s+power|torrent\s+power|'
          r'adani\s+electricity|tneb|cesc)\b', TransactionCategory.UTILITIES, 0.95),
    _Rule(r'\b(gas\s+bill|piped\s+gas|mahanagar\s+gas|indraprastha\s+gas|igl|mgl)\b', TransactionCategory.UTILITIES, 0.95),
    _Rule(r'\b(water\s+bill|water\s+supply|bwssb|mcgm\s+water)\b', TransactionCategory.UTILITIES, 0.92),
    _Rule(r'\b(broadband|internet\s+bill|jio\s+fiber|airtel\s+fiber|act\s+fiber|hathway)\b', TransactionCategory.UTILITIES, 0.90),
    _Rule(r'\b(mobile\s+recharge|dth|dish\s+tv|tata\s+sky|sun\s+direct|airtel\s+tv)\b', TransactionCategory.UTILITIES, 0.88),

    # Subscriptions
    _Rule(r'\b(netflix|hotstar|disney|amazon\s+prime|spotify|apple\s+music|youtube\s+premium|'
          r'zee5|sonyliv|voot|mxplayer|jiocinema)\b', TransactionCategory.SUBSCRIPTION, 0.96),
    _Rule(r'\b(adobe|microsoft|office\s+365|google\s+workspace|notion|slack|zoom|dropbox|'
          r'hubspot|salesforce|subscription)\b', TransactionCategory.SUBSCRIPTION, 0.90),
    _Rule(r'\b(aws|amazon\s+web\s+services|azure|google\s+cloud|gcp|digitalocean|heroku)\b', TransactionCategory.SUBSCRIPTION, 0.88),

    # ATM
    _Rule(r'\b(atm\s+w|atm\s+cash|cash\s+withdrawal|atm\s+debit|cdm\b)\b', TransactionCategory.ATM, 0.95),

    # Cash Deposit
    _Rule(r'\b(cash\s+deposit|cdm\s+deposit|deposit\s+cash|branch\s+deposit|counter\s+deposit)\b', TransactionCategory.CASH_DEPOSIT, 0.92),

    # Refund / Reversal
    _Rule(r'\b(refund|reversal|cashback|chargeback|return\s+credit|credit\s+reversal)\b', TransactionCategory.REFUND, 0.93),

    # Interest
    _Rule(r'\b(interest\s+credit|interest\s+earned|fd\s+interest|rd\s+interest|savings\s+interest|'
          r'interest\s+on\s+deposit|int\s+cr)\b', TransactionCategory.INTEREST, 0.95),
    _Rule(r'\b(interest\s+charged|interest\s+debit|emi\s+interest)\b', TransactionCategory.INTEREST, 0.90),

    # Tax
    _Rule(r'\b(gst|tds|income\s+tax|advance\s+tax|tax\s+deducted|tax\s+payment|'
          r'professional\s+tax|tcs|e-tax|etax)\b', TransactionCategory.TAX, 0.95),
    _Rule(r'\bnsdl|tin-nsdl|tax\s+refund\b', TransactionCategory.TAX, 0.88),

    # Investment
    _Rule(r'\b(mutual\s+fund|mf\s+purchase|sip|systematic\s+investment|nps|ppf|'
          r'fd\s+opening|fixed\s+deposit|rd\s+opening|recurring\s+deposit|'
          r'stock\s+purchase|demat|zerodha|groww|upstox|angel\s+broking)\b', TransactionCategory.INVESTMENT, 0.92),

    # Insurance
    _Rule(r'\b(insurance|lic|premium\s+payment|health\s+insurance|life\s+insurance|'
          r'motor\s+insurance|vehicle\s+insurance|term\s+insurance)\b', TransactionCategory.INSURANCE, 0.93),

    # Healthcare
    _Rule(r'\b(hospital|clinic|pharmacy|medical|medicine|doctor|diagnostic|lab\s+test|'
          r'apollo|fortis|max\s+hospital|medplus|netmeds|pharmeasy)\b', TransactionCategory.HEALTHCARE, 0.90),

    # Food & Dining
    _Rule(r'\b(zomato|swiggy|uber\s+eats|food\s+panda|dominos|pizza|kfc|mcdonalds|'
          r'subway|burger|restaurant|hotel\s+bill|cafe|food\s+delivery)\b', TransactionCategory.FOOD, 0.93),

    # Travel & Transport
    _Rule(r'\b(makemytrip|irctc|yatra|cleartrip|airline|flight|train|bus\s+ticket|'
          r'ola|uber|rapido|auto\s+rickshaw|cab|taxi|fuel|petrol|diesel|parking)\b', TransactionCategory.TRAVEL, 0.93),

    # Shopping
    _Rule(r'\b(amazon|flipkart|myntra|ajio|meesho|nykaa|snapdeal|shopclues|'
          r'bigbasket|grofers|blinkit|zepto|jiomart|d-mart|reliance\s+smart)\b', TransactionCategory.SHOPPING, 0.90),

    # Education
    _Rule(r'\b(school\s+fee|college\s+fee|tuition|coaching|byju|unacademy|coursera|'
          r'udemy|edx|education\s+fee|university\s+fee)\b', TransactionCategory.EDUCATION, 0.90),

    # Transfers (generic — lower confidence since many transactions are transfers)
    _Rule(r'\b(neft|rtgs|imps|upi\s+transfer|fund\s+transfer|transfer\s+to|'
          r'transferred\s+to|sent\s+to)\b', TransactionCategory.TRANSFER, 0.72),

    # Vendor Payment
    _Rule(r'\b(vendor|supplier|purchase\s+order|po\s+payment|vendor\s+payment)\b', TransactionCategory.VENDOR_PAYMENT, 0.85),

    # Customer Receipt
    _Rule(r'\b(customer|client|invoice\s+payment|received\s+from|payment\s+received)\b', TransactionCategory.CUSTOMER_RECEIPT, 0.80),
]


class TransactionClassifier:
    """
    Classifies transactions using deterministic rules first.
    Falls back to LLM (as a batch call) only for UNKNOWN cases.
    """

    @classmethod
    def classify(cls, description: str, amount: float, txn_type: str) -> ClassifiedTransaction:
        """Classify a single transaction using rule engine."""
        best_match: Optional[_Rule] = None
        best_confidence = 0.0

        for rule in _RULES:
            if rule.pattern.search(description):
                if rule.confidence > best_confidence:
                    best_match = rule
                    best_confidence = rule.confidence

        if best_match:
            return ClassifiedTransaction(
                description=description,
                amount=amount,
                txn_type=txn_type,
                category=best_match.category,
                confidence=best_match.confidence,
                method="rule",
                rule_matched=best_match.name,
            )

        # No rule matched
        return ClassifiedTransaction(
            description=description,
            amount=amount,
            txn_type=txn_type,
            category=TransactionCategory.UNKNOWN,
            confidence=0.0,
            method="rule",
            rule_matched=None,
        )

    @classmethod
    def classify_batch(cls, transactions: List[Dict]) -> List[ClassifiedTransaction]:
        """
        Classify a list of transactions (dicts with description/amount/txn_type).
        Returns classified results. UNKNOWN items are flagged for LLM fallback.
        """
        results: List[ClassifiedTransaction] = []
        for txn in transactions:
            desc = txn.get("description", "")
            amount = float(txn.get("amount", 0.0))
            txn_type = txn.get("txn_type", "debit")
            result = cls.classify(desc, amount, txn_type)
            results.append(result)
        return results

    @classmethod
    def get_unknown_items(cls, classified: List[ClassifiedTransaction]) -> List[ClassifiedTransaction]:
        """Return items that need LLM fallback."""
        return [c for c in classified if c.category == TransactionCategory.UNKNOWN]

    @classmethod
    def build_llm_fallback_prompt(cls, unknowns: List[ClassifiedTransaction]) -> str:
        """Build a single batched prompt for LLM classification of unknowns."""
        categories = [c.value for c in TransactionCategory if c != TransactionCategory.UNKNOWN]
        items = "\n".join(
            f"{i+1}. [{t.txn_type.upper()}] ₹{t.amount:,.2f} — {t.description}"
            for i, t in enumerate(unknowns)
        )
        return f"""You are a financial transaction classifier. Classify each transaction below.

Available categories: {', '.join(categories)}

Transactions to classify:
{items}

For each transaction, respond ONLY with the category name from the list above.
Format: one category per line, numbered to match input.
If truly uncategorisable, use "Unknown".

Example response:
1. Salary
2. Food & Dining
3. Transfer"""

    @classmethod
    def apply_llm_results(
        cls, unknowns: List[ClassifiedTransaction], llm_response: str
    ) -> List[ClassifiedTransaction]:
        """Parse LLM category assignments back onto unknown items."""
        lines = [l.strip() for l in llm_response.strip().split('\n') if l.strip()]
        category_values = {c.value.lower(): c for c in TransactionCategory}

        for i, item in enumerate(unknowns):
            if i < len(lines):
                line = re.sub(r'^\d+\.\s*', '', lines[i]).strip()
                matched = category_values.get(line.lower(), TransactionCategory.UNKNOWN)
                item.category = matched
                item.confidence = 0.6 if matched != TransactionCategory.UNKNOWN else 0.2
                item.method = "llm"
        return unknowns

    @classmethod
    def category_summary(cls, classified: List[ClassifiedTransaction]) -> Dict[str, Dict]:
        """Aggregate classified transactions by category."""
        summary: Dict[str, Dict] = {}
        for item in classified:
            cat = item.category.value
            if cat not in summary:
                summary[cat] = {"count": 0, "total_amount": 0.0, "transactions": []}
            summary[cat]["count"] += 1
            summary[cat]["total_amount"] += item.amount
            if len(summary[cat]["transactions"]) < 5:
                summary[cat]["transactions"].append(item.description)
        # Round totals
        for cat in summary:
            summary[cat]["total_amount"] = round(summary[cat]["total_amount"], 2)
        return summary
