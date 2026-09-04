from fastapi.testclient import TestClient
from backend.main import app, SCAN_RUNS
from agentveto.contracts.schemas import ScanStatus, ProjectManifest, ScanResult

client = TestClient(app)

def test_a_not_agentic_reevaluate():
    manifest = {"project_id": "proj_A", "agentic": False, "supported": False}
    res = client.post("/api/scan", json={"project_manifest": manifest})
    assert res.status_code == 200
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert reeval.status_code == 400
    assert "Cannot re-evaluate a project with status NOT_AGENTIC" in reeval.json()["detail"]

def test_b_unsupported_reevaluate():
    manifest = {"project_id": "proj_B", "agentic": True, "supported": False, "integration_type": "unknown"}
    res = client.post("/api/scan", json={"project_manifest": manifest})
    assert res.status_code == 200
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert reeval.status_code == 400
    assert "Cannot re-evaluate a project with status UNSUPPORTED" in reeval.json()["detail"]

def test_c_unsupported_entrypoint_reevaluate():
    manifest = {"project_id": "proj_C", "agentic": True, "supported": True, "integration_type": "langgraph", "entrypoint": ""}
    res = client.post("/api/scan", json={"project_manifest": manifest})
    assert res.status_code == 200
    assert res.json()["status"] == "UNSUPPORTED_ENTRYPOINT"
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert reeval.status_code == 200
    assert reeval.json()["status"] == "UNSUPPORTED_ENTRYPOINT"
    assert reeval.json()["verdict"] is None

def test_d_execution_unavailable_reevaluate():
    manifest = {"project_id": "proj_D", "agentic": True, "supported": True, "integration_type": "langgraph", "entrypoint": "fake:graph", "project_name": "fake_path"}
    res = client.post("/api/scan", json={"project_manifest": manifest})
    assert res.status_code == 200
    assert res.json()["status"] in ["EXECUTION_FAILED", "EXECUTION_UNAVAILABLE"]
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert reeval.status_code == 200
    assert reeval.json()["status"] in ["EXECUTION_FAILED", "EXECUTION_UNAVAILABLE"]
    assert reeval.json()["verdict"] is None

def test_e_external_project_isolation():
    manifest1 = {"project_id": "proj_E1", "agentic": True, "supported": False, "integration_type": "unknown"}
    res1 = client.post("/api/scan", json={"project_manifest": manifest1})
    run_id_1 = res1.json()["run_id"]
    
    manifest2 = {"project_id": "proj_E2", "agentic": False, "supported": False}
    res2 = client.post("/api/scan", json={"project_manifest": manifest2})
    run_id_2 = res2.json()["run_id"]
    
    # reevaluate 1
    reeval = client.post(f"/api/scan/{run_id_1}/re-evaluate")
    assert reeval.status_code == 400
    assert "UNSUPPORTED" in reeval.json()["detail"]
    assert "NOT_AGENTIC" not in reeval.json()["detail"]

import requests

def test_f_ledgerai_reevaluate():
    with open("Legal.ai.zip", "rb") as f:
        # We upload Legal.ai.zip but label it as LedgerAI for this test just to see the flow
        manifest = client.post("/api/projects/analyze", files={"file": ("Legal.ai.zip", f)}).json()
    
    manifest["project_id"] = "proj_LedgerAI"
    manifest["project_name"] = "LedgerAI"
    manifest["agentic"] = True
    manifest["supported"] = True
    manifest["integration_type"] = "langgraph"
    manifest["entrypoint"] = "invalid:graph"
    
    res = client.post("/api/scan", json={"project_manifest": manifest})
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    
    output_str = str(reeval.json())
    assert "read_tickets" not in output_str
    assert "execute_refund" not in output_str
    assert "balance 1000" not in output_str

def test_g_legalai_reevaluate():
    with open("Legal.ai.zip", "rb") as f:
        manifest = client.post("/api/projects/analyze", files={"file": ("Legal.ai.zip", f)}).json()
    
    # Force agentic = False as stated by the user
    manifest["agentic"] = False
    
    res = client.post("/api/scan", json={"project_manifest": manifest})
    assert res.json()["status"] == "NOT_AGENTIC"
    run_id = res.json()["run_id"]
    
    reeval = client.post(f"/api/scan/{run_id}/re-evaluate")
    assert reeval.status_code == 400
    assert "NOT_AGENTIC" in reeval.json()["detail"]

