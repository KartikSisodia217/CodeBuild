import re
with open("backend/agentveto/subprocess_runner.py", "r") as f:
    content = f.read()

replacement = """import subprocess
import json
import tempfile
import os
import sys
from typing import Optional, Any

from agentveto.contracts.schemas import ProjectManifest, ExecutionResult, ScanStatus, AttackPayload, ToolSchema

def run_external_project(manifest: ProjectManifest, project_dir: str, mode: str = "execute", payload: Optional[AttackPayload] = None) -> Any:
    if not manifest.entrypoint:
        if mode == "discover": return []
        return ExecutionResult(
            status=ScanStatus.UNSUPPORTED_ENTRYPOINT,
            error_message="Project has an ambiguous or unspecified entrypoint. Please provide an agentveto.yaml config."
        )

    with tempfile.TemporaryDirectory() as comm_dir:
        config_path = os.path.join(comm_dir, "config.json")
        out_path = os.path.join(comm_dir, "out.json")
        
        with open(config_path, "w") as f:
            json.dump({
                "project_dir": project_dir,
                "integration_type": manifest.integration_type,
                "entrypoint": manifest.entrypoint,
                "out_path": out_path,
                "mode": mode,
                "payload": payload.model_dump() if payload else None
            }, f)
            
        worker_script = os.path.join(os.path.dirname(__file__), "worker.py")
        
        try:
            result = subprocess.run(
                [sys.executable, worker_script, config_path],
                cwd=project_dir,
                timeout=60,
                capture_output=True,
                text=True
            )
        except subprocess.TimeoutExpired:
            if mode == "discover": return []
            return ExecutionResult(status=ScanStatus.EXECUTION_FAILED, error_message="Timeout expired while executing external agent.")
            
        if result.returncode != 0:
            if mode == "discover": return []
            return ExecutionResult(status=ScanStatus.EXECUTION_FAILED, error_message=f"Agent process failed: {result.stderr.strip()[-500:]}")
            
        if not os.path.exists(out_path):
            if mode == "discover": return []
            return ExecutionResult(status=ScanStatus.EXECUTION_FAILED, error_message=f"Agent process completed but returned no evidence payload. Stdout: {result.stdout}")
            
        try:
            with open(out_path, "r") as f:
                worker_output = json.load(f)
            
            if mode == "discover":
                return [ToolSchema(**t) for t in worker_output]
            else:
                return ExecutionResult(**worker_output)
                
        except json.JSONDecodeError:
            if mode == "discover": return []
            return ExecutionResult(status=ScanStatus.EXECUTION_FAILED, error_message="Failed to parse evidence payload from agent process.")
"""

content = re.sub(r'import subprocess.*?def _error_response', replacement + '\n\ndef _error_response', content, flags=re.DOTALL)

with open("backend/agentveto/subprocess_runner.py", "w") as f:
    f.write(content)
