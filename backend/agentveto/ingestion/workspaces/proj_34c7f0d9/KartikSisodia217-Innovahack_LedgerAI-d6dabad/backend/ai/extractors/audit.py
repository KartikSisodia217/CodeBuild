import re
from typing import List
from pydantic import BaseModel

class InvoiceData(BaseModel):
    invoice_number: str
    amount: float = 0.0

class InvoiceExtractor:
    @staticmethod
    def extract(context: str) -> List[InvoiceData]:
        invoices = []
        # Match INV-123 or Invoice #123
        pattern = r'(?i)(?:INV-|Invoice\s*#?)\s*(\d+)'
        matches = re.finditer(pattern, context)
        
        for match in matches:
            invoices.append(InvoiceData(invoice_number=match.group(1)))
            
        return invoices
