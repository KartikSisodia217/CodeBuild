import os
import json
from pathlib import Path
from agentveto.ingestion.discovery import discover_project
from agentveto.core.execution_runtime import ExecutionRuntime

workspaces_dir = Path("backend/agentveto/ingestion/workspaces")
ledgerai_path = None
for d in workspaces_dir.glob("*/KartikSisodia217-Innovahack_LedgerAI*"):
    if d.is_dir():
        ledgerai_path = str(d)
        break

manifest = discover_project(ledgerai_path)
print("LedgerAI Candidate:", manifest.entrypoint)
runtime = ExecutionRuntime(manifest, ledgerai_path)
result = runtime.execute()
print("LedgerAI Status:", result.status)
if hasattr(result, "error_message") and result.error_message:
    print("LedgerAI Message:", result.error_message)
elif result.metadata.get("message"):
    print("LedgerAI Message:", result.metadata.get("message"))
