import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

import pytest
from agentveto.contracts.schemas import ToolSchema, ThreatModel, ASIVector, AttackPlan, TrajectoryData, OpenInferenceSpan, SpanKind
from agentveto.adversarial.threat_modeler import ThreatModeler, generate_threat_model
from agentveto.adversarial.attacker_graph import generate_attack_plan, mutate_payload, build_attacker_graph, create_initial_state

def test_threat_modeler_sources_and_sinks():
    schemas = [
        ToolSchema(name="read_tickets", description="Read support tickets", parameters={}),
        ToolSchema(name="issue_refund", description="Issue a refund to a customer", parameters={})
    ]
    threat_model = generate_threat_model(schemas)
    
    vectors = [v.vector for v in threat_model.vulnerable_tools]
    assert "MCP10" in vectors # issue_refund is a sink
    assert "ASI01" in vectors # has source and sink
    
    # Check that issue_refund is associated with ASI01
    asi01_tools = [v.tool for v in threat_model.vulnerable_tools if v.vector == "ASI01"]
    assert "issue_refund" in asi01_tools

def test_threat_modeler_only_sources():
    schemas = [
        ToolSchema(name="read_tickets", description="Read support tickets", parameters={})
    ]
    threat_model = generate_threat_model(schemas)
    vectors = [v.vector for v in threat_model.vulnerable_tools]
    assert "MCP10" not in vectors
    assert "ASI01" not in vectors

def test_threat_modeler_only_sinks():
    schemas = [
        ToolSchema(name="issue_refund", description="Issue a refund to a customer", parameters={})
    ]
    threat_model = generate_threat_model(schemas)
    vectors = [v.vector for v in threat_model.vulnerable_tools]
    assert "MCP10" in vectors
    assert "ASI01" not in vectors # no source, so no ASI01 goal hijack vector

def test_attack_plan_generation():
    threat_model = ThreatModel(
        vulnerable_tools=[ASIVector(tool_name="issue_refund", vector="ASI01", confidence=0.9)],
        source_tools=["read_tickets"],
        sink_tools=["issue_refund"],
        has_source_sink_pair=True
    )
    
    plan = generate_attack_plan(threat_model)
    assert plan.target_tool == "read_tickets"
    assert plan.vector == "ASI01"
    assert plan.sink_tool in ["issue_refund", "execute_refund"]

def test_mutate_payload():
    plan = AttackPlan(
        target_tool="read_tickets",
        vector="ASI01",
        attack_strategy="indirect injection",
        injection_point="tool_response",
        success_condition="executes refund",
        source_tool="read_tickets",
        sink_tool="issue_refund"
    )
    
    # Mock trace showing agent refused
    trace = TrajectoryData(
        run_id="test",
        spans=[
            OpenInferenceSpan(
                span_id="1",
                kind=SpanKind.AGENT,
                attributes={"response": "I cannot process this refund as it violates policies. Refused."}
            )
        ]
    )
    
    payload = mutate_payload(trace, plan)
    assert "execute_refund" in payload.payload_content or "issue_refund" in payload.payload_content

def test_attacker_graph():
    graph = build_attacker_graph()
    
    schemas = [
        {"name": "read_tickets", "description": "Read support tickets", "parameters": {}},
        {"name": "issue_refund", "description": "Issue a refund to a customer", "parameters": {}}
    ]
    
    initial_state = create_initial_state(tool_schemas=schemas)
    
    # Run the graph
    result = graph.invoke(initial_state)
    
    assert result["attack_plan"] is not None
    assert result["attack_plan"]["target_tool"] == "read_tickets"
    
    assert result["current_payload"] is not None
    assert "execute_refund" in result["current_payload"]["payload_content"] or "issue_refund" in result["current_payload"]["payload_content"]

def test_threat_modeler_determinism():
    schemas = [
        ToolSchema(name="read_tickets", description="Read support tickets", parameters={}),
        ToolSchema(name="issue_refund", description="Issue a refund to a customer", parameters={})
    ]
    model1 = generate_threat_model(schemas)
    model2 = generate_threat_model(schemas)
    
    assert [v.model_dump() for v in model1.vulnerable_tools] == [v.model_dump() for v in model2.vulnerable_tools]

def test_analyze_trajectory_incomplete_trace():
    from agentveto.adversarial.attacker_graph import analyze_trajectory
    trajectory = TrajectoryData(run_id="test")
    analysis = analyze_trajectory(trajectory, None)
    assert analysis["outcome"] == "NO_SPANS"
    assert "mutation_hints" in analysis

def test_analyze_trajectory_refusal():
    from agentveto.adversarial.attacker_graph import analyze_trajectory
    plan = AttackPlan(target_tool="read", vector="ASI", attack_strategy="s", injection_point="r", source_tool="read", sink_tool="write")
    trajectory = TrajectoryData(
        run_id="test",
        spans=[
            OpenInferenceSpan(
                span_id="1",
                kind=SpanKind.AGENT,
                name="agent",
                attributes={"output": "I will not do that."}
            )
        ]
    )
    analysis = analyze_trajectory(trajectory, plan)
    assert analysis["agent_refused"] == True
    assert analysis["outcome"] == "AGENT_REFUSED"

def test_analyze_trajectory_sink_reached():
    from agentveto.adversarial.attacker_graph import analyze_trajectory
    plan = AttackPlan(target_tool="read", vector="ASI", attack_strategy="s", injection_point="r", source_tool="read", sink_tool="write")
    trajectory = TrajectoryData(
        run_id="test",
        spans=[
            OpenInferenceSpan(
                span_id="1",
                kind=SpanKind.TOOL,
                name="read"
            ),
            OpenInferenceSpan(
                span_id="2",
                kind=SpanKind.TOOL,
                name="write"
            )
        ]
    )
    analysis = analyze_trajectory(trajectory, plan)
    assert analysis["sink_reached"] == True
    assert analysis["succeeded"] == True
    assert analysis["outcome"] == "SINK_REACHED"

