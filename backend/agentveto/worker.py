"""JSON IPC worker.  This is the only process allowed to import target code."""
from __future__ import annotations

import json
import sys
from datetime import datetime


def _encode(value):
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    if isinstance(value, datetime):
        return value.isoformat()
    raise TypeError(f"Not JSON serializable: {type(value).__name__}")


def main() -> int:
    if len(sys.argv) != 2:
        return 2
    with open(sys.argv[1], encoding="utf-8") as handle:
        spec = json.load(handle)
    project_dir = spec["project_dir"]
    # Target imports are intentionally delayed until after this worker starts.
    sys.path.insert(0, project_dir)
    if spec["adapter"] != "langgraph":
        return 3
    from agentveto.adapters.langgraph_adapter import LangGraphAdapter
    from agentveto.contracts.schemas import AttackPayload
    adapter = LangGraphAdapter(spec["run_id"], spec["entrypoint"], spec.get("execution_options", {}))
    if spec["mode"] == "discover":
        result = [item.model_dump(mode="json") for item in adapter.discover_tools()]
    else:
        payload = AttackPayload(**spec["payload"]) if spec.get("payload") else None
        result = adapter.run(payload)
    with open(spec["out_path"], "w", encoding="utf-8") as handle:
        json.dump(result, handle, default=_encode)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
