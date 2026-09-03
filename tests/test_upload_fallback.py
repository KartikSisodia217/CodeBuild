import pytest
from fastapi.testclient import TestClient
from main import app
from agentveto.contracts.schemas import ProjectManifest, AgentCandidate, ToolCandidate

client = TestClient(app)

def test_uploaded_non_agent_project():
    """1. Uploaded non-agent project -> NOT_AGENTIC"""
    manifest = ProjectManifest(project_name="Legal.ai.zip", supported=False, agents=[])
    
    response = client.post(
        "/api/scan",
        json={
            "agent_name": "Customer Support Agent",
            "attack_profile": "Adaptive Adversarial Testing (ASI01)",
            "environment": "Synthetic Sandbox",
            "project_manifest": manifest.model_dump()
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_agentic"
    assert data["reason"] == "no_agent_detected"
    assert data["scenario_details"]["evaluation"]["status"] == "NOT_AGENTIC"
    # Ensure no PASS and no trace
    assert "trace" not in data["scenario_details"] or data["scenario_details"]["trace"] is None

def test_uploaded_unsupported_agent():
    """2. Uploaded unsupported agent -> UNSUPPORTED"""
    # Suppose we found some agent but it's not supported by AgentVeto
    agent = AgentCandidate(name="CustomAgent", file="agent.py", integration="unknown", tools=[])
    manifest = ProjectManifest(project_name="Custom.zip", agentic=True, supported=False, agents=[agent])
    
    response = client.post(
        "/api/scan",
        json={
            "agent_name": "Customer Support Agent",
            "attack_profile": "Adaptive Adversarial Testing (ASI01)",
            "environment": "Synthetic Sandbox",
            "project_manifest": manifest.model_dump()
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unsupported"
    assert data["reason"] == "no_supported_integration"
    assert data["scenario_details"]["evaluation"]["status"] == "UNSUPPORTED"
    # Ensure no PASS and no trace
    assert "trace" not in data["scenario_details"] or data["scenario_details"]["trace"] is None

def test_explicit_demo_fixture():
    """3. Explicit demo fixture -> fixture runner still works, returns PASS/VETO"""
    # Demo VETO
    response_veto = client.post(
        "/api/scan",
        json={"scenario_id": "zero_click_echoleak"}
    )
    assert response_veto.status_code == 200
    assert response_veto.json()["status"] == "completed"
    assert response_veto.json()["scenario_details"]["evaluation"]["status"] == "CRITICAL_VETO"
    
    # Demo PASS
    response_pass = client.post(
        "/api/scan",
        json={"scenario_id": "benign_support_flow"}
    )
    assert response_pass.status_code == 200
    assert response_pass.json()["status"] == "completed"
    assert response_pass.json()["scenario_details"]["evaluation"]["status"] == "PASS"

def test_fixture_runner_not_selected_for_empty_tools():
    """4. Verify DeterministicFixtureRunner cannot accidentally be selected merely because a user project's tool list is empty."""
    manifest = ProjectManifest(project_name="EmptyTools.zip", agentic=True, supported=True, agents=[
        AgentCandidate(name="EmptyAgent", file="agent.py", integration="python_interceptor", tools=[])
    ])
    
    response = client.post(
        "/api/scan",
        json={
            "project_manifest": manifest.model_dump()
        }
    )
    # The current implementation will hit the 501 error because we haven't implemented real execution yet.
    # The critical thing is it does NOT return a 200 PASS from DeterministicFixtureRunner!
    assert response.status_code == 501
    assert "Real runtime execution engine is not yet implemented" in response.json()["detail"]

def test_legal_ai_like_rag_fixture():
    """5. Legal.ai-like RAG fixture -> no agent detected -> no fake attempts/spans -> no synthetic PASS"""
    # Same as test 1
    manifest = ProjectManifest(project_name="Legal.ai.zip", supported=False, agents=[])
    
    response = client.post(
        "/api/scan",
        json={
            "project_manifest": manifest.model_dump()
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_agentic"
    details = data["scenario_details"]
    assert details["evaluation"]["status"] == "NOT_AGENTIC"
    assert "attack_analysis" not in details
    assert details.get("trace") is None
