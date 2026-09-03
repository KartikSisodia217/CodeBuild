import re
with open("backend/main.py", "r") as f:
    content = f.read()

# Fix the else block in start_scan_endpoint
new_scan_logic = """    else:
        from agentveto.contracts.schemas import ScanResult, ScanStatus, SecurityVerdict, ProjectManifest
        from agentveto.core.execution_runtime import ExecutionRuntime
        from fastapi import HTTPException, status
        
        scenario_id = req.scenario_id or "zero_click_echoleak"
        
        if scenario_id not in ["zero_click_echoleak", "benign_support_flow"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown controlled fixture scenario '{scenario_id}'."
            )
            
        repository = "tests.fixtures.langgraph_test_project.agent:graph"
        if scenario_id == "benign_support_flow":
            repository = "tests.fixtures.langgraph_test_project.benign_agent:graph"
            
        manifest = ProjectManifest(
            project_name=scenario_id,
            source_type="local_fixture",
            repository=repository,
            agentic=True,
            supported=True,
            integration_type="langgraph"
        )
        
        runtime = ExecutionRuntime(manifest, "")
        scan_result = runtime.execute()
        
        if scan_result.evaluation:
            _record_evaluation(scan_result.evaluation)
            
        return scan_result"""

content = re.sub(r'    else:\n        from agentveto.contracts.schemas import ScanResult.*?return scan_result', new_scan_logic, content, flags=re.DOTALL)

# Fix get_scenario_details
new_details_logic = """@app.get("/api/scenarios/{scenario_id}")
def get_scenario_details(scenario_id: str):
    from agentveto.contracts.schemas import ScanResult, ScanStatus, SecurityVerdict, ProjectManifest
    from agentveto.core.execution_runtime import ExecutionRuntime
    from fastapi import HTTPException, status
    
    if scenario_id not in ["zero_click_echoleak", "benign_support_flow"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown controlled fixture scenario '{scenario_id}'."
        )
        
    repository = "tests.fixtures.langgraph_test_project.agent:graph"
    if scenario_id == "benign_support_flow":
        repository = "tests.fixtures.langgraph_test_project.benign_agent:graph"
        
    manifest = ProjectManifest(
        project_name=scenario_id,
        source_type="local_fixture",
        repository=repository,
        agentic=True,
        supported=True,
        integration_type="langgraph"
    )
    
    runtime = ExecutionRuntime(manifest, "")
    scan_result = runtime.execute()
    
    return scan_result.model_dump()"""

content = re.sub(r'@app.get\("/api/scenarios/{scenario_id}"\)\ndef get_scenario_details\(scenario_id: str\):.*?return scan_result\.model_dump\(\)', new_details_logic, content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
