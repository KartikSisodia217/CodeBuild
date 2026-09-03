with open("backend/main.py", "r") as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "from agentveto.runtime import list_fixture_scenarios, run_fixture_scenario" in line:
        out.append("from agentveto.runtime import list_fixture_scenarios\n")
        continue
        
    if line.strip() == "else:" and "from agentveto.contracts.schemas import ScanResult, ScanStatus, SecurityVerdict" in "".join(lines[lines.index(line)+1:lines.index(line)+3]):
        # We are at the else block of start_scan_endpoint
        skip = True
        
        new_else = """    else:
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
            
        return scan_result
"""
        out.append(new_else)
        continue
        
    if skip:
        if line.startswith("@app.get(\"/api/scenarios/{scenario_id}\")"):
            skip = False
        else:
            continue
            
    if line.startswith("@app.get(\"/api/scenarios/{scenario_id}\")"):
        skip = True
        new_details = """@app.get("/api/scenarios/{scenario_id}")
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
    
    return scan_result.model_dump()
"""
        out.append(new_details)
        continue
        
    if skip:
        if line.startswith("import tempfile"):
            skip = False
            out.append(line)
        else:
            continue
    else:
        out.append(line)

with open("backend/main.py", "w") as f:
    f.writelines(out)
