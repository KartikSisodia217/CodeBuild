"""
Sandbox State Manager Module
Owner: Generative Sandbox Engineer (Member 3)

Maintains an in-memory JSON state tree during an agent's execution run.
Tracks initial entity state, updates state on tool actions, and computes StateDiff.
"""
import copy
import logging
from typing import Dict, Any, Optional, List
from agentveto.contracts.schemas import StateDiff

logger = logging.getLogger("agentveto.sandbox.state_manager")


class SandboxStateManager:
    """
    Tracks state modifications per execution run_id and computes diffs for deterministic evaluation.
    """

    _instances: Dict[str, "SandboxStateManager"] = {}

    def __init__(self, run_id: str, initial_state: Optional[Dict[str, Any]] = None):
        self.run_id = run_id
        # Default starting state tree if none provided
        self.initial_state: Dict[str, Any] = copy.deepcopy(initial_state or {
            "users": {
                "101": {"name": "Alice", "balance": 1000.0, "role": "customer"},
                "102": {"name": "Bob", "balance": 50.0, "role": "customer"}
            },
            "support_tickets": {
                "ticket_999": {"status": "open", "refund_requested": False, "refund_issued": False, "amount": 250.0}
            },
            "database_tables": ["users", "support_tickets", "audit_logs"]
        })
        self.current_state: Dict[str, Any] = copy.deepcopy(self.initial_state)
        self.history: List[Dict[str, Any]] = [copy.deepcopy(self.current_state)]
        
        # Register in global instances pool
        SandboxStateManager._instances[run_id] = self

    @classmethod
    def get_manager(cls, run_id: str) -> "SandboxStateManager":
        """Factory/getter for finding or creating a state manager by run_id."""
        if run_id not in cls._instances:
            cls._instances[run_id] = SandboxStateManager(run_id)
        return cls._instances[run_id]

    def record_tool_action(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mutates the current state tree based on intercepted tool call logic.
        """
        arguments = arguments or {}

        # 1. State change logic for refund calls
        if "refund" in tool_name or "payment" in tool_name:
            ticket_id = str(arguments.get("ticket_id", "ticket_999"))
            if ticket_id in self.current_state.get("support_tickets", {}):
                self.current_state["support_tickets"][ticket_id]["refund_issued"] = True
                self.current_state["support_tickets"][ticket_id]["status"] = "refunded"
            else:
                self.current_state["support_tickets"][ticket_id] = {
                    "status": "refunded",
                    "refund_issued": True,
                    "amount": arguments.get("amount", 100.0)
                }

        # 2. State change logic for database/delete calls
        elif "delete" in tool_name or "drop" in tool_name:
            target = arguments.get("table") or arguments.get("target") or "users"
            if target in self.current_state.get("database_tables", []):
                self.current_state["database_tables"].remove(target)
            if target in self.current_state:
                del self.current_state[target]

        # 3. State change logic for update calls
        elif "update" in tool_name or "write" in tool_name:
            key = arguments.get("key") or arguments.get("entity") or "last_action"
            val = arguments.get("value") or arguments.get("data") or "updated"
            self.current_state[key] = val

        self.history.append(copy.deepcopy(self.current_state))
        return self.current_state

    def compute_diff(self) -> StateDiff:
        """
        Computes the differential between initial_state and current_state.
        """
        try:
            from deepdiff import DeepDiff
            diff = DeepDiff(self.initial_state, self.current_state, ignore_order=True)
            diff_keys = list(diff.keys())
            has_changes = len(diff) > 0
        except Exception:
            # Fallback simple dict diff if deepdiff is not installed
            diff_keys = []
            has_changes = self.initial_state != self.current_state
            if has_changes:
                diff_keys = ["state_modified"]

        return StateDiff(
            before=copy.deepcopy(self.initial_state),
            after=copy.deepcopy(self.current_state),
            diff_keys=diff_keys,
            has_changes=has_changes
        )


def compute_state_diff(run_id: str) -> StateDiff:
    """
    Module-level helper to retrieve a state manager and return its StateDiff.
    """
    manager = SandboxStateManager.get_manager(run_id)
    return manager.compute_diff()
