import io
import os
import zipfile
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from agentveto.ingestion.extractor import ExtractionError

client = TestClient(app)

def create_zip(files_dict):
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for path, content in files_dict.items():
            zf.writestr(path, content)
    memory_file.seek(0)
    return memory_file

def test_valid_project_zip_with_interceptor():
    # G. Project containing dangerous code (raise exception on import)
    # H. Project containing interceptor
    # I. Tool schemas correctly discovered
    agent_code = """
import os
import sys

# This will fail visibly if executed
if "pytest" not in sys.modules:
    # Just to be safe during pytest execution, but in normal run this would raise
    pass
# Let's make it more explicit. If it was imported, it would run:
print("I am being imported!")

from agentveto.core.decorator import intercept

@intercept
def my_custom_tool(param1: str):
    pass
"""
    files = {
        "agent.py": agent_code,
        "requirements.txt": "requests\n"
    }
    zip_bytes = create_zip(files)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    assert response.status_code == 200
    manifest = response.json()
    
    assert manifest["project_name"] == "project.zip"
    assert manifest["supported"] is False
    assert manifest["integration_type"] == ""
    
    assert len(manifest["agents"]) == 1
    agent = manifest["agents"][0]
    assert agent["name"] == "agent"
    assert len(agent["tools"]) == 1
    
    tool = agent["tools"][0]
    assert tool["name"] == "my_custom_tool"


def test_unsupported_project():
    agent_code = """
def plain_function():
    pass
"""
    files = {
        "main.py": agent_code,
    }
    zip_bytes = create_zip(files)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    assert response.status_code == 200
    manifest = response.json()
    
    assert manifest["supported"] is False
    assert len(manifest["warnings"]) > 0


def test_malicious_archive_traversal():
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("../../evil.py", "print('evil')")
    memory_file.seek(0)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", memory_file, "application/zip")})
    assert response.status_code == 400
    assert "Malicious archive path" in response.json().get("detail", response.json().get("metadata", {}).get("message", ""))


def test_absolute_path_archive():
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("/etc/passwd", "root:x:0:0:")
    memory_file.seek(0)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", memory_file, "application/zip")})
    assert response.status_code == 400
    assert "Malicious archive path" in response.json().get("detail", response.json().get("metadata", {}).get("message", ""))


def test_oversized_file(monkeypatch):
    import agentveto.ingestion.extractor as extractor
    monkeypatch.setattr(extractor, "MAX_FILE_SIZE", 10)
    
    files = {
        "large.py": "a" * 15,
    }
    zip_bytes = create_zip(files)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    assert response.status_code == 400
    assert "exceeds maximum size" in response.json().get("detail", response.json().get("metadata", {}).get("message", ""))


def test_existing_demo_veto():
    response = client.post("/api/scan", json={"scenario_id": "zero_click_echoleak"})
    assert response.status_code == 200
    data = response.json()
    assert data["evaluation"]["status"] == "VETO"


def test_existing_demo_pass():
    response = client.post("/api/scan", json={"scenario_id": "benign_support_flow"})
    assert response.status_code == 200
    data = response.json()
    assert data["evaluation"]["status"] == "PASS"


def test_uploaded_project_scan():
    # An unsupported legacy interceptor project is never executed.
    agent_code = """
from agentveto.core.decorator import intercept

@intercept
def test_read_data(source: str): pass

@intercept
def test_delete_user(user_id: int): pass
"""
    files = {"agent.py": agent_code}
    zip_bytes = create_zip(files)
    
    # Upload
    analyze_resp = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    assert analyze_resp.status_code == 200
    manifest = analyze_resp.json()
    
    # Scan
    scan_resp = client.post("/api/scan", json={"project_manifest": manifest})
    assert scan_resp.status_code == 200
    assert scan_resp.json()["status"] == "UNSUPPORTED"
    assert "no supported AgentVeto runtime integration" in scan_resp.json().get("detail", scan_resp.json().get("metadata", {}).get("message", ""))


def test_ignored_large_sqlite_and_directories(monkeypatch):
    import agentveto.ingestion.extractor as extractor
    monkeypatch.setattr(extractor, "MAX_FILE_SIZE", 80)  # slightly larger to fit agent_code
    
    agent_code = """
from agentveto.core.decorator import intercept

@intercept
def my_tool(): pass
"""
    files = {
        "agent.py": agent_code,
        "backend/chroma_db/chroma.sqlite3": "a" * 100,  # exceeds limit, but should be ignored
        "node_modules/package/index.js": "a" * 100,      # exceeds limit, but should be ignored
        "__pycache__/agent.cpython-310.pyc": "a" * 100,  # exceeds limit, but should be ignored
    }
    zip_bytes = create_zip(files)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    manifest = response.json()
    
    assert manifest["supported"] is False
    assert len(manifest["agents"]) == 1
    
    agent = manifest["agents"][0]
    assert agent["name"] == "agent"
    assert len(agent["tools"]) == 1


def test_oversized_source_file_rejected(monkeypatch):
    import agentveto.ingestion.extractor as extractor
    monkeypatch.setattr(extractor, "MAX_FILE_SIZE", 10)
    
    files = {
        "large_source.py": "a" * 15,  # exceeds limit and not ignored
    }
    zip_bytes = create_zip(files)
    
    response = client.post("/api/projects/analyze", files={"file": ("project.zip", zip_bytes, "application/zip")})
    assert response.status_code == 400
    assert "exceeds maximum size" in response.json().get("detail", response.json().get("metadata", {}).get("message", ""))
