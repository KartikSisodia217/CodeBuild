import re

with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

replacement = """        from agentveto.contracts.schemas import ExecutionResult, ScanStatus
        return ExecutionResult(
            run_id=self.run_id,
            status=ScanStatus.COMPLETED,
            trajectory=trace,
            state_diff=state_diff
        )"""

content = re.sub(r'        from agentveto\.contracts\.schemas import ExecutionResult, ScanStatus.*?        return \{.*?\}', replacement, content, flags=re.DOTALL)
content = re.sub(r',\n            "trace": trace,.*?\}', '', content, flags=re.DOTALL) # cleanup any stray remains

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
