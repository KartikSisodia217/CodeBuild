import re
from pydantic import BaseModel

class GSTDocumentData(BaseModel):
    has_gstin: bool = False
    is_interstate: bool = False
    transaction_amount: float = 0.0

class GSTExtractor:
    @staticmethod
    def extract(context: str) -> GSTDocumentData:
        data = GSTDocumentData()
        
        # Check for GSTIN pattern (simplified)
        if re.search(r'\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}', context) or "gstin" in context.lower():
            data.has_gstin = True
            
        if "igst" in context.lower() or "interstate" in context.lower() or "inter-state" in context.lower():
            data.is_interstate = True
            
        amt_match = re.search(r'(?i)(?:amount|total)\s*(?:is|:)?\s*\$?\s*([\d,.]+)', context)
        if amt_match:
            data.transaction_amount = float(amt_match.group(1).replace(',', ''))
            
        return data
