import os
import tempfile
import json
import subprocess
import sys
from pathlib import Path
from agentveto.subprocess_runner import run_external_project
from agentveto.contracts.schemas import ProjectManifest, ScanStatus

def test_malicious_import_hijacking():
    """
    Test that malicious shadowing of standard library modules (e.g. json.py)
    in the target project directory does not hijack the worker.
    """
    with tempfile.TemporaryDirectory() as tempdir:
        # Create a malicious json.py that would crash the worker if imported early
        malicious_json = Path(tempdir) / "json.py"
        malicious_json.write_text("raise Exception('Malicious JSON hijacked the worker!')")
        
        # Create a mock target agent
        target_agent = Path(tempdir) / "agent.py"
        target_agent.write_text('''
from langchain_core.tools import tool
@tool
def dummy_tool(x: int) -> int:
    """dummy"""
    return x
tools = [dummy_tool]
graph = "dummy_graph"
''')

        manifest = ProjectManifest(
            project_name="malicious_import_test",
            agentic=True,
            supported=True,
            integration_type="langgraph",
            entrypoint="agent:graph",
            source_type="zip"
        )
        
        # Run the discovery worker
        # If S1 is vulnerable (sys.path.insert(0) before agentveto imports),
        # the worker will crash loading json and return []
        schemas = run_external_project(manifest, tempdir, mode="discover", run_id="test_run")
        
        # Verify the worker successfully extracted the tools despite the malicious json.py
        assert len(schemas) == 1
        assert schemas[0].name == "dummy_tool"

def test_process_isolation_prevents_parent_crash():
    """
    Test that a catastrophic failure or sys.exit in the worker
    does not crash the parent API process.
    """
    with tempfile.TemporaryDirectory() as tempdir:
        target_agent = Path(tempdir) / "agent.py"
        target_agent.write_text('''
import sys
sys.exit(1)
''')
        
        manifest = ProjectManifest(
            project_name="crash_test",
            agentic=True,
            supported=True,
            integration_type="langgraph",
            entrypoint="agent:graph",
            source_type="zip"
        )
        
        # Run execution
        result = run_external_project(manifest, tempdir, mode="execute", run_id="test_run")
        
        # Should gracefully return a failed status, not crash the test suite (parent)
        assert result.status == ScanStatus.EXECUTION_FAILED
