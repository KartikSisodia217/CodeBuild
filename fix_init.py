import re

with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

content = content.replace(
"""class ScopedLangchainInterceptor:
    def __init__(self, sandbox, state, run_id, trace_manager):
        self.sandbox = sandbox
        self.state = state
        self.run_id = run_id
        self.original_invoke = None
        self.trace_manager = trace_manager""",
"""class ScopedLangchainInterceptor:
    def __init__(self, sandbox, state, run_id, trace_manager):
        self.sandbox = sandbox
        self.state = state
        self.run_id = run_id
        self.original_invoke = None
        self.trace_manager = trace_manager"""
)

content = content.replace(
"""class WorkerLangGraphRunner(AgentAdapter):
    def __init__(self, run_id, entrypoint):
        self.run_id = run_id""",
"""class WorkerLangGraphRunner(AgentAdapter):
    def __init__(self, run_id, entrypoint):
        super().__init__(run_id, entrypoint)"""
)

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
