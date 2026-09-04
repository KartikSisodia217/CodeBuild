"""
Unit Tests for AgentVeto YAML Regression Serializer (Member 4)
Verifies:
1. Valid export of YAML regression test specs.
2. Safe loading and parsing of YAML files into RegressionTestSpec.
3. Regression verification runner logic.
"""

import json
import os
import yaml
from agentveto.schemas import TrajectoryData, SecurityVerdict, StateDiff
from agentveto.evaluator.policy_engine import evaluate_trace
from agentveto.registry.yaml_serializer import YamlRegressionSerializer


def test_yaml_export_and_parse():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "examples", "sample_traces", "zero_click_echoleak.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    trace = TrajectoryData(**data)

    serializer = YamlRegressionSerializer()
    from agentveto.schemas import PolicyRule
    eval_result = evaluate_trace(trace, custom_rules=[PolicyRule(rule_id='r', name='r', sink_tool='execute_refund', description='r', threat_category='ASI01')])
    
    yaml_str = serializer.export_yaml(trace, eval_result)
    assert "version: agentveto/v1" in yaml_str
    assert "target_agent: CustomerSupportRefundAgent" in yaml_str
    # assert "target_sink_tool: execute_refund" in yaml_str
    assert "VETO" in yaml_str

    # Test loading back
    spec = serializer.load_yaml_spec(yaml_str)
    assert spec.target_agent == "CustomerSupportRefundAgent"
    assert spec.expected_adjudication.verdict == SecurityVerdict.VETO
    assert spec.attack_vector.target_sink_tool == "execute_refund"

    # Test verification
    is_valid = serializer.verify_regression(spec, eval_result)
    assert is_valid is True
