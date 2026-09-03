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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
