from backend.ai.extractors.ledger import LedgerData

class LedgerTools:
    @staticmethod
    def validate_balance(data: LedgerData) -> str:
        if not data.entries:
            return "Tool 'balance_validator': No ledger entries found to validate."
            
        total_debit = sum(e.debit for e in data.entries)
        total_credit = sum(e.credit for e in data.entries)
        
        if total_debit == total_credit:
            return f"Tool 'balance_validator': Ledger is balanced (Debits: {total_debit}, Credits: {total_credit})."
        else:
            diff = abs(total_debit - total_credit)
            return f"Tool 'balance_validator': Ledger imbalance detected. Difference: {diff} (Debits: {total_debit}, Credits: {total_credit})."
