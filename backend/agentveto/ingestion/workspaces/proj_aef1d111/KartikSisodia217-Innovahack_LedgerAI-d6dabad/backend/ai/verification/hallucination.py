from backend.ai.memory.blackboard import BlackboardState

class HallucinationDetector:
    @staticmethod
    def detect_hallucination(state: BlackboardState) -> bool:
        # Simple exact-match hallucination check on the vendor name
        if state.accounting_draft and state.raw_text:
            vendor = state.accounting_draft.vendor_name
            # If the vendor name extracted isn't found anywhere in the raw OCR text, it's hallucinated.
            if vendor.lower() not in state.raw_text.lower():
                return True
        return False
