from typing import List, Optional
from pydantic import BaseModel, Field

class IntentClassification(BaseModel):
    intent: str = Field(description="The primary intent of the user's query. Options: Ledger, Financial, Accounts Receivable, Accounts Payable, Expense Intelligence, Invoice, Audit, Fraud, Risk, Tax, Compliance, Legal, CFO, Forecasting, Document, Conversation.")
    confidence: float = Field(description="Confidence score from 0.0 to 1.0.")
    requires_retrieval: bool = Field(description="True if context retrieval (documents or transactions) is necessary.")
    retrieval_type: Optional[str] = Field(default=None, description="Type of retrieval needed: 'ledger', 'documents', or 'both'.")
    required_specialists: List[str] = Field(description="List of specialized agents to invoke. Options: ledger, financial, accounts_receivable, accounts_payable, expense_intelligence, invoice, audit, fraud, risk, tax, compliance, legal, cfo, forecasting, document, general.")
    reasoning: str = Field(description="Brief explanation of why this intent and these specialists were chosen.")
