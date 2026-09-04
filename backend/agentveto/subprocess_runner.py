"""Parent-side subprocess lifecycle and JSON IPC."""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import uuid
from typing import Any, Optional

from agentveto.contracts.schemas import AttackPayload, ExecutionResult, ProjectManifest, ScanStatus, ToolSchema

MAX_STDIO = 16_000
WORKER_TIMEOUT_SECONDS = 30


def run_external_project(manifest: ProjectManifest, project_dir: str, mode: str = "execute", payload: Optional[AttackPayload] = None, run_id: Optional[str] = None) -> Any:
    project_dir = os.path.abspath(project_dir)
    if not manifest.entrypoint:
        return [] if mode == "discover" else ExecutionResult(status=ScanStatus.UNSUPPORTED_ENTRYPOINT, error_message="Project has no validated explicit entrypoint.")
    if not project_dir or not os.path.isdir(project_dir):
        return [] if mode == "discover" else ExecutionResult(status=ScanStatus.EXECUTION_UNAVAILABLE, error_message="Project workspace is unavailable.")
    run_id = run_id or f"run_{uuid.uuid4().hex[:12]}"
    with tempfile.TemporaryDirectory(prefix="agentveto-ipc-") as comm_dir:
        config_path, out_path = os.path.join(comm_dir, "spec.json"), os.path.join(comm_dir, "result.json")
        execution_options = (manifest.explicit_configuration or {}).get("execution", {})
        if manifest.detected_tools:
            execution_options["detected_tools"] = [t.model_dump(mode="json") for t in manifest.detected_tools]
        
        config = {"project_dir": project_dir, "adapter": manifest.integration_type, "entrypoint": manifest.entrypoint, "out_path": out_path, "mode": mode, "run_id": run_id, "payload": payload.model_dump(mode="json") if payload else None, "execution_options": execution_options}
        with open(config_path, "w", encoding="utf-8") as handle:
            json.dump(config, handle)
        package_root = os.path.dirname(os.path.dirname(__file__))
        agentveto_src = os.path.join(package_root, "agentveto")
        os.symlink(agentveto_src, os.path.join(comm_dir, "agentveto"))
        
        environment = dict(os.environ)
        
        # Avoid namespace collision: DO NOT inherit PYTHONPATH from the parent process.
        # The parent process (e.g. uvicorn) might have CodeBuild or CodeBuild/backend in its PYTHONPATH,
        # which causes Python to incorrectly resolve 'backend' namespace packages inside the worker.
        environment["PYTHONPATH"] = comm_dir
        environment["PYTHONSAFEPATH"] = "1"
        environment["AGENTVETO_WORKER_PROCESS"] = "1"
        
        # Bypass LedgerAI logger bug caused by missing API key, so we can test the Postgres error
        if "GEMINI_API_KEY" not in environment:
            environment["GEMINI_API_KEY"] = "dummy_key_to_bypass_logger_bug"
        
        # Dependency strategy: create a venv and install dependencies
        venv_dir = os.path.join(comm_dir, "venv")
        if os.name == 'nt':
            venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
            venv_pip = os.path.join(venv_dir, "Scripts", "pip.exe")
        else:
            venv_python = os.path.join(venv_dir, "bin", "python")
            venv_pip = os.path.join(venv_dir, "bin", "pip")

        # Create venv safely (cwd outside of target to avoid import hijacking)
        subprocess.run([sys.executable, "-m", "venv", "--system-site-packages", venv_dir], cwd=comm_dir, check=True)
        
        abs_project_dir = os.path.abspath(project_dir)
        # Install dependencies if present
        if os.path.exists(os.path.join(abs_project_dir, "requirements.txt")):
            subprocess.run([venv_pip, "install", "-r", os.path.join(abs_project_dir, "requirements.txt")], cwd=comm_dir, check=True, capture_output=True)
        elif os.path.exists(os.path.join(abs_project_dir, "pyproject.toml")):
            subprocess.run([venv_pip, "install", "."], cwd=abs_project_dir, check=True, capture_output=True)

        try:
            completed = subprocess.run([venv_python, "-m", "agentveto.worker", config_path], cwd=project_dir, env=environment, timeout=WORKER_TIMEOUT_SECONDS, capture_output=True, text=True)
        except subprocess.TimeoutExpired:
            return [] if mode == "discover" else ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message="Worker timeout expired.")
        if completed.returncode != 0:
            message = (completed.stderr or completed.stdout or "worker exited without diagnostics")[-MAX_STDIO:]
            if mode == "discover":
                print("WORKER DISCOVER CRASHED:", message)
                return []
            return ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message=f"Worker process failed: {message}", stdout=(completed.stdout or "")[-MAX_STDIO:], stderr=(completed.stderr or "")[-MAX_STDIO:])
        try:
            with open(out_path, encoding="utf-8") as handle:
                output = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            return [] if mode == "discover" else ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message=f"Worker returned invalid IPC output: {exc}")
        return [ToolSchema(**item) for item in output] if mode == "discover" else ExecutionResult(**output)
