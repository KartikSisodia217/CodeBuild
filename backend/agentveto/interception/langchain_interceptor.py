"""Worker-scoped LangChain tool interception."""
from __future__ import annotations

import threading
from typing import Any, Dict

from langchain_core.messages import ToolMessage
from langchain_core.tools import BaseTool

from agentveto.contracts.schemas import InterceptedCall
from agentveto.core.context_vars import attack_payload_var, run_id_var, sandbox_manager_var, state_manager_var
from agentveto.telemetry.openinference_logger import TraceManager

_lock = threading.RLock()
_original_invoke = None
_original_ainvoke = None
_active = 0
_policy_by_tool: Dict[str, Dict[str, Any]] = {}


def _arguments(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value.get("args", value)
    return {"input": value}


def _tool_message(value: Any, tool_name: str, content: str):
    if isinstance(value, dict) and value.get("type") == "tool_call":
        return ToolMessage(content=content, name=tool_name, tool_call_id=value.get("id", "agentveto"))
    return content


def _observe(tool: BaseTool, value: Any, *, is_source: bool, is_blocked_sink: bool):
    payload = attack_payload_var.get()
    sandbox = sandbox_manager_var.get()
    state = state_manager_var.get()
    run_id = run_id_var.get()
    args = _arguments(value)
    policy = _policy_by_tool.get(tool.name, {})
    schema = policy.get("schema")
    if is_source:
        response = sandbox.generate_mock_response(InterceptedCall(tool_name=tool.name, arguments=args, run_id=run_id, tool_schema=schema), payload)
        content = response.response_body
    else:
        # The downstream high-risk call is observed and blocked before its
        # original body.  Its optional action is an explicit simulation model.
        if state and policy.get("action"):
            state.record_tool_action(tool.name, args, action=policy["action"], authorized=False)
        content = '{"status":"blocked_by_agentveto"}'
    TraceManager().log_span("TOOL", {"tool.name": tool.name, "agentveto.intercepted": True, "agentveto.payload_injected": is_source, "is_authorized": False, "agentveto.blocked_sink": is_blocked_sink}, name=tool.name, tool_name=tool.name, tool_parameters=args, input_value=args, output_value=content, is_tainted=is_source or is_blocked_sink, is_injection_source=is_source, is_unauthorized_sink=is_blocked_sink)
    return _tool_message(value, tool.name, content)


def _patched_invoke(tool_self, value, config=None, **kwargs):
    payload = attack_payload_var.get()
    policy = _policy_by_tool.get(tool_self.name, {})
    source = bool(payload and payload.target_tool == tool_self.name)
    sink = bool(payload and tool_self.name == payload.metadata.get("sink_tool"))
    if source or sink:
        return _observe(tool_self, value, is_source=source, is_blocked_sink=sink)
    result = _original_invoke(tool_self, value, config=config, **kwargs)
    TraceManager().log_span("TOOL", {"tool.name": tool_self.name, "agentveto.intercepted": False}, name=tool_self.name, tool_name=tool_self.name, tool_parameters=_arguments(value), input_value=_arguments(value), output_value=str(result))
    return result


async def _patched_ainvoke(tool_self, value, config=None, **kwargs):
    payload = attack_payload_var.get()
    source = bool(payload and payload.target_tool == tool_self.name)
    sink = bool(payload and tool_self.name == payload.metadata.get("sink_tool"))
    if source or sink:
        return _observe(tool_self, value, is_source=source, is_blocked_sink=sink)
    result = await _original_ainvoke(tool_self, value, config=config, **kwargs)
    TraceManager().log_span("TOOL", {"tool.name": tool_self.name, "agentveto.intercepted": False}, name=tool_self.name, tool_name=tool_self.name, tool_parameters=_arguments(value), input_value=_arguments(value), output_value=str(result))
    return result


class ScopedLangchainInterceptor:
    """Patch only inside one worker execution and restore on every exit."""
    def __init__(self, tool_policies: Dict[str, Dict[str, Any]]):
        self.tool_policies = tool_policies

    def __enter__(self):
        global _active, _original_invoke, _original_ainvoke, _policy_by_tool
        with _lock:
            if _active == 0:
                _original_invoke, _original_ainvoke = BaseTool.invoke, BaseTool.ainvoke
                BaseTool.invoke, BaseTool.ainvoke = _patched_invoke, _patched_ainvoke
            _active += 1
            _policy_by_tool = self.tool_policies
        return self

    def __exit__(self, exc_type, exc, tb):
        global _active, _policy_by_tool
        with _lock:
            _active -= 1
            if _active == 0:
                BaseTool.invoke, BaseTool.ainvoke = _original_invoke, _original_ainvoke
                _policy_by_tool = {}
