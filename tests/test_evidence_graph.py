"""
Unit Tests for AgentVeto Evidence DAG Generator (Member 4)
Verifies:
1. Valid generation of React Flow compatible Evidence DAG.
2. Proper node styling (Veto Sink, Injection Source, LLM Reasoning, User Prompt).
3. Correct edge linking and animated tainted edges.
"""

import json
import os
from agentveto.schemas import TrajectoryData, EvaluationStatus
from agentveto.evaluator.policy_engine import evaluate_trace
from agentveto.registry.evidence_graph import EvidenceGraphBuilder


def test_evidence_dag_generation():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "examples", "sample_traces", "zero_click_echoleak.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    trace = TrajectoryData(**data)

    builder = EvidenceGraphBuilder()
    eval_result = evaluate_trace(trace)
    dag = builder.generate_dag(trace, eval_result)

    assert dag.run_id == trace.run_id
    assert dag.agent_name == "CustomerSupportRefundAgent"
    assert len(dag.nodes) == len(trace.spans) + 1  # Spans + Initial User Prompt Node
    assert len(dag.edges) == len(trace.spans)

    # Check node types
    node_types = [n.type for n in dag.nodes]
    assert "user_prompt" in node_types
    assert "injection_source" in node_types
    assert "veto_sink" in node_types
    assert "llm_reasoning" in node_types

    # Verify VETO node data
    veto_nodes = [n for n in dag.nodes if n.type == "veto_sink"]
    assert len(veto_nodes) == 1
    assert veto_nodes[0].data.name == "execute_refund"
    assert veto_nodes[0].data.is_vetoed is True

    # Verify edge animation on tainted path
    animated_edges = [e for e in dag.edges if e.animated]
    assert len(animated_edges) > 0
