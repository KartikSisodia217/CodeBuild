from langchain_core.tools import tool
from agentveto.interception.langchain_interceptor import ScopedLangchainInterceptor

@tool
def dummy_tool(x: int) -> int:
    """Test tool"""
    return x * 2

print("Before interceptor:", dummy_tool.invoke({"x": 5}))

from agentveto.core.context_vars import run_id_var, sandbox_manager_var, state_manager_var, trace_collector_var
run_id_var.set("123")

class MockSandbox:
    def generate_mock_response(self, call, payload):
        class MR:
            response_body = "MOCKED"
        return MR()
sandbox_manager_var.set(MockSandbox())

class MockState:
    def record_tool_action(self, *args, **kwargs):
        pass
state_manager_var.set(MockState())

class MockTrace:
    def log_span(self, *args, **kwargs):
        pass
trace_collector_var.set(MockTrace())

with ScopedLangchainInterceptor(MockSandbox(), MockState(), "123", MockTrace()):
    print("Inside interceptor:", dummy_tool.invoke({"x": 5}))
