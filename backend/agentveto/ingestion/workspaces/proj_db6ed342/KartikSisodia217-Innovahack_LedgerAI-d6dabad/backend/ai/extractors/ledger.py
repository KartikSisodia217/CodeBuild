import re
from typing import List
from pydantic import BaseModel

class LedgerEntry(BaseModel):
    account: str
    debit: float
    credit: float

class LedgerData(BaseModel):
    entries: List[LedgerEntry]

class LedgerExtractor:
    @staticmethod
    def extract(context: str) -> LedgerData:
        # A simple regex extraction for demonstration.
        # Can be swapped with ML parsing or OCR layout analysis.
        entries = []
        # Matches: "Cash: $1000 debit", "Accounts Payable: 500 credit"
        pattern = r'(?i)([a-z\s]+):\s*\$?\s*([\d,.]+)\s*(debit|credit)'
        matches = re.findall(pattern, context)
        
        for account, amount_str, type_str in matches:
            amount = float(amount_str.replace(',', ''))
            is_debit = type_str.lower() == 'debit'
            entries.append(LedgerEntry(
                account=account.strip(),
                debit=amount if is_debit else 0.0,
                credit=amount if not is_debit else 0.0
            ))
            
        return LedgerData(entries=entries)
