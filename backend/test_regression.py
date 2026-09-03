import pytest
from fastapi.testclient import TestClient
from main import app
import tempfile
import zipfile
import os
from unittest.mock import patch

client = TestClient(app)

def create_zip(name, files):
    zip_path = os.path.join(tempfile.gettempdir(), name)
    with zipfile.ZipFile(zip_path, 'w') as zf:
        for filename, content in files.items():
            zf.writestr(filename, content)
    return zip_path

@patch('agentveto.subprocess_runner.subprocess.run')
def test_legal_ai_is_not_agentic(mock_run):
    # Legal.ai uses langgraph for state, but has no agents or config
    files = {
        "app.py": "import langgraph\nprint('just a rag app')"
    }
    zip_path = create_zip("Legal.ai.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("Legal.ai.zip", f, "application/zip")})
    manifest = res.json()
    assert manifest["agentic"] is False
    
    scan_res = client.post("/api/scan", json={"project_manifest": manifest})
    assert scan_res.json()["status"] == "not_agentic"
    assert scan_res.json()["scenario_details"]["evaluation"]["status"] == "NOT_AGENTIC"
    
    mock_run.assert_not_called()

@patch('agentveto.subprocess_runner.subprocess.run')
def test_agentic_langgraph_no_entrypoint(mock_run):
    # Agentic codebase but no config yaml
    files = {
        "agent.py": "from langchain import agents\nimport langgraph\n"
    }
    zip_path = create_zip("NoEntrypoint.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("NoEntrypoint.zip", f, "application/zip")})
    manifest = res.json()
    assert manifest["agentic"] is True
    assert manifest["integration_type"] == "langgraph"
    assert manifest["entrypoint"] is None
    
    scan_res = client.post("/api/scan", json={"project_manifest": manifest})
    assert scan_res.json()["status"] == "unsafe_to_execute"
    assert scan_res.json()["scenario_details"]["evaluation"]["status"] == "UNSUPPORTED_ENTRYPOINT"
    
    mock_run.assert_not_called()

@patch('agentveto.subprocess_runner.subprocess.run')
def test_real_langgraph_fixture(mock_run):
    # Config is present, so it has an entrypoint and is agentic
    files = {
        "app.py": "import langgraph\n",
        "agentveto.yaml": "runtime:\n  adapter: langgraph\n  entrypoint: app:graph"
    }
    zip_path = create_zip("RealAgent.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("RealAgent.zip", f, "application/zip")})
    manifest = res.json()
    assert manifest["agentic"] is True
    assert manifest["integration_type"] == "langgraph"
    assert manifest["entrypoint"] == "app:graph"
    
    # We mock the worker subprocess
    import json
    mock_run.return_value.returncode = 0
    # Simulate worker writing out.json
    mock_run.return_value.returncode = 1
    mock_run.return_value.stderr = "worker failed"
    
    # We will just expect it to call subprocess and fail to find out.json (EXECUTION_FAILED)
    # But that's enough to prove the runtime WAS called.
    scan_res = client.post("/api/scan", json={"project_manifest": manifest})
    assert mock_run.called
    assert scan_res.json()["scenario_details"]["evaluation"]["status"] == "EXECUTION_FAILED"
