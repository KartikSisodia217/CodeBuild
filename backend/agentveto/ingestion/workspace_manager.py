import os
import uuid
import tempfile
import shutil
from pathlib import Path
from agentveto.contracts.schemas import ProjectWorkspace

WORKSPACES_DIR = Path(__file__).parent / "workspaces"

# Simple in-memory registry for now, could be sqlite.
_workspaces = {}

def create_workspace(source_type: str, repository: str = None, revision: str = None) -> ProjectWorkspace:
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    workspace_path = WORKSPACES_DIR / project_id
    workspace_path.mkdir(parents=True, exist_ok=True)
    
    workspace = ProjectWorkspace(
        project_id=project_id,
        source_type=source_type,
        repository=repository,
        revision=revision,
        workspace_path=str(workspace_path)
    )
    _workspaces[project_id] = workspace
    return workspace

def get_workspace(project_id: str) -> ProjectWorkspace:
    return _workspaces.get(project_id)
