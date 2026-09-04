import re
with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

replacement = """class WorkerLangGraphRunner(AgentAdapter):
    def __init__(self, run_id, entrypoint):
        super().__init__(run_id, entrypoint)

    def _get_graph_and_tools(self):
        import importlib
        from agentveto.contracts.schemas import ToolSchema
        mod_name, obj_name = self.entrypoint.split(":")
        mod = importlib.import_module(mod_name)
        graph = getattr(mod, obj_name)
        
        tools = getattr(mod, "tools", [])
        tool_schemas = []
        for t in tools:
            tool_schemas.append(ToolSchema(
                name=t.name,
                description=t.description,
                parameters={"type": "object", "properties": {}}
            ))
        return graph, tool_schemas

    def discover_tools(self) -> List[ToolSchema]:
        _, tool_schemas = self._get_graph_and_tools()
        return tool_schemas

    def run(self, payload=None) -> ExecutionResult:
        import time
        from agentveto.contracts.schemas import ExecutionResult, ScanStatus, TrajectoryData
        from agentveto.core.context_vars import attack_payload_var, parent_span_id_var
        from agentveto.sandbox.state_manager import SandboxStateManager
        from agentveto.sandbox.mock_generator import SandboxManager
        from agentveto.telemetry.openinference_logger import TraceManager
        from langchain_core.messages import HumanMessage
        
        graph, tool_schemas = self._get_graph_and_tools()
        
        state = SandboxStateManager(self.run_id, initial_state={})
        sandbox = SandboxManager(allow_live_provider=False)
        trace_manager = TraceManager()
        spans = []
        
        with execution_context(self.run_id, sandbox, state, spans):
            agent_span = trace_manager.log_span(
                "AGENT",
                {"agentveto.execution_mode": "external_runtime", "agentveto.user_task": "Process tickets"},
                name="LangGraph Agent",
                input_value="Process tickets"
            )
            parent_token = parent_span_id_var.set(agent_span.span_id)
            
            with ScopedLangchainInterceptor(sandbox, state, self.run_id, trace_manager):
                payload_token = None
                if payload:
                    payload_token = attack_payload_var.set(payload)
                try:
                    llm_span = trace_manager.log_span(
                        "LLM",
                        {"agentveto.attempt": 1},
                        name="LangGraph Agent LLM",
                        input_value="Processing with injected payload" if payload else "Processing tickets"
                    )
                    llm_parent_token = parent_span_id_var.set(llm_span.span_id)
                    
                    try:
                        result = graph.invoke({"messages": [HumanMessage(content="Process tickets")]})
                    except Exception as e:
                        result = {"error": str(e)}
                        
                    parent_span_id_var.reset(llm_parent_token)
                    
                finally:
                    if payload_token:
                        attack_payload_var.reset(payload_token)
                        
            parent_span_id_var.reset(parent_token)

        trace = TrajectoryData(
            run_id=self.run_id,
            agent_name="LangGraph Agent",
            spans=spans,
            metadata={
                "execution_mode": "external_runtime"
            }
        )
        
        state_diff = state.compute_diff()
        
        return ExecutionResult(
            run_id=self.run_id,
            status=ScanStatus.COMPLETED,
            trajectory=trace,
            state_diff=state_diff
        )
"""

content = re.sub(r'class WorkerLangGraphRunner\(AgentAdapter\):.*?\ndef run_langgraph_fixture', replacement + '\ndef run_langgraph_fixture', content, flags=re.DOTALL)

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
