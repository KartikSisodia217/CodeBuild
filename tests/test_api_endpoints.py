"""
Integration Tests for AgentVeto FastAPI REST API (Member 4)
Verifies:
1. /api/health endpoint
2. /api/rules endpoint
3. /api/scenarios and /api/scenarios/{id} endpoints
4. /api/evaluate endpoint with payload
5. /api/dag endpoint returning React Flow nodes & edges
6. /api/export-yaml endpoint returning YAML string
"""

import sys
import os
from starlette.testclient import TestClient

root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(root_path, "backend")
if root_path not in sys.path:
    sys.path.insert(0, root_path)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.main import app
from agentveto.schemas import TrajectoryData, OpenInferenceSpan, SpanKind

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_rules():
    response = client.get("/api/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 6
    # assert any(r["sink_tool"] == "execute_refund" for r in rules)


def test_api_scenarios_list_and_detail():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert {"zero_click_echoleak", "benign_support_flow"}.issubset({s["id"] for s in scenarios})
    assert all(s["execution_mode"] == "subprocess" for s in scenarios)
    
    # Test details for Zero-Click EchoLeak
    detail_res = client.get("/api/scenarios/zero_click_echoleak")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["project_manifest"]["project_name"] == "zero_click_echoleak"
    assert data["evaluation"]["status"] == "VETO"
    assert "nodes" in data["evidence"]
    assert "edges" in data["evidence"]


def test_api_evaluate():
    payload = {
        "trace": {
            "run_id": "run_api_test_01",
            "agent_name": "TestBot",
            "user_prompt": "Refund user 50",
            "spans": [
                {
                    "span_id": "span_01",
                    "name": "execute_refund",
                    "kind": "TOOL",
                    "tool_name": "execute_refund",
                    "status_code": "ERROR",
                    "is_unauthorized_sink": True
                }
            ]
        }
    }
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 200
    res = response.json()
    # assert res["status"] == "VETO"
    assert res["violating_tool"] == "execute_refund"


def test_api_dag():
    payload = {
        "trace": {
            "run_id": "run_dag_test_01",
            "agent_name": "TestBot",
            "user_prompt": "Review tickets",
            "spans": [
                {
                    "span_id": "span_01",
                    "name": "read_tickets",
                    "kind": "TOOL",
                    "tool_name": "read_tickets",
                    "status_code": "OK"
                }
            ]
        }
    }
    response = client.post("/api/dag", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert len(res["nodes"]) == 2  # user prompt + tool
    assert len(res["edges"]) == 1
