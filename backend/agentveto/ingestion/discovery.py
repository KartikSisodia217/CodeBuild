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

def is_agentic_decorator(decorator: ast.expr) -> bool:
    name = None
    if isinstance(decorator, ast.Name):
        name = decorator.id
    elif isinstance(decorator, ast.Attribute):
        name = decorator.attr
    elif isinstance(decorator, ast.Call):
        return is_agentic_decorator(decorator.func)
    
    if name and name in ['tool', 'action']:
        return True
    return False

def analyze_python_file(file_path: Path, relative_path: str) -> tuple[Optional[AgentCandidate], bool, Optional[str]]:
    try:
        content = file_path.read_text(encoding='utf-8')
        tree = ast.parse(content, filename=str(file_path))
    except Exception:
        return None, False, None

    tools = []
    has_agentveto_import = False
    is_agentic = False
    detected_framework = None
    
    # Strict agentic module prefixes
    agentic_modules = ['smolagents', 'crewai', 'autogen', 'langgraph', 'pydantic_ai']
    
    # Modules that indicate agentic behavior only if specific submodules are imported
    agentic_submodules = {
        'langchain': ['agents', 'tools']
    }

    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.module and 'agentveto' in node.module:
                has_agentveto_import = True
            if node.module:
                if any(m in node.module for m in agentic_modules):
                    is_agentic = True
                    for m in agentic_modules:
                        if m in node.module:
                            detected_framework = m
                for root_mod, sub_mods in agentic_submodules.items():
                    if root_mod in node.module and any(sub in node.module for sub in sub_mods):
                        is_agentic = True
                        detected_framework = root_mod
                    if root_mod in node.module:
                        for alias in node.names:
                            if any(sub in alias.name for sub in sub_mods):
                                is_agentic = True
                                detected_framework = root_mod
        elif isinstance(node, ast.Import):
            for alias in node.names:
                if 'agentveto' in alias.name:
                    has_agentveto_import = True
                if any(m in alias.name for m in agentic_modules):
                    is_agentic = True
                    for m in agentic_modules:
                        if m in alias.name:
                            detected_framework = m
                for root_mod, sub_mods in agentic_submodules.items():
                    if root_mod in alias.name and any(sub in alias.name for sub in sub_mods):
                        is_agentic = True
                        detected_framework = root_mod
        
        elif isinstance(node, ast.FunctionDef):
            is_tool = False
            for decorator in node.decorator_list:
                if is_intercept_decorator(decorator):
                    is_tool = True
                    is_agentic = True
                    break
                if is_agentic_decorator(decorator):
                    is_agentic = True
            
            if is_tool:
                tools.append(ToolCandidate(
                    name=node.name,
                    source_file=relative_path,
                    line_number=node.lineno
                ))
    
    agent_candidate = None
    if tools or has_agentveto_import:
        agent_candidate = AgentCandidate(
            name=file_path.stem,
            file=relative_path,
            integration="python_interceptor",
            tools=tools
        )
        is_agentic = True
        
    return agent_candidate, is_agentic, detected_framework

def discover_project(
    extract_dir: str, 
    project_name: str = "Uploaded Project",
    source_type: str = "zip",
    repository: Optional[str] = None,
    revision: Optional[str] = None
) -> ProjectManifest:
    manifest = ProjectManifest(
        project_name=project_name,
        source_type=source_type,
        repository=repository,
        revision=revision
    )
    base_path = Path(extract_dir)
    
    agents = []
    project_is_agentic = False
    detected_project_framework = None
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.py'):
                full_path = Path(root) / file
                relative_path = str(full_path.relative_to(base_path))
                agent_candidate, is_file_agentic, framework = analyze_python_file(full_path, relative_path)
                if agent_candidate:
                    agents.append(agent_candidate)
                if is_file_agentic:
                    project_is_agentic = True
                if framework:
                    detected_project_framework = framework
    
    manifest.agentic = project_is_agentic
    manifest.agents = agents
    if detected_project_framework:
        manifest.integration_type = detected_project_framework
    
    if manifest.integration_type and "langgraph" in manifest.integration_type:
        # LangGraph is supported
        manifest.supported = True
    elif agents:
        manifest.supported = True
        manifest.integration_type = "python_interceptor"
    else:
        manifest.supported = False
        manifest.warnings.append("No supported AgentVeto integration detected. Current supported integrations: python_interceptor, langgraph.")
        
    return manifest
