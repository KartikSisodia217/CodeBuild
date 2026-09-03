"""
Unit Tests for AgentVeto Deterministic Policy Engine
Owner: Policy & Evidence Engineer (Member 4)
"""

import json
import os
from agentveto.contracts.schemas import (
    TrajectoryData,
    StateDiff,
    SecurityVerdict,

    OpenInferenceSpan,
    SpanKind,
)
from agentveto.evaluator.policy_engine import evaluate_trace


def load_sample_trace(filename: str) -> TrajectoryData:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    file_path = os.path.join(base_dir, "examples", "sample_traces", filename)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return TrajectoryData(**data)


def test_zero_click_echoleak_triggers_critical_veto():
    """Verify that indirect prompt injection leading to execute_refund is strictly VETOED."""
    trace = load_sample_trace("zero_click_echoleak.json")
    result = evaluate_trace(trace)

    assert result.status == SecurityVerdict.VETO
    assert result.violating_tool == "execute_refund"
    assert result.injection_source_span_id == "span_tool_read_tickets_001"
    assert "Indirect Prompt Injection" in result.reason
    assert result.latency_ms < 50.0


def test_benign_support_flow_passes():
    """Verify that a standard support ticket without sink tools receives a PASS."""
    trace = load_sample_trace("benign_support_flow.json")
    result = evaluate_trace(trace)

    assert result.status == SecurityVerdict.PASS
    assert result.violating_span_id is None
    assert result.violating_tool is None
    assert "All security invariants verified" in result.reason


def test_data_exfiltration_triggers_critical_veto():
    """Verify that leaked API keys in outbound webhook parameters trigger a DLP VETO."""
    trace = load_sample_trace("data_exfiltration.json")
    result = evaluate_trace(trace)

    assert result.status == SecurityVerdict.VETO
    assert result.threat_category == "MCP10: Sensitive Data Exfiltration"
    assert "Data Exfiltration" in result.reason


def test_cascading_failure_triggers_warning():
    """Verify that repetitive 404 tool calls trigger a WARN for retry storms."""
    trace = load_sample_trace("cascading_failure.json")
    result = evaluate_trace(trace)

    assert result.status == SecurityVerdict.VETO
    assert result.threat_category == "ASI08: Cascading Tool Loops & Retry Storms"
    assert "Cascading Tool Loop" in result.reason


def test_state_diff_unauthorized_mutation_veto():
    """Verify that unexpected backend state mutations trigger a hard VETO."""
    trace = TrajectoryData(
        agent_name="TestAgent",
        user_prompt="Check order status",
        spans=[
            OpenInferenceSpan(
                name="read_order",
                kind=SpanKind.TOOL,
                tool_name="read_order",
                status_code="OK"
            )
        ]
    )
    state_diff = StateDiff(
        run_id=trace.run_id,
        before={"database_records": 100},
        after={"database_records": 0},
        diff_keys=["database_records"],
        unauthorized_changes=["Database truncated from 100 to 0 records"],
        state_mutated=True
    )

    result = evaluate_trace(trace, state=state_diff)
    assert result.status == SecurityVerdict.VETO
    assert "State Invariant Violation" in result.reason
