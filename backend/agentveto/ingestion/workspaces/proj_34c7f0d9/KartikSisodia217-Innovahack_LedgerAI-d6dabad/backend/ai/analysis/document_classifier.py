"""
Document Type Classifier — Phase 6
Deterministic pattern-based document classification.
Routes to appropriate specialist set based on detected type.
No LLM required.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Tuple


class DocumentType(str, Enum):
    BANK_STATEMENT = "Bank Statement"
    INVOICE = "Invoice"
    BALANCE_SHEET = "Balance Sheet"
    PROFIT_AND_LOSS = "Profit & Loss"
    TRIAL_BALANCE = "Trial Balance"
    GST_RETURN = "GST Return"
    PURCHASE_REGISTER = "Purchase Register"
    SALES_REGISTER = "Sales Register"
    JOURNAL = "Journal"
    LEDGER = "Ledger"
    RECEIPT = "Receipt"
    CONTRACT = "Contract"
    UNKNOWN = "Unknown"


# Specialists to activate per document type
DOCUMENT_ROUTING: dict = {
    DocumentType.BANK_STATEMENT: ["financial", "fraud", "expense_intelligence"],
    DocumentType.INVOICE: ["invoice", "tax", "audit"],
    DocumentType.BALANCE_SHEET: ["financial", "risk", "ledger"],
    DocumentType.PROFIT_AND_LOSS: ["financial", "cfo", "forecasting"],
    DocumentType.TRIAL_BALANCE: ["ledger", "audit"],
    DocumentType.GST_RETURN: ["tax", "compliance"],
    DocumentType.PURCHASE_REGISTER: ["accounts_payable", "tax", "audit"],
    DocumentType.SALES_REGISTER: ["accounts_receivable", "tax"],
    DocumentType.JOURNAL: ["ledger", "audit"],
    DocumentType.LEDGER: ["ledger", "audit", "financial"],
    DocumentType.RECEIPT: ["invoice", "expense_intelligence"],
    DocumentType.CONTRACT: ["legal", "compliance", "risk"],
    DocumentType.UNKNOWN: ["document", "general"],
}


@dataclass
class ClassificationSignal:
    pattern: re.Pattern
    weight: float
    evidence_template: str


@dataclass
class DocumentClassificationResult:
    document_type: DocumentType
    confidence: float               # 0.0–1.0
    evidence: List[str]
    routing_specialists: List[str]
    all_scores: dict                # type → raw score, for transparency

    def to_dict(self) -> dict:
        return {
            "document_type": self.document_type.value,
            "confidence": round(self.confidence, 3),
            "evidence": self.evidence,
            "routing_specialists": self.routing_specialists,
        }


# ─────────────────────────────────────────────
# SIGNAL DEFINITIONS
# ─────────────────────────────────────────────

_SIGNALS: List[Tuple[DocumentType, List[ClassificationSignal]]] = [

    (DocumentType.BANK_STATEMENT, [
        ClassificationSignal(
            re.compile(r'\b(opening\s+balance|closing\s+balance|statement\s+of\s+account|'
                       r'bank\s+statement|account\s+statement|savings\s+account|current\s+account|'
                       r'passbook)\b', re.I),
            weight=3.0,
            evidence_template="Bank account terminology detected"
        ),
        ClassificationSignal(
            re.compile(r'\b(debit|credit|withdrawal|deposit)\b', re.I),
            weight=1.0,
            evidence_template="Debit/Credit transaction entries"
        ),
        ClassificationSignal(
            re.compile(r'(ATM|UPI|NEFT|RTGS|IMPS|NACH|ECS)', re.I),
            weight=1.5,
            evidence_template="Payment channel identifiers (UPI/NEFT/ATM)"
        ),
        ClassificationSignal(
            re.compile(r'\b(balance|running\s+balance|available\s+balance)\b', re.I),
            weight=0.8,
            evidence_template="Running balance column"
        ),
    ]),

    (DocumentType.INVOICE, [
        ClassificationSignal(
            re.compile(r'\b(invoice\s+(no|number|#)|tax\s+invoice|invoice\s+date|'
                       r'bill\s+to|ship\s+to|proforma\s+invoice)\b', re.I),
            weight=3.0,
            evidence_template="Invoice header detected"
        ),
        ClassificationSignal(
            re.compile(r'\b(gstin|gst\s+no|gst\s+number|hsn|sac\s+code)\b', re.I),
            weight=2.0,
            evidence_template="GST/GSTIN/HSN identifiers"
        ),
        ClassificationSignal(
            re.compile(r'\b(amount\s+due|total\s+amount|subtotal|igst|cgst|sgst)\b', re.I),
            weight=1.5,
            evidence_template="Tax and amount fields"
        ),
    ]),

    (DocumentType.BALANCE_SHEET, [
        ClassificationSignal(
            re.compile(r'\b(balance\s+sheet|statement\s+of\s+financial\s+position|'
                       r'assets\s+and\s+liabilities)\b', re.I),
            weight=4.0,
            evidence_template="Balance Sheet title/heading"
        ),
        ClassificationSignal(
            re.compile(r'\b(non.current\s+assets|current\s+assets|shareholders.?\s*equity|'
                       r'retained\s+earnings)\b', re.I),
            weight=2.5,
            evidence_template="Balance Sheet line items"
        ),
        ClassificationSignal(
            re.compile(r'\b(total\s+assets|total\s+liabilities|net\s+assets)\b', re.I),
            weight=2.0,
            evidence_template="Balance totals"
        ),
    ]),

    (DocumentType.PROFIT_AND_LOSS, [
        ClassificationSignal(
            re.compile(r'\b(profit\s+(and|&)\s+loss|income\s+statement|'
                       r'statement\s+of\s+(income|operations|earnings)|p&l|p\s+&\s+l)\b', re.I),
            weight=4.0,
            evidence_template="P&L title detected"
        ),
        ClassificationSignal(
            re.compile(r'\b(revenue|net\s+revenue|gross\s+profit|operating\s+income|'
                       r'ebitda|net\s+profit|profit\s+after\s+tax|pat)\b', re.I),
            weight=2.0,
            evidence_template="P&L line items"
        ),
    ]),

    (DocumentType.TRIAL_BALANCE, [
        ClassificationSignal(
            re.compile(r'\b(trial\s+balance)\b', re.I),
            weight=5.0,
            evidence_template="Trial Balance title"
        ),
        ClassificationSignal(
            re.compile(r'\b(debit\s+balance|credit\s+balance|closing\s+balance)\b', re.I),
            weight=1.5,
            evidence_template="Debit/Credit balance columns"
        ),
    ]),

    (DocumentType.GST_RETURN, [
        ClassificationSignal(
            re.compile(r'\b(gstr[-\s]?\d|gst\s+return|outward\s+supplies|inward\s+supplies|'
                       r'itc\s+availed|integrated\s+tax|central\s+tax|state\s+tax)\b', re.I),
            weight=4.0,
            evidence_template="GST Return form markers"
        ),
        ClassificationSignal(
            re.compile(r'\b(uin|gstn|tax\s+period)\b', re.I),
            weight=1.5,
            evidence_template="GST registration identifiers"
        ),
    ]),

    (DocumentType.PURCHASE_REGISTER, [
        ClassificationSignal(
            re.compile(r'\b(purchase\s+register|purchase\s+ledger|purchase\s+day\s+book)\b', re.I),
            weight=4.0,
            evidence_template="Purchase Register title"
        ),
        ClassificationSignal(
            re.compile(r'\b(vendor\s+name|supplier\s+name|purchase\s+invoice)\b', re.I),
            weight=2.0,
            evidence_template="Vendor/supplier fields"
        ),
    ]),

    (DocumentType.SALES_REGISTER, [
        ClassificationSignal(
            re.compile(r'\b(sales\s+register|sales\s+ledger|sales\s+day\s+book)\b', re.I),
            weight=4.0,
            evidence_template="Sales Register title"
        ),
        ClassificationSignal(
            re.compile(r'\b(customer\s+name|buyer\s+name|sales\s+invoice)\b', re.I),
            weight=2.0,
            evidence_template="Customer/buyer fields"
        ),
    ]),

    (DocumentType.JOURNAL, [
        ClassificationSignal(
            re.compile(r'\b(journal\s+(entry|entries|voucher)|general\s+journal|'
                       r'journal\s+folio|jv\s+no)\b', re.I),
            weight=4.0,
            evidence_template="Journal entry markers"
        ),
        ClassificationSignal(
            re.compile(r'\b(dr\.|cr\.|to\s+\w+|by\s+\w+)\b', re.I),
            weight=1.0,
            evidence_template="Dr/Cr accounting notation"
        ),
    ]),

    (DocumentType.LEDGER, [
        ClassificationSignal(
            re.compile(r'\b(ledger\s+account|ledger\s+folio|account\s+ledger|'
                       r'nominal\s+ledger|general\s+ledger)\b', re.I),
            weight=4.0,
            evidence_template="Ledger account heading"
        ),
        ClassificationSignal(
            re.compile(r'\b(folio|particulars|j\.f\.|journal\s+folio)\b', re.I),
            weight=1.5,
            evidence_template="Ledger column headers"
        ),
    ]),

    (DocumentType.RECEIPT, [
        ClassificationSignal(
            re.compile(r'\b(receipt\s+(no|number|#)|payment\s+receipt|'
                       r'cash\s+receipt|receipt\s+date|received\s+with\s+thanks)\b', re.I),
            weight=4.0,
            evidence_template="Receipt header"
        ),
        ClassificationSignal(
            re.compile(r'\b(received\s+from|amount\s+received|payment\s+received)\b', re.I),
            weight=2.0,
            evidence_template="Receipt payment confirmation"
        ),
    ]),

    (DocumentType.CONTRACT, [
        ClassificationSignal(
            re.compile(r'\b(agreement|contract|deed|memorandum\s+of\s+understanding|'
                       r'mou|terms\s+and\s+conditions|hereinafter|party\s+of\s+the\s+first)\b', re.I),
            weight=3.5,
            evidence_template="Legal agreement language"
        ),
        ClassificationSignal(
            re.compile(r'\b(clause|section|schedule|annexure|signatory|execution)\b', re.I),
            weight=1.5,
            evidence_template="Contract structural elements"
        ),
    ]),
]


# ─────────────────────────────────────────────
# CLASSIFIER
# ─────────────────────────────────────────────

class DocumentClassifier:

    @classmethod
    def classify(cls, raw_text: str) -> DocumentClassificationResult:
        """
        Classify the document type from raw OCR text.
        Returns classification with confidence, evidence, and routing hint.
        """
        # Truncate to first 3000 chars for efficiency (document type is usually in header)
        sample = raw_text[:3000]
        scores: dict = {}
        all_evidence: dict = {}

        for doc_type, signals in _SIGNALS:
            score = 0.0
            evidence: List[str] = []
            for signal in signals:
                if signal.pattern.search(sample):
                    score += signal.weight
                    evidence.append(signal.evidence_template)
            scores[doc_type] = score
            all_evidence[doc_type] = evidence

        if not scores or max(scores.values()) == 0:
            return DocumentClassificationResult(
                document_type=DocumentType.UNKNOWN,
                confidence=0.0,
                evidence=["No recognisable financial document markers found."],
                routing_specialists=DOCUMENT_ROUTING[DocumentType.UNKNOWN],
                all_scores={dt.value: s for dt, s in scores.items()},
            )

        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]
        total_score = sum(scores.values())

        # Confidence = best_score / (best_score + second_best_score) for discrimination
        sorted_scores = sorted(scores.values(), reverse=True)
        second_best = sorted_scores[1] if len(sorted_scores) > 1 else 0
        confidence = best_score / (best_score + second_best + 1e-9)

        # Minimum absolute score threshold to avoid low-signal false positives
        if best_score < 1.5:
            best_type = DocumentType.UNKNOWN
            confidence = 0.3

        return DocumentClassificationResult(
            document_type=best_type,
            confidence=min(confidence, 0.98),
            evidence=all_evidence.get(best_type, []),
            routing_specialists=DOCUMENT_ROUTING.get(best_type, DOCUMENT_ROUTING[DocumentType.UNKNOWN]),
            all_scores={dt.value: round(s, 2) for dt, s in scores.items()},
        )
