"""Run-local sandbox state with explicit, declarative action semantics."""
import copy
from typing import Any, Dict, List, Optional
from agentveto.contracts.schemas import StateDiff


class SandboxStateManager:
    """One worker-owned state store; tool names never imply a mutation."""

    def __init__(self, run_id: str, initial_state: Optional[Dict[str, Any]] = None):
        self.run_id = run_id
        self.initial_state = copy.deepcopy(initial_state or {})
        self.current_state = copy.deepcopy(self.initial_state)
        self.history: List[Dict[str, Any]] = [copy.deepcopy(self.current_state)]
        self.unauthorized_changes: List[str] = []

    def record_tool_action(self, tool_name: str, arguments: Dict[str, Any], *, action: Optional[Dict[str, Any]] = None, authorized: Optional[bool] = None) -> Dict[str, Any]:
        """Apply only an explicitly declared set/decrement action."""
        if not action:
            self.history.append(copy.deepcopy(self.current_state))
            return self.current_state
        path = action.get("path")
        if not isinstance(path, str) or not path:
            raise ValueError("A sandbox action requires a non-empty path")
        value = action.get("value")
        if "value_from" in action:
            value = (arguments or {}).get(action["value_from"])
        if action.get("op") == "decrement":
            amount = action.get("amount", 0)
            if "amount_from" in action:
                amount = (arguments or {}).get(action["amount_from"], 0)
            value = self._get(path, 0) - amount
        elif action.get("op") != "set":
            raise ValueError(f"Unsupported sandbox action operation: {action.get('op')!r}")
        self._set(path, value)
        if authorized is False:
            self.unauthorized_changes.append(f"{tool_name} changed {path} without explicit authorization")
        self.history.append(copy.deepcopy(self.current_state))
        return self.current_state

    def _get(self, path: str, default: Any = None) -> Any:
        node: Any = self.current_state
        for part in path.split("."):
            if not isinstance(node, dict) or part not in node:
                return default
            node = node[part]
        return node

    def _set(self, path: str, value: Any) -> None:
        node = self.current_state
        parts = path.split(".")
        for part in parts[:-1]:
            node = node.setdefault(part, {})
            if not isinstance(node, dict):
                raise ValueError(f"State path traverses non-object: {path}")
        node[parts[-1]] = value

    def compute_diff(self) -> StateDiff:
        changed = _changed_paths(self.initial_state, self.current_state)
        return StateDiff(run_id=self.run_id, before=copy.deepcopy(self.initial_state), after=copy.deepcopy(self.current_state), diff_keys=changed, unauthorized_changes=list(self.unauthorized_changes), has_changes=bool(changed))


def _changed_paths(before: Any, after: Any, prefix: str = "") -> List[str]:
    if isinstance(before, dict) and isinstance(after, dict):
        changes: List[str] = []
        for key in sorted(set(before) | set(after)):
            child = f"{prefix}.{key}" if prefix else key
            changes.extend(_changed_paths(before.get(key), after.get(key), child))
        return changes
    return [] if before == after else [prefix or "state"]


def compute_state_diff(run_id: str) -> StateDiff:
    raise RuntimeError("State managers are run-local; retain the worker instance for its diff")
