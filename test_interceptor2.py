from langchain_core.tools import tool
from agentveto.interception.langchain_interceptor import ScopedLangchainInterceptor

@tool
def dummy_tool(x: int) -> int:
    """Test tool"""
    return x * 2

from agentveto.core.context_vars import run_id_var, sandbox_manager_var, state_manager_var, trace_collector_var
run_id_var.set("123")
class MockState:
    def record_tool_action(self, *args, **kwargs):
        pass
state_manager_var.set(MockState())

class MockTrace:
    def log_span(self, *args, **kwargs):
        print(f"SPAN: {args} {kwargs}")
trace_collector_var.set(MockTrace())

with ScopedLangchainInterceptor(None, MockState(), "123", MockTrace()):
    print("Inside interceptor:", dummy_tool.invoke({"x": 5}))
