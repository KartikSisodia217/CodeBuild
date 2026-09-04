from typing import List
from backend.ai.extractors.audit import InvoiceData

class AuditTools:
    @staticmethod
    def detect_duplicates(invoices: List[InvoiceData]) -> str:
        if not invoices:
            return "Tool 'duplicate_detector': No invoices provided."
            
        inv_numbers = [inv.invoice_number for inv in invoices]
        duplicates = set([x for x in inv_numbers if inv_numbers.count(x) > 1])
        
        if duplicates:
            return f"Tool 'duplicate_detector': Found duplicate invoice references -> {', '.join(duplicates)}."
        return "Tool 'duplicate_detector': No duplicate references found."

