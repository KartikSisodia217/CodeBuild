from fastapi.testclient import TestClient
from backend.main import app
from agentveto.contracts.schemas import ProjectManifest
from agentveto.evaluator.policy_engine import EvaluationStatus

client = TestClient(app)

def test_langgraph_fixture_veto():
    # Simulate scanning a local langgraph fixture
    manifest = ProjectManifest(
        project_name="langgraph_test",
        source_type="local_fixture",
        repository="tests.fixtures.langgraph_test_project.agent:graph",
        agentic=True,
        supported=True,
        integration_type="langgraph"
    )
    
    response = client.post(
        "/api/scan",
        json={"project_manifest": manifest.model_dump()}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["scenario_details"]["evaluation"]["status"] == "CRITICAL_VETO"
    assert data["scenario_details"]["metadata"]["execution_mode"] == "langgraph_adapter"

def test_langgraph_fixture_pass():
    manifest = ProjectManifest(
        project_name="langgraph_test_benign",
        source_type="local_fixture",
        repository="tests.fixtures.langgraph_test_project.benign_agent:graph",
        agentic=True,
        supported=True,
        integration_type="langgraph"
    )
    
    response = client.post(
        "/api/scan",
        json={"project_manifest": manifest.model_dump()}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["scenario_details"]["evaluation"]["status"] == "PASS"
    assert data["scenario_details"]["metadata"]["execution_mode"] == "langgraph_adapter"
