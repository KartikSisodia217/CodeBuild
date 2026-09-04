import yaml
import os
import re
from pathlib import Path
from typing import Optional, Dict, Any

def parse_project_config(project_dir: str) -> Optional[Dict[str, Any]]:
    candidates = [".agentveto/config.yaml", "agentveto.yaml"]
    for cand in candidates:
        path = os.path.join(project_dir, cand)
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    raw = yaml.safe_load(f) or {}
                config = raw.get("agentveto", raw)
                adapter = config.get("adapter") or (config.get("runtime") or {}).get("adapter")
                entrypoint = config.get("entrypoint") or (config.get("runtime") or {}).get("entrypoint")
                if entrypoint is not None and (not isinstance(entrypoint, str) or not re.fullmatch(r"[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*:[A-Za-z_]\w*", entrypoint)):
                    return {"invalid_entrypoint": True}
                return {"adapter": adapter, "entrypoint": entrypoint, "execution": config.get("execution", {})}
            except Exception:
                pass
    return None
