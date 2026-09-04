from backend.ai.memory.blackboard import BlackboardState
from backend.config.constants import MAX_RETRIES

def route_after_partner(state: BlackboardState) -> str:
    """Routes the graph after the Partner Agent executes."""
    decision = state.routing_decision
    if decision == "process_invoice":
        return "accounting_agent"
    return "end"

def route_after_audit(state: BlackboardState) -> str:
    """
    Routes the graph after the Audit Agent executes.
    Implements the Disagree-or-Commit loop and HITL interruption.
    """
    if state.human_input_required:
        return "hitl_interrupt"
        
    audit_status = state.audit_status
    if not audit_status:
        # Fallback if audit failed to run properly
        return "end"
        
    if audit_status.approved:
        return "financial_analyst_agent"
        
    # Disagree path (Retry Accounting)
    if state.error_count >= MAX_RETRIES:
        # Exceeded retries, force HITL
        return "hitl_interrupt"
        
    return "accounting_agent"
