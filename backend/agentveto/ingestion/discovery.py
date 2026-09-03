import ast
import os
from pathlib import Path
from typing import List, Optional

from agentveto.contracts.schemas import ProjectManifest, AgentCandidate, ToolCandidate

def is_intercept_decorator(decorator: ast.expr) -> bool:
    if isinstance(decorator, ast.Name) and decorator.id == 'intercept':
        return True
    if isinstance(decorator, ast.Attribute) and decorator.attr == 'intercept':
        return True
    if isinstance(decorator, ast.Call):
        return is_intercept_decorator(decorator.func)
    return False

def analyze_python_file(file_path: Path, relative_path: str) -> Optional[AgentCandidate]:
    try:
        content = file_path.read_text(encoding='utf-8')
        tree = ast.parse(content, filename=str(file_path))
    except Exception:
        # Ignore files that cannot be parsed
        return None

    tools = []
    has_agentveto_import = False

    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.module and 'agentveto' in node.module:
                has_agentveto_import = True
        elif isinstance(node, ast.Import):
            for alias in node.names:
                if 'agentveto' in alias.name:
                    has_agentveto_import = True
        
        elif isinstance(node, ast.FunctionDef):
            is_tool = False
            for decorator in node.decorator_list:
                if is_intercept_decorator(decorator):
                    is_tool = True
                    break
            
            if is_tool:
                tools.append(ToolCandidate(
                    name=node.name,
                    source_file=relative_path,
                    line_number=node.lineno
                ))
    
    if tools or has_agentveto_import:
        return AgentCandidate(
            name=file_path.stem,
            file=relative_path,
            integration="python_interceptor",
            tools=tools
        )
    return None

def discover_project(extract_dir: str, project_name: str = "Uploaded Project") -> ProjectManifest:
    manifest = ProjectManifest(project_name=project_name)
    base_path = Path(extract_dir)
    
    agents = []
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.py'):
                full_path = Path(root) / file
                relative_path = str(full_path.relative_to(base_path))
                agent_candidate = analyze_python_file(full_path, relative_path)
                if agent_candidate:
                    agents.append(agent_candidate)
    
    manifest.agents = agents
    if agents:
        manifest.supported = True
        manifest.integration_type = "python_interceptor"
    else:
        manifest.supported = False
        manifest.warnings.append("No supported AgentVeto integration detected. Current supported integration: Python agents using the AgentVeto interceptor.")
        
    return manifest
