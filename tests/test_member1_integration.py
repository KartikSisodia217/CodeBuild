import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

import pytest
from agentveto.contracts.schemas import ToolSchema, InterceptedCall, TrajectoryData, OpenInferenceSpan, SpanKind
from agentveto.adversarial.attacker_graph import create_initial_state, build_attacker_graph
from agentveto.sandbox.mock_generator import SandboxManager
from agentveto.adversarial.threat_modeler import generate_threat_model

def test_member1_vertical_slice():
    # 1. Define schemas
    schemas = [
        ToolSchema(name="read_tickets", description="Reads a support ticket", parameters={}),
        ToolSchema(name="issue_refund", description="Issues a refund", parameters={})
    ]
    schemas_dict = [s.model_dump() for s in schemas]

    # 2. Setup attacker graph
    graph = build_attacker_graph()
    initial_state = create_initial_state(tool_schemas=schemas_dict, max_iterations=2)
    
    # Run first iteration of attacker
    result = graph.invoke(initial_state)

    # 3. Verify Threat Model and Attack Plan were created
    assert result["threat_model"] is not None
    assert result["attack_plan"] is not None
    assert result["attack_plan"]["target_tool"] == "read_tickets"
    assert result["attack_plan"]["sink_tool"] in ["execute_refund", "issue_refund"]

    # 4. Verify Payload
    assert result["current_payload"] is not None
    payload = result["current_payload"]
    assert "payload_content" in payload

    # 5. Integrate with Member 3 Sandbox
    sandbox = SandboxManager(api_key="fake")
    call = InterceptedCall(tool_name="read_tickets", arguments={"ticket_id": 123}, run_id="run1")
    from agentveto.contracts.schemas import AttackPayload
    mock_response = sandbox.generate_mock_response(call, AttackPayload(**payload))
    
    # Verify sandbox response contains payload
    assert payload["payload_content"] in mock_response.data["content"]
    
    # 6. Simulate target agent trace (it refused)
    trace = TrajectoryData(
        run_id="run1",
        spans=[
            OpenInferenceSpan(
                span_id="span1",
                kind=SpanKind.TOOL,
                name="read_tickets",
                status="OK"
            ),
            OpenInferenceSpan(
                span_id="span2",
                kind=SpanKind.AGENT,
                name="Agent",
                attributes={"output": "I will not comply. I am a helpful assistant."}
            )
        ]
    )
    
    # 7. Run next iteration (Mutation)
    state = dict(result)
    state["previous_trace"] = trace.model_dump()
    state["should_continue"] = True

    # Need to manually call mutate_attack and generate_payload since invoke with a modified state might just re-run from start depending on graph setup
    # Actually graph.invoke resumes from where it left off? No, standard invoke starts from entrypoint unless given a state history. 
    # Let's just create a new state with iteration 0 but inject the previous trace?
    # No, LangGraph `StateGraph` `invoke` takes the current state.
    # We can just invoke it again with the updated state dictionary.
    next_result = graph.invoke(state)

    # 8. Verify Mutation
    assert next_result["mutation_analysis"] is not None
    assert next_result["current_payload"] is not None
    # Payload should have mutated
    assert next_result["current_payload"]["payload_content"] != result["current_payload"]["payload_content"]
