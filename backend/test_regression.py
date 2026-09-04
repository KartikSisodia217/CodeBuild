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

@patch('agentveto.core.execution_runtime.run_external_project')
def test_framework_only_project_a(mock_run):
    """A. Framework-only project & E. Framework-only cannot become READY & F. NOT_AGENTIC cannot reach runtime"""
    files = {
        "app.py": "import langgraph\n",
        "agentveto.yaml": "runtime:\n  adapter: langgraph\n  entrypoint: app:graph"
    }
    zip_path = create_zip("FrameworkOnly.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("FrameworkOnly.zip", f, "application/zip")})
    manifest = res.json()
    
    assert manifest["agentic"] is False
    assert manifest["integration_type"] == "langgraph"
    
    scan_res = client.post("/api/scan", json={"project_manifest": manifest})
    scan_data = scan_res.json()
    
    assert scan_data["status"] == "NOT_AGENTIC"
    mock_run.assert_not_called()

@patch('agentveto.core.execution_runtime.run_external_project')
def test_genuine_langgraph_agent_b(mock_run):
    """B. Genuine LangGraph agent"""
    files = {
        "app.py": "from langgraph.prebuilt import create_react_agent\nimport langgraph\nagent = create_react_agent()\n",
        "agentveto.yaml": "runtime:\n  adapter: langgraph\n  entrypoint: app:agent"
    }
    zip_path = create_zip("GenuineAgent.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("GenuineAgent.zip", f, "application/zip")})
    manifest = res.json()
    
    assert manifest["agentic"] is True
    assert manifest["integration_type"] == "langgraph"

@patch('agentveto.core.execution_runtime.run_external_project')
def test_ledgerai_source_patterns_c(mock_run):
    """C. LedgerAI source patterns"""
    files = {
        "agent.py": "from langgraph.graph import StateGraph\nclass PartnerAgent(BaseAgent):\n  pass\n",
        "agentveto.yaml": "runtime:\n  adapter: langgraph\n  entrypoint: agent:graph"
    }
    zip_path = create_zip("LedgerAIPattern.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("LedgerAIPattern.zip", f, "application/zip")})
    manifest = res.json()
    
    assert manifest["agentic"] is True
    assert manifest["integration_type"] == "langgraph"

@patch('agentveto.core.execution_runtime.run_external_project')
def test_legalai_representative_source_d(mock_run):
    """D. Legal.ai representative source"""
    files = {
        "rag.py": "from langgraph.graph import StateGraph, START, END\nclass AgentState(TypedDict):\n  messages: list\n"
    }
    zip_path = create_zip("LegalAIPattern.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("LegalAIPattern.zip", f, "application/zip")})
    manifest = res.json()
    
    assert manifest["agentic"] is False

@patch('agentveto.core.execution_runtime.run_external_project')
def test_unsupported_agent_g(mock_run):
    """G. Unsupported agent"""
    files = {
        "app.py": "import autogen\nagent = autogen.ConversableAgent()\n"
    }
    zip_path = create_zip("UnsupportedAgent.zip", files)
    
    with open(zip_path, "rb") as f:
        res = client.post("/api/projects/analyze", files={"file": ("UnsupportedAgent.zip", f, "application/zip")})
    manifest = res.json()
    
    assert manifest["agentic"] is True
    assert manifest["integration_type"] == "autogen"
    assert manifest["supported"] is False
    
    scan_res = client.post("/api/scan", json={"project_manifest": manifest})
    scan_data = scan_res.json()
    
    assert scan_data["status"] == "UNSUPPORTED"
    mock_run.assert_not_called()
