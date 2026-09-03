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
    if not manifest.entrypoint:
        return [] if mode == "discover" else ExecutionResult(status=ScanStatus.UNSUPPORTED_ENTRYPOINT, error_message="Project has no validated explicit entrypoint.")
    if not project_dir or not os.path.isdir(project_dir):
        return [] if mode == "discover" else ExecutionResult(status=ScanStatus.EXECUTION_UNAVAILABLE, error_message="Project workspace is unavailable.")
    run_id = run_id or f"run_{uuid.uuid4().hex[:12]}"
    with tempfile.TemporaryDirectory(prefix="agentveto-ipc-") as comm_dir:
        config_path, out_path = os.path.join(comm_dir, "spec.json"), os.path.join(comm_dir, "result.json")
        config = {"project_dir": project_dir, "adapter": manifest.integration_type, "entrypoint": manifest.entrypoint, "out_path": out_path, "mode": mode, "run_id": run_id, "payload": payload.model_dump(mode="json") if payload else None, "execution_options": (manifest.explicit_configuration or {}).get("execution", {})}
        with open(config_path, "w", encoding="utf-8") as handle:
            json.dump(config, handle)
        package_root = os.path.dirname(os.path.dirname(__file__))
        environment = dict(os.environ)
        environment["PYTHONPATH"] = package_root + os.pathsep + environment.get("PYTHONPATH", "")
        try:
            completed = subprocess.run([sys.executable, "-m", "agentveto.worker", config_path], cwd=project_dir, env=environment, timeout=WORKER_TIMEOUT_SECONDS, capture_output=True, text=True)
        except subprocess.TimeoutExpired:
            return [] if mode == "discover" else ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message="Worker timeout expired.")
        if completed.returncode != 0:
            message = (completed.stderr or completed.stdout or "worker exited without diagnostics")[-MAX_STDIO:]
            return [] if mode == "discover" else ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message=f"Worker process failed: {message}", stdout=(completed.stdout or "")[-MAX_STDIO:], stderr=(completed.stderr or "")[-MAX_STDIO:])
        try:
            with open(out_path, encoding="utf-8") as handle:
                output = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            return [] if mode == "discover" else ExecutionResult(run_id=run_id, status=ScanStatus.EXECUTION_FAILED, error_message=f"Worker returned invalid IPC output: {exc}")
        return [ToolSchema(**item) for item in output] if mode == "discover" else ExecutionResult(**output)
