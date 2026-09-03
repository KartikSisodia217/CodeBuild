"""
Agent Adapter (@intercept decorator)
Owner: Interception & Trace Engineer (Member 2)
"""
import functools
import inspect
import asyncio
import uuid
from typing import Callable, Any, Dict, Optional

from agentveto.core.context_vars import (
    attack_payload_var,
    run_id_var,
    sandbox_manager_var,
    state_manager_var,
)
from agentveto.contracts.schemas import InterceptedCall
from agentveto.sandbox.mock_generator import SandboxManager
from agentveto.telemetry.openinference_logger import TraceManager

sandbox_manager = SandboxManager()
trace_manager = TraceManager()

def intercept(func: Callable) -> Callable:
    """
    Halts actual function execution, routes arguments to sandbox.
    Supports both sync and async functions.
    """
    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs) -> Any:
        return _handle_intercept(func, args, kwargs, is_async=False)
        
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs) -> Any:
        return _handle_intercept(func, args, kwargs, is_async=True)
        
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper

def _is_payload_target(tool_name: str, payload: Optional[Any]) -> bool:
    """Return whether a configured payload is intended for this tool response."""
    if payload is None:
        return False
    target = getattr(payload, "target_node", None) or getattr(payload, "target_tool", None)
    return bool(target and target == tool_name)


def _authorization_from_arguments(arguments: Dict[str, Any]) -> bool:
    """Read explicit authorization evidence only; absence is never treated as approval."""
    for key in ("is_authorized", "authorized", "approval", "approval_token", "manager_approved"):
        value = arguments.get(key)
        if isinstance(value, bool):
            return value
        if value not in (None, "", 0, False):
            return True
    return False


def _handle_intercept(func: Callable, args: tuple, kwargs: dict, is_async: bool) -> Any:
    """Core logic to build InterceptedCall, log telemetry, and fetch mock response."""
    tool_name = func.__name__
    
    # Heuristic for LangChain BaseTool or other class-based tools
    if args and hasattr(args[0], 'name') and isinstance(args[0].name, str):
        tool_name = args[0].name
    
    # Extract signature/schema
    sig = inspect.signature(func)
    bound_args = sig.bind(*args, **kwargs)
    bound_args.apply_defaults()
    arguments = dict(bound_args.arguments)
    
    # Remove 'self' from arguments so it doesn't pollute the trace or payload
    if 'self' in arguments:
        del arguments['self']
    
    schema_definition = {
        "name": tool_name,
        "parameters": {
            k: str(v.annotation) for k, v in sig.parameters.items()
        }
    }
    
    # Get or create run_id
    current_run_id = run_id_var.get()
    if not current_run_id:
        current_run_id = str(uuid.uuid4())
        run_id_var.set(current_run_id)
        
    intercepted_call = InterceptedCall(
        tool_name=tool_name,
        arguments=arguments,
        run_id=current_run_id,
        schema_definition=schema_definition
    )
    
    # A controlled execution may provide isolated components through ContextVars.  The default
    # singleton remains for existing SDK consumers.
    active_sandbox = sandbox_manager_var.get() or sandbox_manager
    active_payload = attack_payload_var.get()
    payload_for_call = active_payload if _is_payload_target(tool_name, active_payload) else None

    # Fetch a mock response.  The wrapped function is intentionally never executed.
    mock_response = active_sandbox.generate_mock_response(intercepted_call, payload_for_call)

    is_authorized = _authorization_from_arguments(arguments)
    active_state = state_manager_var.get()
    if active_state is not None:
        active_state.record_tool_action(
            tool_name,
            arguments,
            authorized=is_authorized,
        )
    
    # Log telemetry via Trace Engine
    trace_attributes = {
        "tool.name": tool_name,
        "tool.arguments": arguments,
        "run_id": current_run_id,
        "status": mock_response.status_code,
        "is_authorized": is_authorized,
        "agentveto.intercepted": True,
        "agentveto.sandboxed": True,
        "agentveto.payload_injected": bool(payload_for_call),
        "llm.output_messages": [mock_response.response_body]
    }
    trace_manager.log_span(
        "TOOL",
        trace_attributes,
        name=tool_name,
        tool_name=tool_name,
        tool_parameters=arguments,
        input_value=arguments,
        output_value=mock_response.data if mock_response.data is not None else mock_response.response_body,
        is_tainted=bool(payload_for_call),
        is_injection_source=bool(payload_for_call),
    )
    
    # Return mocked response
    if mock_response.data is not None:
        return mock_response.data
    return mock_response.response_body
