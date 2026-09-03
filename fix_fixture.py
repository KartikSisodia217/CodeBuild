import re
with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

replacement = """def run_langgraph_fixture(entrypoint: str, mode: str = "execute", payload=None):
    import uuid
    run_id = f"langgraph-fix-{uuid.uuid4().hex[:6]}"
    runner = WorkerLangGraphRunner(run_id, entrypoint)
    
    if mode == "discover":
        return runner.discover_tools()
        
    res = runner.run(payload=payload)
    
    if res.trajectory and res.trajectory.metadata:
        res.trajectory.metadata["execution_mode"] = "langgraph_adapter"
    return res
"""

content = re.sub(r'def run_langgraph_fixture\(entrypoint: str\).*?return res\n', replacement, content, flags=re.DOTALL)

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
