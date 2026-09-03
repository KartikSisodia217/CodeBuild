"""
ContextVars for async execution context.
Owner: Interception & Trace Engineer (Member 2)
"""
from contextvars import ContextVar
from typing import Any, List, Optional

# Used to pass run_id safely across async context switching
run_id_var: ContextVar[Optional[str]] = ContextVar("run_id", default=None)

# The following values are deliberately scoped to a single execution context.  They allow the
# adapter to stay framework-agnostic while a controlled runner can supply its own sandbox,
# payload, state tracker, and trace collector.  A normal @intercept use still falls back to the
# module-level defaults in decorator.py.
sandbox_manager_var: ContextVar[Optional[Any]] = ContextVar("sandbox_manager", default=None)
attack_payload_var: ContextVar[Optional[Any]] = ContextVar("attack_payload", default=None)
state_manager_var: ContextVar[Optional[Any]] = ContextVar("state_manager", default=None)
trace_collector_var: ContextVar[Optional[List[Any]]] = ContextVar("trace_collector", default=None)
parent_span_id_var: ContextVar[Optional[str]] = ContextVar("parent_span_id", default=None)
