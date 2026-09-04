"""LangGraph adapter, used exclusively inside the worker process."""
from __future__ import annotations

import importlib
import inspect
import sys
import asyncio
from contextlib import contextmanager
from typing import Any, Dict, List, Callable

from langchain_core.messages import HumanMessage
from langchain_core.tools import BaseTool

from agentveto.adapters.base import AgentAdapter
from agentveto.contracts.schemas import ExecutionResult, ScanStatus, ToolSchema, TrajectoryData
from agentveto.core.context_vars import attack_payload_var, run_id_var, sandbox_manager_var, state_manager_var, trace_collector_var
from agentveto.interception.langchain_interceptor import patch_tool_instances
from agentveto.sandbox.mock_generator import SandboxManager
from agentveto.sandbox.state_manager import SandboxStateManager


@contextmanager
def worker_context(run_id, sandbox, state, collector):
    tokens = [run_id_var.set(run_id), sandbox_manager_var.set(sandbox), state_manager_var.set(state), trace_collector_var.set(collector)]
    try:
        yield
    finally:
        trace_collector_var.reset(tokens.pop())
        state_manager_var.reset(tokens.pop())
        sandbox_manager_var.reset(tokens.pop())
        run_id_var.reset(tokens.pop())


class LangGraphAdapter(AgentAdapter):
    def __init__(self, run_id: str, entrypoint: str, execution_options: Dict[str, Any] | None = None):
        super().__init__(run_id, entrypoint)
        self.execution_options = execution_options or {}
        self._target_object = None
        self._tools_cache = None

    def _load(self):
        if self._target_object is not None:
            return self._target_object
            
        module_name, object_name = self.entrypoint.split(":", 1)
        module = importlib.import_module(module_name)
        target = getattr(module, object_name)
        self._target_object = target
        return target

    def _discover_tools_dynamically(self) -> List[Any]:
        if self._tools_cache is not None:
            return self._tools_cache
            
        tools = []
        module_name = self.entrypoint.split(":", 1)[0]
        root_pkg = module_name.split('.')[0]
        
        # Look for explicit tools export first
        try:
            mod = importlib.import_module(module_name)
            if hasattr(mod, "tools") and isinstance(mod.tools, list):
                tools.extend(mod.tools)
        except Exception:
            pass
            
        # Scan sys.modules for loaded project modules to find BaseTool instances
        for name, mod in list(sys.modules.items()):
            if not name.startswith(root_pkg):
                continue
            for attr_name in dir(mod):
                try:
                    val = getattr(mod, attr_name)
                    if isinstance(val, BaseTool) and val not in tools:
                        tools.append(val)
                except Exception:
                    pass
                    
        self._tools_cache = tools
        return tools

    def _schemas(self, tools) -> List[ToolSchema]:
        actions = self.execution_options.get("tool_actions", {})
        result = []
        for tool in tools:
            args_schema = getattr(tool, "args_schema", None)
            parameters = args_schema.model_json_schema() if args_schema and hasattr(args_schema, "model_json_schema") else {"type": "object", "properties": {}}
            metadata = dict(getattr(tool, "metadata", None) or {})
            if tool.name in actions:
                metadata["agentveto_action"] = actions[tool.name]
            result.append(ToolSchema(name=tool.name, description=getattr(tool, "description", "") or "", parameters=parameters, required=parameters.get("required", []), metadata=metadata))
        return result

    def discover_tools(self) -> List[ToolSchema]:
        self._load()
        tools = self._discover_tools_dynamically()
        return self._schemas(tools)

    def run(self, payload=None) -> ExecutionResult:
        try:
            target = self._load()
            tools = self._discover_tools_dynamically()
            schemas = self._schemas(tools)
            state = SandboxStateManager(self.run_id, self.execution_options.get("initial_state", {}))
            spans = []
            policies = {schema.name: {"schema": schema, "action": schema.metadata.get("agentveto_action")} for schema in schemas}
            sandbox = SandboxManager(allow_live_provider=False)
            
            with worker_context(self.run_id, sandbox, state, spans):
                token = attack_payload_var.set(payload)
                try:
                    patch_tool_instances(tools, policies)
                    
                    input_arg = self.execution_options.get("input")
                    if input_arg is None:
                        if hasattr(target, "invoke") or hasattr(target, "ainvoke"):
                            input_arg = {"messages": [HumanMessage(content="Process the available work.")]}
                        else:
                            input_arg = "Process the available work."
                    elif isinstance(input_arg, str) and (hasattr(target, "invoke") or hasattr(target, "ainvoke")):
                        # Attempt to pass it as dict if the target is a graph
                        input_arg = {"messages": [HumanMessage(content=input_arg)]}
                            
                    # Execute
                    if inspect.iscoroutinefunction(target) or (hasattr(target, "ainvoke") and callable(target.ainvoke)):
                        if hasattr(target, "ainvoke"):
                            asyncio.run(target.ainvoke(input_arg))
                        else:
                            asyncio.run(target(input_arg, "task_123"))
                    else:
                        if hasattr(target, "invoke"):
                            target.invoke(input_arg)
                        elif callable(target):
                            target(input_arg)
                        else:
                            raise ValueError("Target is neither a graph nor a callable.")
                finally:
                    attack_payload_var.reset(token)
            diff = state.compute_diff()
            return ExecutionResult(run_id=self.run_id, status=ScanStatus.COMPLETED, trajectory=TrajectoryData(run_id=self.run_id, agent_name=self.execution_options.get("agent_name", "LangGraph target"), spans=spans, metadata={"execution_mode": "subprocess", "framework": "langgraph"}), state_before=diff.before, state_after=diff.after, state_diff=diff, metadata={"tool_schemas": [item.model_dump() for item in schemas]})
        except Exception as exc:
            import traceback
            tb = traceback.format_exc()
            return ExecutionResult(run_id=self.run_id, status=ScanStatus.EXECUTION_FAILED, error_message=f"LangGraph worker error: {type(exc).__name__}: {exc}\n{tb}")

# Compatibility name for callers that previously imported the worker runner.
WorkerLangGraphRunner = LangGraphAdapter
