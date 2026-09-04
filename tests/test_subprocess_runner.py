from fastapi.testclient import TestClient
from backend.main import app
from agentveto.contracts.schemas import ProjectManifest, ScanStatus
from agentveto.subprocess_runner import run_external_project
import os
import pytest

def test_unsupported_entrypoint():
    manifest = ProjectManifest(
        project_name="unknown_proj",
        source_type="zip",
        agentic=True,
        supported=True,
        integration_type="langgraph",
        entrypoint=None
    )
    result = run_external_project(manifest, "/tmp")
    assert result.status == ScanStatus.UNSUPPORTED_ENTRYPOINT
    assert "validated explicit entrypoint" in result.error_message
