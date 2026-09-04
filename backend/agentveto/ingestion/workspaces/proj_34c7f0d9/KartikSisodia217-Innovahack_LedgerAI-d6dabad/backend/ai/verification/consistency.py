from backend.ai.memory.blackboard import BlackboardState

class ConsistencyChecker:
    @staticmethod
    def check_consistency(state: BlackboardState) -> bool:
        """Checks if the various agent outputs in the blackboard are logically consistent."""
        if state.audit_status and state.audit_status.approved:
            if state.gst_context and state.gst_context.is_sez and not state.gst_context.lut_present:
                # Inconsistent: Audit approved it but GST says it's an SEZ without a LUT
                return False
            if state.compliance_context and state.compliance_context.is_duplicate:
                # Inconsistent: Approved but marked as duplicate
                return False
        return True
