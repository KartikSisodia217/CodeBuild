from typing import List, Optional
from pydantic import BaseModel, Field

class LedgerLineItem(BaseModel):
    account: str = Field(description="The chart of accounts name.")
    amount: float = Field(description="The monetary amount.")

class AccountingOutput(BaseModel):
    vendor_name: Optional[str] = Field(default=None, description="Extracted vendor name from the invoice.")
    invoice_date: Optional[str] = Field(default=None, description="Extracted invoice date in ISO 8601 format.")
    total_amount: Optional[float] = Field(default=None, description="Total amount on the invoice.")
    tax_amount: Optional[float] = Field(default=None, description="Total tax amount on the invoice.")
    debits: List[LedgerLineItem] = Field(default_factory=list, description="List of debit entries for the ledger.")
    credits: List[LedgerLineItem] = Field(default_factory=list, description="List of credit entries for the ledger.")
