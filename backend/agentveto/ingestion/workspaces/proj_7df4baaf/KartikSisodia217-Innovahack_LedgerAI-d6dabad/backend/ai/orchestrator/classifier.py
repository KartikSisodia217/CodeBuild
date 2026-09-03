import json
from backend.ai.providers.factory import ProviderFactory
from backend.ai.schemas.intent import IntentClassification

class IntentClassifier:
    def __init__(self):
        self.provider = ProviderFactory.get_provider("gemini")

    async def classify(self, query: str) -> IntentClassification:
        prompt = f"""You are the Intent Classifier for LedgerAI, an AI-native accounting firm.
Analyze the following user query and classify its intent.

Possible Intents: Ledger, Financial, Accounts Receivable, Accounts Payable, Expense Intelligence, Invoice, Audit, Fraud, Risk, Tax, Compliance, Legal, CFO, Forecasting, Document, Conversation.

Possible Specialists: ledger, financial, accounts_receivable, accounts_payable, expense_intelligence, invoice, audit, fraud, risk, tax, compliance, legal, cfo, forecasting, document, general.

Routing Rules:
- If general chat: intent=Conversation, requires_retrieval=false, specialists=[general].
- If about summarizing or explaining an uploaded document: intent=Document, requires_retrieval=true, retrieval_type=documents.
- If asking "What happened?" with ledgers: intent=Ledger, specialists=[ledger].
- If asking "What does it mean financially?" (cash flow, profit): intent=Financial, specialists=[financial].
- If asking about outstanding invoices or collections: intent=Accounts Receivable, specialists=[accounts_receivable].
- If asking about vendor liabilities or due payments: intent=Accounts Payable, specialists=[accounts_payable].
- If asking about spending categories or merchant trends: intent=Expense Intelligence, specialists=[expense_intelligence].
- If asking to extract invoice details or vendor matching: intent=Invoice, specialists=[invoice].
- If asking "Is anything inconsistent?" (duplicates, missing records): intent=Audit, specialists=[audit].
- If asking "Does anything appear suspicious?" (fraud, anomalies): intent=Fraud, specialists=[fraud].
- If asking "What business risks exist?" (liquidity, credit): intent=Risk, specialists=[risk].
- If asking about tax implications, GST, calculations: intent=Tax, specialists=[tax].
- If asking "Does this satisfy regulatory expectations?": intent=Compliance, specialists=[compliance].
- If asking "What contractual implications exist?": intent=Legal, specialists=[legal].
- If asking "What should management do next?" (strategy, optimization): intent=CFO, specialists=[cfo].
- If asking "What is likely to happen?" (future cash flow): intent=Forecasting, specialists=[forecasting].
- If asking to perform "due diligence": intent=CFO, specialists=[ledger, financial, audit, fraud, risk, compliance, legal, cfo].
- You can route to multiple specialists if the query spans multiple domains.

User Query: {query}
"""
        return await self.provider.generate_structured(prompt, IntentClassification)
