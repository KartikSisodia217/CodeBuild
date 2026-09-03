"""
FastAPI entry point.
Owner: Nishit (Policy & Evidence Engineer)
"""

from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agentveto.contracts.schemas import (
    TrajectoryData,
    StateDiff,
    EvaluationResult,
    EvidenceDAG,
    PolicyRule,
    EvaluationStatus,
    ProjectManifest,
)
from agentveto.evaluator.policy_engine import evaluate_trace
from agentveto.evaluator.rules import DEFAULT_POLICY_RULES
from agentveto.registry.evidence_graph import generate_dag
from agentveto.registry.yaml_serializer import export_yaml
from agentveto.runtime import list_fixture_scenarios, run_fixture_scenario

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

POLICY_RULES_STORE: List[PolicyRule] = list(DEFAULT_POLICY_RULES)
EVALUATION_METRICS = {
    "total_evaluations": 0,
    "veto_count": 0,
    "pass_count": 0,
    "warn_count": 0,
    "average_latency_ms": 0.0
}


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



# Catalog entries describe available controlled fixtures.  They are not historic production runs
# and the API regenerates the evidence through the real component pipeline on every selection.
SCENARIOS_CATALOG = list_fixture_scenarios()


def _record_evaluation(result: EvaluationResult) -> None:
    """Update only measured scan metrics; scenario preview requests never affect them."""
    previous_total = EVALUATION_METRICS["total_evaluations"]
    previous_average = EVALUATION_METRICS["average_latency_ms"]
    EVALUATION_METRICS["total_evaluations"] = previous_total + 1
    EVALUATION_METRICS["average_latency_ms"] = round(
        ((previous_average * previous_total) + result.latency_ms) / (previous_total + 1),
        3,
    )
    if result.status == EvaluationStatus.CRITICAL_VETO:
        EVALUATION_METRICS["veto_count"] += 1
    elif result.status == EvaluationStatus.PASS:
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


@app.post("/api/dag", response_model=EvidenceDAG)
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


@app.get("/api/scenarios")
def list_scenarios():
    return SCENARIOS_CATALOG


@app.post("/api/scan")
def start_scan_endpoint(req: StartScanRequest):
    if req.project_manifest:
        if not req.project_manifest.agentic:
            details = {
                "scenario_id": f"proj_{req.project_manifest.project_name}",
                "metadata": {
                    "id": f"proj_{req.project_manifest.project_name}",
                    "name": req.project_manifest.project_name,
                    "agent_name": "Unknown",
                },
                "evaluation": {
                    "status": "NOT_AGENTIC",
                    "reason": "No agentic component was detected in this project."
                }
            }
            return {
                "status": "not_agentic",
                "reason": "no_agent_detected",
                "message": "No agentic component was detected in this project.",
                "scenario_details": details
            }
        if not req.project_manifest.supported:
            details = {
                "scenario_id": f"proj_{req.project_manifest.project_name}",
                "metadata": {
                    "id": f"proj_{req.project_manifest.project_name}",
                    "name": req.project_manifest.project_name,
                    "agent_name": req.project_manifest.agents[0].name if req.project_manifest.agents else "Unknown",
                },
                "evaluation": {
                    "status": "UNSUPPORTED",
                    "reason": "Project analyzed, but no supported AgentVeto runtime integration was detected."
                }
            }
            return {
                "status": "unsupported",
                "reason": "no_supported_integration",
                "message": "Project analyzed, but no supported AgentVeto runtime integration was detected.",
                "scenario_details": details
            }
        
        if req.project_manifest.integration_type == "langgraph":
            if req.project_manifest.source_type != "local_fixture":
                details = {
                    "scenario_id": f"proj_{req.project_manifest.project_name}",
                    "metadata": {
                        "id": f"proj_{req.project_manifest.project_name}",
                        "name": req.project_manifest.project_name,
                        "agent_name": "LangGraph Agent",
                    },
                    "evaluation": {
                        "status": "EXECUTION_UNAVAILABLE",
                        "reason": "LangGraph adapter detected, but secure execution environment is required for untrusted projects."
                    }
                }
                return {
                    "status": "unsafe_to_execute",
                    "reason": "secure_runtime_required",
                    "message": "LangGraph adapter detected, but secure execution environment is required for untrusted projects.",
                    "scenario_details": details
                }
            else:
                from agentveto.adapters.langgraph_adapter import run_langgraph_fixture
                details = run_langgraph_fixture(req.project_manifest.repository)
                _record_evaluation(details["evaluation"])
                return {
                    "status": "completed",
                    "scan_id": details["trace"].run_id,
                    "agent_name": req.agent_name,
                    "attack_profile": req.attack_profile,
                    "environment": req.environment,
                    "scenario_details": details
                }
                
        raise HTTPException(
            status_code=501,
            detail="Real runtime execution engine is not yet implemented for uploaded projects."
        )
    else:
        scenario_id = req.scenario_id or "zero_click_echoleak"
        try:
            details = run_fixture_scenario(scenario_id)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown controlled fixture scenario '{scenario_id}'.",
            )
            
    _record_evaluation(details["evaluation"])
    return {
        "status": "completed",
        "scan_id": details["trace"].run_id,
        "agent_name": req.agent_name,
        "attack_profile": req.attack_profile,
        "environment": req.environment,
        "scenario_details": details
    }



@app.get("/api/scenarios/{scenario_id}")
def get_scenario_details(scenario_id: str):
    try:
        return run_fixture_scenario(scenario_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown controlled fixture scenario '{scenario_id}'.",
        )


import tempfile
import shutil
import os
from fastapi import File, UploadFile, Form
from pydantic import BaseModel, HttpUrl
from agentveto.contracts.schemas import ProjectManifest
from agentveto.ingestion.extractor import safe_extract, ExtractionError
from agentveto.ingestion.discovery import discover_project
from agentveto.ingestion.github import fetch_github_repo

class GithubAnalyzeRequest(BaseModel):
    source_type: str = "github"
    repository_url: str

@app.post("/api/projects/analyze/github", response_model=ProjectManifest)
async def analyze_github_project(req: GithubAnalyzeRequest):
    if req.source_type != "github":
        raise HTTPException(status_code=400, detail="Invalid source type.")
        
    temp_dir = tempfile.mkdtemp()
    extract_dir = f"{temp_dir}/extracted"
    os.makedirs(extract_dir, exist_ok=True)
    
    try:
        try:
            repository, revision = fetch_github_repo(req.repository_url, extract_dir)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except ExtractionError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to fetch repository.")
            
        manifest = discover_project(
            extract_dir, 
            project_name=repository.split('/')[-1],
            source_type="github",
            repository=repository,
            revision=revision
        )
        return manifest
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/api/projects/analyze", response_model=ProjectManifest)
async def analyze_project(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
        
    temp_dir = tempfile.mkdtemp()
    zip_path = f"{temp_dir}/uploaded.zip"
    
    try:
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        extract_dir = f"{temp_dir}/extracted"
        try:
            safe_extract(zip_path, extract_dir)
        except ExtractionError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        manifest = discover_project(
            extract_dir, 
            project_name=file.filename,
            source_type="zip"
        )
        return manifest
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
