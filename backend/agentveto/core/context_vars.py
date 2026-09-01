"""
ContextVars for async execution context.
Owner: Interception & Trace Engineer (Member 2)
"""
from contextvars import ContextVar
from typing import Optional

# Used to pass run_id safely across async context switching
run_id_var: ContextVar[Optional[str]] = ContextVar("run_id", default=None)
