import pytest
from fastapi.testclient import TestClient
from agentveto.contracts.schemas import ProjectManifest, ScanStatus, TrajectoryData, ScanResult, SecurityVerdict
from main import app, SCAN_RUNS, POLICY_RULES_STORE
import uuid

client = TestClient(app)

def setup_module(module):
    # Clear SCAN_RUNS before tests
    SCAN_RUNS.clear()

def test_not_agentic_terminal():
    manifest = ProjectManifest(project_name="legal_dummy", agentic=False, source_type="zip")
    response = client.post("/api/scan", json={"project_manifest": manifest.model_dump()})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NOT_AGENTIC"
    run_id = data["run_id"]
    
    # Assert persisted
    assert run_id in SCAN_RUNS
    
    # Assert evaluator not called (verdict is None)
    assert data.get("verdict") is None
    
    # Assert re-evaluation fails
    re_response = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert re_response.status_code == 400
    assert "Cannot re-evaluate" in re_response.json()["detail"]

def test_unsupported_terminal():
    manifest = ProjectManifest(project_name="some_project", agentic=True, supported=False, source_type="zip")
    response = client.post("/api/scan", json={"project_manifest": manifest.model_dump()})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UNSUPPORTED"
    run_id = data["run_id"]
    
    assert run_id in SCAN_RUNS
    assert data.get("verdict") is None
    
    re_response = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert re_response.status_code == 400

def test_unsupported_entrypoint_terminal():
    # A supported framework but no explicit entrypoint
    manifest = ProjectManifest(project_name="ledger_dummy", agentic=True, supported=True, integration_type="langgraph", source_type="zip")
    response = client.post("/api/scan", json={"project_manifest": manifest.model_dump()})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UNSUPPORTED_ENTRYPOINT"
    run_id = data["run_id"]
    
    assert run_id in SCAN_RUNS
    assert data.get("verdict") is None
    
    # Re-evaluation returns the same terminal state without error, but no evaluation
    re_response = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert re_response.status_code == 200
    assert re_response.json()["status"] == "UNSUPPORTED_ENTRYPOINT"
    assert re_response.json().get("verdict") is None

def test_empty_trajectory_no_pass():
    # Manually insert a COMPLETED run with empty trajectory
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    run = ScanResult(
        run_id=run_id,
        status=ScanStatus.COMPLETED,
        trajectory=TrajectoryData(run_id=run_id, spans=[])
    )
    SCAN_RUNS[run_id] = run
    
    re_response = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert re_response.status_code == 200
    # The endpoint might return the same run unchanged or evaluate it. 
    # With our change, evaluating an empty trace returns None status, not PASS.
    assert re_response.json().get("verdict") is None

def test_demo_scenario_works():
    response = client.get("/api/scenarios/zero_click_echoleak")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["verdict"] == "VETO"
    run_id = data["run_id"]
    
    assert run_id in SCAN_RUNS

def test_external_run_no_default_scenario():
    # Send a request with no scenario_id, should not default to zero_click_echoleak
    # Since StartScanRequest defaults scenario_id to None, we'll send empty dict
    response = client.post("/api/scan", json={})
    assert response.status_code == 400
    assert "Either project_manifest or scenario_id must be provided" in response.json()["detail"]

def test_cross_run_contamination():
    # Run a demo which VETOs
    demo_resp = client.get("/api/scenarios/zero_click_echoleak")
    demo_run = demo_resp.json()["run_id"]
    
    # Run an external which is NOT_AGENTIC
    manifest = ProjectManifest(project_name="legal_dummy", agentic=False, source_type="zip")
    ext_resp = client.post("/api/scan", json={"project_manifest": manifest.model_dump()})
    ext_run = ext_resp.json()["run_id"]
    
    # Re-evaluate the external
    re_ext = client.post(f"/api/scan/{ext_run}/re-evaluate")
    assert re_ext.status_code == 400
    assert "Cannot re-evaluate" in re_ext.json()["detail"]
    
    # The external run should still be NOT_AGENTIC, no contamination from demo
    check_ext = client.get(f"/api/scan/{ext_run}")
    assert check_ext.json()["status"] == "NOT_AGENTIC"
    assert check_ext.json().get("verdict") is None
