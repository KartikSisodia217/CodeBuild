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

def analyze_python_file(file_path: Path, relative_path: str) -> tuple[Optional[AgentCandidate], bool, Optional[str], List[str]]:
    try:
        content = file_path.read_text(encoding='utf-8')
        tree = ast.parse(content, filename=str(file_path))
    except Exception:
        return None, False, None, []

    tools = []
    has_agentveto_import = False
    is_agentic = False
    detected_framework = None
    signals = []
    
    agentic_modules = ['smolagents', 'crewai', 'autogen', 'langgraph', 'pydantic_ai']
    agentic_submodules = {
        'langchain': ['agents', 'tools']
    }

    langgraph_framework = False
    langgraph_constructs = set()
    has_agent_class = False
    has_tool_nodes = False

    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.module and 'agentveto' in node.module:
                has_agentveto_import = True
            if node.module:
                if any(m in node.module for m in agentic_modules):
                    if 'langgraph' not in node.module:
                        is_agentic = True
                    for m in agentic_modules:
                        if m in node.module:
                            detected_framework = m
                            if m == 'langgraph':
                                langgraph_framework = True
                            if m != 'langgraph':
                                is_agentic = True
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
                    if 'langgraph' not in alias.name:
                        is_agentic = True
                    for m in agentic_modules:
                        if m in alias.name:
                            detected_framework = m
                            if m == 'langgraph':
                                langgraph_framework = True
                            if m != 'langgraph':
                                is_agentic = True
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
                    signals.append("agentveto.intercept decorator")
                    break
                if is_agentic_decorator(decorator):
                    is_agentic = True
                    is_tool = True
                    signals.append("Tool decorator detected")
            
            if is_tool:
                tools.append(ToolCandidate(
                    name=node.name,
                    source_file=relative_path,
                    line_number=node.lineno
                ))
        elif isinstance(node, ast.ClassDef):
            class_name = node.name.lower()
            is_agent_class = False
            if 'agent' in class_name and 'state' not in class_name:
                is_agent_class = True
                signals.append(f"Agent class detected: {node.name}")
            
            for base in node.bases:
                if isinstance(base, ast.Name):
                    if 'Agent' in base.id and 'State' not in base.id:
                        is_agent_class = True
                        signals.append(f"Base agent subclass detected: {base.id}")
            if is_agent_class:
                has_agent_class = True
                is_agentic = True
        
        elif isinstance(node, ast.Call):
            callee = node.func.id if isinstance(node.func, ast.Name) else (node.func.attr if isinstance(node.func, ast.Attribute) else "")
            
            if callee in {"StateGraph", "MessageGraph", "compile"}:
                langgraph_constructs.add(callee)
            
            if callee in {"create_react_agent", "ToolNode", "bind_tools"}:
                has_tool_nodes = True
                signals.append(f"Agentic construct: {callee}")

    if langgraph_framework:
        if has_tool_nodes or has_agent_class or tools:
            is_agentic = True
        
        if langgraph_constructs:
            signals.append(f"LangGraph structural nodes: {', '.join(langgraph_constructs)}")

    if 'agents' in Path(relative_path).parts or 'agent' in Path(relative_path).parts:
        if 'state' not in relative_path.lower():
            is_agentic = True
            signals.append(f"Agentic directory structure: {relative_path}")

    signals = list(set(signals))

    agent_candidate = None
    if is_agentic or tools or has_agentveto_import:
        agent_candidate = AgentCandidate(
            name=file_path.stem,
            file=relative_path,
            integration="langgraph" if langgraph_framework else "python_interceptor",
            tools=tools
        )
        is_agentic = True
        
    return agent_candidate, is_agentic, detected_framework, signals

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
    project_signals = []
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.py'):
                full_path = Path(root) / file
                relative_path = str(full_path.relative_to(base_path))
                agent_candidate, is_file_agentic, framework, signals = analyze_python_file(full_path, relative_path)
                if agent_candidate:
                    agents.append(agent_candidate)
                if is_file_agentic:
                    project_is_agentic = True
                if framework:
                    detected_project_framework = framework
                project_signals.extend(signals)
    
    manifest.agentic = project_is_agentic
    manifest.agents = agents
    manifest.agentic_signals = list(set(project_signals))
    if detected_project_framework:
        manifest.integration_type = detected_project_framework

    # Configuration selects an adapter only after static evidence establishes
    # that this is an agent. It never turns a RAG-only project into an agent.
    try:
        from agentveto.ingestion.config_parser import parse_project_config
        config = parse_project_config(extract_dir)
    except:
        config = None
        
    if config:
        manifest.explicit_configuration = config
        if config.get("invalid_entrypoint"):
            manifest.errors.append("Invalid AgentVeto entrypoint syntax.")
        elif config.get("adapter"):
            manifest.integration_type = config["adapter"]
            manifest.entrypoint = config.get("entrypoint")

    if not manifest.agentic:
        manifest.supported = False
        manifest.integration_type = manifest.integration_type or ""
        manifest.warnings.append("No static agentic construct was detected.")
    elif manifest.integration_type == "langgraph":
        # LangGraph is supported
        manifest.supported = True
    elif manifest.integration_type:
        manifest.supported = False
        manifest.warnings.append(f"Unsupported agent framework: {manifest.integration_type}.")
    else:
        manifest.supported = False
        manifest.warnings.append("No supported AgentVeto integration detected. Current supported integrations: python_interceptor, langgraph.")
        
    return manifest

if __name__ == "__main__":
    ledger = discover_project("agentveto/ingestion/workspaces/proj_fe6b02e9/KartikSisodia217-Innovahack_LedgerAI-d6dabad")
    legal = discover_project("agentveto/ingestion/workspaces/proj_efbf427a/Legal.ai")
    
    print("LEDGER AI:")
    print("Agentic:", ledger.agentic)
    print("Supported:", ledger.supported)
    print("Signals:", ledger.agentic_signals)
    print("Agents len:", len(ledger.agents))
    
    print("\nLEGAL AI:")
    print("Agentic:", legal.agentic)
    print("Supported:", legal.supported)
    print("Signals:", legal.agentic_signals)
    print("Agents len:", len(legal.agents))
