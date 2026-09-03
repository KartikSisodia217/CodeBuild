"""
FastAPI entry point.
Owner: Nishit (Policy & Evidence Engineer)
"""

from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
import tempfile
import shutil
import os
from pathlib import Path

from agentveto.contracts.schemas import (
    ScanResult,
    TrajectoryData,
    StateDiff,
    EvaluationResult,
    Evidence,
    PolicyRule,
    SecurityVerdict,
    ProjectManifest,
    ScanStatus
)
from agentveto.evaluator.policy_engine import evaluate_trace
from agentveto.evaluator.rules import DEFAULT_POLICY_RULES
from agentveto.registry.evidence_graph import generate_dag
from agentveto.registry.yaml_serializer import export_yaml
from agentveto.runtime import list_fixture_scenarios
from agentveto.ingestion.extractor import safe_extract, ExtractionError
from agentveto.ingestion.discovery import discover_project
from agentveto.ingestion.github import fetch_github_repo
from agentveto.ingestion.workspace_manager import create_workspace, get_workspace
from agentveto.core.execution_runtime import ExecutionRuntime


app = FastAPI(
    title="AgentVeto API",
    description="The Continuous Adversarial Simulation Platform & CI/CD Adjudication Gate for Autonomous AI Agents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluateRequest(BaseModel):
    trace: TrajectoryData
    state_diff: Optional[StateDiff] = None
    custom_rules: Optional[List[PolicyRule]] = None

class DAGRequest(BaseModel):
    trace: TrajectoryData
    evaluation: Optional[EvaluationResult] = None

class ExportYamlRequest(BaseModel):
    trace: TrajectoryData
    evaluation: Optional[EvaluationResult] = None
    state_diff: Optional[StateDiff] = None

class StartScanRequest(BaseModel):
    agent_name: str = "Customer Support Agent"
    attack_profile: str = "Adaptive Adversarial Testing (ASI01)"
    environment: str = "Synthetic Sandbox"
    scenario_id: Optional[str] = "zero_click_echoleak"
    project_manifest: Optional[ProjectManifest] = None

class GithubAnalyzeRequest(BaseModel):
    source_type: str = "github"
    repository_url: str


POLICY_RULES_STORE: List[PolicyRule] = list(DEFAULT_POLICY_RULES)

EVALUATION_METRICS = {
    "total_evaluations": 0,
    "pass_count": 0,
    "veto_count": 0,
    "warn_count": 0,
    "average_latency_ms": 0.0,
}
SCAN_RUNS: Dict[str, ScanResult] = {}

SCENARIOS_CATALOG = list_fixture_scenarios()


def _record_evaluation(result: EvaluationResult) -> None:
    previous_total = EVALUATION_METRICS["total_evaluations"]
    previous_average = EVALUATION_METRICS["average_latency_ms"]
    EVALUATION_METRICS["total_evaluations"] = previous_total + 1
    EVALUATION_METRICS["average_latency_ms"] = round(
        ((previous_average * previous_total) + result.latency_ms) / (previous_total + 1),
        3,
    )
    if result.status == SecurityVerdict.VETO:
        EVALUATION_METRICS["veto_count"] += 1
    elif result.status == SecurityVerdict.PASS:
        EVALUATION_METRICS["pass_count"] += 1
    else:
        EVALUATION_METRICS["warn_count"] += 1


@app.get("/")
def read_root():
    return {
        "name": "AgentVeto Adjudication Engine",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "agentveto-policy-engine"}


@app.get("/api/rules", response_model=List[PolicyRule])
def get_policy_rules():
    return POLICY_RULES_STORE


@app.post("/api/rules", response_model=PolicyRule)
def add_policy_rule(rule: PolicyRule):
    POLICY_RULES_STORE.append(rule)
    return rule


@app.post("/api/evaluate", response_model=EvaluationResult)
def evaluate_endpoint(req: EvaluateRequest):
    result = evaluate_trace(
        trace=req.trace,
        state=req.state_diff,
        custom_rules=req.custom_rules or POLICY_RULES_STORE
    )
    _record_evaluation(result)
    return result


@app.post("/api/dag", response_model=Evidence)
def dag_endpoint(req: DAGRequest):
    dag = generate_dag(trace=req.trace, eval_result=req.evaluation)
    return dag


@app.post("/api/export-yaml")
def export_yaml_endpoint(req: ExportYamlRequest):
    yaml_str = export_yaml(
        trace=req.trace,
        eval_result=req.evaluation,
        state_diff=req.state_diff
    )
    return {"yaml_content": yaml_str}


@app.get("/api/metrics")
def get_metrics():
    return EVALUATION_METRICS


def _controlled_manifest(scenario_id: str) -> tuple[ProjectManifest, str]:
    workspace = str(Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "langgraph_test_project")
    entrypoint = "agent:graph" if scenario_id == "zero_click_echoleak" else "benign_agent:graph"
    from agentveto.ingestion.config_parser import parse_project_config
    config = parse_project_config(workspace) or {"execution": {}}
    config["execution"] = dict(config.get("execution", {}), agent_name=scenario_id)
    return ProjectManifest(project_name=scenario_id, source_type="controlled", repository="controlled-langgraph", entrypoint=entrypoint, agentic=True, supported=True, integration_type="langgraph", explicit_configuration=config), workspace


@app.get("/api/scenarios")
def list_scenarios():
    return SCENARIOS_CATALOG


@app.post("/api/scan", response_model=ScanResult)
def start_scan_endpoint(req: StartScanRequest):
    if req.project_manifest:
        if not req.project_manifest.agentic:
            return ScanResult(
                status=ScanStatus.NOT_AGENTIC,
                metadata={"reason": "no_agent_detected", "message": "No agentic component was detected in this project."},
                project_manifest=req.project_manifest
            )
        if not req.project_manifest.supported:
            return ScanResult(
                status=ScanStatus.UNSUPPORTED,
                metadata={"reason": "no_supported_integration", "message": "Project analyzed, but no supported AgentVeto runtime integration was detected."},
                project_manifest=req.project_manifest
            )
        
        if req.project_manifest.integration_type == "langgraph":
            workspace = get_workspace(req.project_manifest.project_id)
            workspace_path = workspace.workspace_path if workspace else req.project_manifest.project_name
            
            runtime = ExecutionRuntime(req.project_manifest, workspace_path)
            scan_result = runtime.execute()
            
            if scan_result.evaluation:
                _record_evaluation(scan_result.evaluation)
            SCAN_RUNS[scan_result.run_id] = scan_result
            return scan_result

        return ScanResult(
            status=ScanStatus.UNSUPPORTED,
            metadata={"message": "Only configured LangGraph projects are supported by the canonical runtime."},
            project_manifest=req.project_manifest
        )
    else:
        scenario_id = req.scenario_id or "zero_click_echoleak"
        
        if scenario_id not in ["zero_click_echoleak", "benign_support_flow"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown controlled fixture scenario '{scenario_id}'."
            )
            
        manifest, workspace_path = _controlled_manifest(scenario_id)
        runtime = ExecutionRuntime(manifest, workspace_path)
        scan_result = runtime.execute()
        
        if scan_result.evaluation:
            _record_evaluation(scan_result.evaluation)
            yaml_str = export_yaml(scan_result.trajectory, scan_result.evaluation, scan_result.state_diff)
            scan_result.metadata["yaml_content"] = yaml_str
        SCAN_RUNS[scan_result.run_id] = scan_result
        return scan_result

@app.get("/api/scenarios/{scenario_id}")
def get_scenario_details(scenario_id: str):
    if scenario_id not in ["zero_click_echoleak", "benign_support_flow"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown controlled fixture scenario '{scenario_id}'."
        )
        
    manifest, workspace_path = _controlled_manifest(scenario_id)
    runtime = ExecutionRuntime(manifest, workspace_path)
    scan_result = runtime.execute()
    
    if scan_result.evaluation:
        yaml_str = export_yaml(scan_result.trajectory, scan_result.evaluation, scan_result.state_diff)
        scan_result.metadata["yaml_content"] = yaml_str
    SCAN_RUNS[scan_result.run_id] = scan_result
    return scan_result.model_dump()


@app.get("/api/scan/{run_id}", response_model=ScanResult)
def get_scan(run_id: str):
    if run_id not in SCAN_RUNS:
        raise HTTPException(status_code=404, detail="Unknown scan run.")
    return SCAN_RUNS[run_id]


@app.post("/api/scan/{run_id}/re-evaluate", response_model=ScanResult)
def reevaluate_scan(run_id: str):
    result = SCAN_RUNS.get(run_id)
    if not result or result.status != ScanStatus.COMPLETED or not result.trajectory or not result.trajectory.spans:
        raise HTTPException(status_code=409, detail="Only completed runs with observed trajectories can be re-evaluated.")
    rules = [PolicyRule(rule_id="RULE-REEVALUATE", name="OBSERVED_HIGH_RISK_SINK_WITHOUT_AUTHORIZATION", sink_tool=result.attack_plan.sink_tool or "", description="Use the original run's schema-derived sink.")]
    evaluation = evaluate_trace(result.trajectory, result.state_diff, rules)
    result.evaluation = evaluation
    result.verdict = evaluation.status
    result.evidence = generate_dag(result.trajectory, evaluation) if evaluation.status else None
    return result


@app.post("/api/projects/analyze/github", response_model=ProjectManifest)
async def analyze_github_project(req: GithubAnalyzeRequest):
    if req.source_type != "github":
        raise HTTPException(status_code=400, detail="Invalid source type.")
        
    workspace = create_workspace(source_type="github", repository=req.repository_url)
    
    try:
        repository, revision = fetch_github_repo(req.repository_url, workspace.workspace_path)
        workspace.repository = repository
        workspace.revision = revision
    except Exception as e:
        shutil.rmtree(workspace.workspace_path, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))
        
    manifest = discover_project(
        workspace.workspace_path, 
        project_name=repository.split("/")[-1],
        source_type="github",
        repository=repository,
        revision=revision
    )
    manifest.project_id = workspace.project_id
    return manifest


@app.post("/api/projects/analyze", response_model=ProjectManifest)
async def analyze_project(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
        
    workspace = create_workspace(source_type="zip", repository=file.filename)
    zip_path = os.path.join(workspace.workspace_path, "uploaded.zip")
    
    try:
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        try:
            safe_extract(zip_path, workspace.workspace_path)
        except ExtractionError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        manifest = discover_project(
            workspace.workspace_path, 
            project_name=file.filename,
            source_type="zip"
        )
        manifest.project_id = workspace.project_id
        return manifest
    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
