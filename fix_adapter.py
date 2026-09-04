import re

with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

# Make it return ExecutionResult
replacement = """
        trace = TrajectoryData(
            run_id=self.run_id,
            agent_name="LangGraph Agent",
            spans=spans,
            metadata={
                "execution_mode": "external_runtime",
                "threat_model": threat_model.model_dump(),
                "attack_plan": plan.model_dump(),
                "attempts": attempts
            }
        )
        
        state_diff = state.compute_diff()
        
        from agentveto.contracts.schemas import ExecutionResult, ScanStatus
        return ExecutionResult(
            run_id=self.run_id,
            status=ScanStatus.COMPLETED,
            trajectory=trace,
            state_diff=state_diff
        )
"""

content = re.sub(r'        trace = TrajectoryData\(.*?\n        return \{.*?\}', replacement, content, flags=re.DOTALL)

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
