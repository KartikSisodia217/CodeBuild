from fastapi.testclient import TestClient
from backend.main import app
from agentveto.contracts.schemas import ProjectManifest
from agentveto.evaluator.policy_engine import SecurityVerdict

client = TestClient(app)

def test_langgraph_fixture_veto():
    response = client.post("/api/scan", json={"scenario_id": "zero_click_echoleak"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["evaluation"]["status"] == "VETO"
    assert data["metadata"]["execution_mode"] == "deterministic_fixture"

def test_langgraph_fixture_pass():
    response = client.post("/api/scan", json={"scenario_id": "benign_support_flow"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["evaluation"]["status"] == "PASS"
    assert data["metadata"]["execution_mode"] == "deterministic_fixture"
