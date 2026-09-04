"""Worker-scoped LangChain tool interception. No global monkey patching."""
from __future__ import annotations

import inspect
from typing import Any, Dict, List

from langchain_core.tools import BaseTool

from agentveto.contracts.schemas import InterceptedCall
from agentveto.core.context_vars import attack_payload_var, run_id_var, sandbox_manager_var, state_manager_var
from agentveto.telemetry.openinference_logger import TraceManager


def _observe_execution(tool: BaseTool, args: Dict[str, Any], is_source: bool, is_blocked_sink: bool, policy: Dict[str, Any]) -> str:
    payload = attack_payload_var.get()
    sandbox = sandbox_manager_var.get()
    state = state_manager_var.get()
    run_id = run_id_var.get()
    schema = policy.get("schema")

    if is_source:
        response = sandbox.generate_mock_response(
            InterceptedCall(tool_name=tool.name, arguments=args, run_id=run_id, tool_schema=schema), 
            payload
        )
        content = response.response_body
    else:
        # The downstream high-risk call is observed and blocked before its
        # original body. Its optional action is an explicit simulation model.
        if state and policy.get("action"):
            state.record_tool_action(tool.name, args, action=policy["action"], authorized=False)
        content = '{"status":"blocked_by_agentveto"}'

    TraceManager().log_span(
        "TOOL", 
        {
            "tool.name": tool.name, 
            "agentveto.intercepted": True, 
            "agentveto.payload_injected": is_source, 
            "is_authorized": False, 
            "agentveto.blocked_sink": is_blocked_sink
        }, 
        name=tool.name, 
        tool_name=tool.name, 
        tool_parameters=args, 
        input_value=args, 
        output_value=content, 
        is_tainted=is_source or is_blocked_sink, 
        is_injection_source=is_source, 
        is_unauthorized_sink=is_blocked_sink
    )
    return content


def patch_tool_instances(tools: List[BaseTool], policies: Dict[str, Any]) -> None:
    """
    Patch specific tool instances in-place to intercept their execution.
    This avoids global monkey patching of BaseTool.invoke.
    """
    for tool in tools:
        policy = policies.get(tool.name, {})
        
        # Patch sync function
        original_func = getattr(tool, "func", None)
        if original_func:
            def make_wrapper(orig, t, pol):
                def wrapper(*args, **kwargs):
                    payload = attack_payload_var.get()
                    is_source = bool(payload and payload.target_tool == t.name)
                    is_sink = bool(payload and t.name == payload.metadata.get("sink_tool"))
                    
                    if is_source or is_sink:
                        return _observe_execution(t, kwargs, is_source, is_sink, pol)
                        
                    result = orig(*args, **kwargs)
                    TraceManager().log_span(
                        "TOOL", 
                        {"tool.name": t.name, "agentveto.intercepted": False}, 
                        name=t.name, 
                        tool_name=t.name, 
                        tool_parameters=kwargs, 
                        input_value=kwargs, 
                        output_value=str(result)
                    )
                    return result
                return wrapper
            
            tool.func = make_wrapper(original_func, tool, policy)
            
        # Patch async function
        original_coro = getattr(tool, "coroutine", None)
        if original_coro:
            def make_async_wrapper(orig, t, pol):
                async def wrapper(*args, **kwargs):
                    payload = attack_payload_var.get()
                    is_source = bool(payload and payload.target_tool == t.name)
                    is_sink = bool(payload and t.name == payload.metadata.get("sink_tool"))
                    
                    if is_source or is_sink:
                        return _observe_execution(t, kwargs, is_source, is_sink, pol)
                        
                    result = await orig(*args, **kwargs)
                    TraceManager().log_span(
                        "TOOL", 
                        {"tool.name": t.name, "agentveto.intercepted": False}, 
                        name=t.name, 
                        tool_name=t.name, 
                        tool_parameters=kwargs, 
                        input_value=kwargs, 
                        output_value=str(result)
                    )
                    return result
                return wrapper
                
            tool.coroutine = make_async_wrapper(original_coro, tool, policy)
