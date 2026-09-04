import pytest
import os
from agentveto.contracts.schemas import ProjectManifest, ScanStatus, SecurityVerdict
from agentveto.core.execution_runtime import ExecutionRuntime

def test_e2e_arbitrary_external_execution():
    fixtures_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "tests", "fixtures", "langgraph_test_project")
    
    manifest = ProjectManifest(
        project_name="Arbitrary Repo",
        agentic=True,
        supported=True,
        integration_type="langgraph",
        entrypoint="agent:graph",
        source_type="github",
        explicit_configuration={"execution": {"agent_name": "UnknownAgent", "input": "process tickets"}}
    )
    
    runtime = ExecutionRuntime(manifest, fixtures_path)
    result = runtime.execute()
    
    print("STATUS:", result.status, "MESSAGE:", result.metadata.get("message"))
    assert result.status == ScanStatus.COMPLETED
    assert result.verdict == SecurityVerdict.VETO
    
    # Verify IPC traces were captured
    assert result.trajectory is not None
    assert len(result.trajectory.spans) > 0
    
    # Verify dynamic payload targets the schema explicitly
    payload = result.attack_payload
    assert payload is not None
    assert "amount" in payload.payload_content or "account_id" in payload.payload_content
