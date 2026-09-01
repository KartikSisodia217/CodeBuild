"""
Agent Adapter (@intercept decorator)
Owner: Interception & Trace Engineer (Member 2)
"""
import functools
import inspect
import asyncio
import uuid
from typing import Callable, Any

from agentveto.core.context_vars import run_id_var
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

def _handle_intercept(func: Callable, args: tuple, kwargs: dict, is_async: bool) -> Any:
    """Core logic to build InterceptedCall, log telemetry, and fetch mock response."""
    tool_name = func.__name__
    
    # Extract signature/schema
    sig = inspect.signature(func)
    bound_args = sig.bind(*args, **kwargs)
    bound_args.apply_defaults()
    arguments = bound_args.arguments
    
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
    
    # Fetch mock response (SandboxManager is synchronous in our mock_generator.py)
    mock_response = sandbox_manager.generate_mock_response(intercepted_call)
    
    # Log telemetry via Trace Engine
    trace_attributes = {
        "tool.name": tool_name,
        "tool.arguments": arguments,
        "run_id": current_run_id,
        "status": mock_response.status_code,
        "llm.output_messages": [mock_response.response_body]
    }
    trace_manager.log_span("TOOL", trace_attributes)
    
    # Return mocked response
    if mock_response.data is not None:
        return mock_response.data
    return mock_response.response_body
