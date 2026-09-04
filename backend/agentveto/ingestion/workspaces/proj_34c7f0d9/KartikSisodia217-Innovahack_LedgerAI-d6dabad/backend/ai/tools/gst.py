from backend.ai.extractors.gst import GSTDocumentData

class GSTTools:
    @staticmethod
    def calculate_tax(data: GSTDocumentData, default_rate: float = 18.0) -> str:
        if data.transaction_amount <= 0:
            return "Tool 'gst_calculator': No valid transaction amount found."
            
        if data.is_interstate:
            igst = data.transaction_amount * (default_rate / 100)
            return f"Tool 'gst_calculator': Interstate transaction. IGST = {igst:.2f}."
        else:
            half_rate = default_rate / 2
            cgst = data.transaction_amount * (half_rate / 100)
            sgst = data.transaction_amount * (half_rate / 100)
            return f"Tool 'gst_calculator': Intrastate transaction. CGST = {cgst:.2f}, SGST = {sgst:.2f}."

    @staticmethod
    def verify_itc_eligibility(data: GSTDocumentData) -> str:
        if data.has_gstin:
            return "Tool 'itc_validator': Document contains GSTIN, likely eligible for ITC."
        return "Tool 'itc_validator': Missing GSTIN, ITC might be ineligible."
