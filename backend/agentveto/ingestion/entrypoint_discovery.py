import ast
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class EntrypointCandidate:
    module: str
    object_name: str
    source_file: str
    kind: str
    confidence: float
    evidence: List[str]
    invocation_style: str
    input_hint: Optional[Dict[str, Any]] = None
    dependencies: List[str] = None

class LangGraphEntrypointVisitor(ast.NodeVisitor):
    def __init__(self, module_name: str, source_file: str):
        self.module_name = module_name
        self.source_file = source_file
        self.candidates: List[EntrypointCandidate] = []

    def visit_Assign(self, node: ast.Assign):
        # Check for graph = workflow.compile()
        if isinstance(node.value, ast.Call):
            func = node.value.func
            if isinstance(func, ast.Attribute) and func.attr == 'compile':
                # Ignore re.compile
                if isinstance(func.value, ast.Name) and func.value.id == 're':
                    pass
                else:
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            self.candidates.append(EntrypointCandidate(
                                module=self.module_name,
                                object_name=target.id,
                                source_file=self.source_file,
                                kind="compiled_graph",
                                confidence=0.9,
                                evidence=["Variable assigned from .compile()"],
                                invocation_style="invoke"
                            ))
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # Check if function invokes a graph
        # or has name like run_workflow, execute_graph, etc.
        has_invoke = False
        evidence = []
        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                if isinstance(child.func, ast.Attribute):
                    if child.func.attr in ['invoke', 'ainvoke']:
                        has_invoke = True
                        evidence.append(f"Function calls .{child.func.attr}()")
        if has_invoke:
            confidence = 0.85 if ('workflow' in node.name.lower() or 'graph' in node.name.lower()) else 0.8
            self.candidates.append(EntrypointCandidate(
                module=self.module_name,
                object_name=node.name,
                source_file=self.source_file,
                kind="graph_invoker",
                confidence=confidence,
                evidence=evidence,
                invocation_style="call"
            ))
        elif 'workflow' in node.name.lower() or 'graph' in node.name.lower():
            self.candidates.append(EntrypointCandidate(
                module=self.module_name,
                object_name=node.name,
                source_file=self.source_file,
                kind="orchestrator",
                confidence=0.5,
                evidence=["Function name suggests workflow/graph orchestration"],
                invocation_style="call"
            ))
            
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.visit_FunctionDef(node)


def discover_entrypoints(directory: str) -> List[EntrypointCandidate]:
    base_path = Path(directory)
    candidates = []
    for root, _, files in base_path.walk():
        for file in files:
            if file.endswith('.py'):
                full_path = root / file
                try:
                    content = full_path.read_text(encoding='utf-8')
                    tree = ast.parse(content, filename=str(full_path))
                    relative_path = full_path.relative_to(base_path)
                    module_name = str(relative_path).replace('/', '.').replace('\\', '.')[:-3]
                    visitor = LangGraphEntrypointVisitor(module_name, str(relative_path))
                    visitor.visit(tree)
                    candidates.extend(visitor.candidates)
                except Exception:
                    pass
    
    # Rank candidates deterministically
    def rank_key(c: EntrypointCandidate):
        kind_score = {"compiled_graph": 3, "graph_invoker": 2, "orchestrator": 1}.get(c.kind, 0)
        return (c.confidence, kind_score, c.module, c.object_name)
        
    candidates.sort(key=rank_key, reverse=True)
    return candidates
