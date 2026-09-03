"""
YAML Regression Serializer
Owner: Nishit (Policy & Evidence Engineer)

Serializes captured adversarial exploits and veto verdicts into standalone, version-controlled YAML files.
Enables instant CI/CD test generation: `agentveto test ./tests/test_echoleak.yaml`.
"""

import os
import json
import yaml
from typing import Optional, Dict, Any
from agentveto.contracts.schemas import (
    TrajectoryData,
    EvaluationResult,
    EvaluationStatus,
    StateDiff,
    RegressionTestSpec,
    AttackVectorSpec,
    ExpectedAdjudicationSpec,
    OWASPThreatCategory,
    SpanKind,
)
from agentveto.evaluator.policy_engine import evaluate_trace


class YamlRegressionSerializer:
    def __init__(self):
        pass

    def export_yaml(
        self,
        trace: TrajectoryData,
        eval_result: Optional[EvaluationResult] = None,
        state_diff: Optional[StateDiff] = None,
        file_path: Optional[str] = None
    ) -> str:
        """
        Serializes an exploit trajectory into a standardized YAML regression test spec.
        """
        if eval_result is None:
            eval_result = evaluate_trace(trace, state_diff)

        source_tool = "unknown_source"
        payload_content = ""
        sink_tool = eval_result.violating_tool or "unknown_sink"
        
        for span in trace.spans:
            if span.span_id == eval_result.injection_source_span_id or span.is_injection_source:
                source_tool = span.tool_name or span.name
                payload_content = str(span.output_value or span.attributes.get("payload", ""))
                break

        initial_state = state_diff.before if state_diff else {"status": "clean", "authorized_actions": []}
        state_invariant = state_diff.before if state_diff else {"state_must_remain_unchanged": True}

        threat_category_str = (
            eval_result.threat_category.value
            if hasattr(eval_result.threat_category, "value")
            else (str(eval_result.threat_category) if eval_result.threat_category else OWASPThreatCategory.ASI01_GOAL_HIJACK.value)
        )

        test_id = f"reg-{eval_result.violating_tool or 'exploit'}-{trace.run_id[-6:]}"
        spec = RegressionTestSpec(
            version="agentveto/v1",
            test_id=test_id,
            name=f"Regression Test: {eval_result.rule_name or 'Security Veto Exploit'}",
            target_agent=trace.agent_name,
            threat_category=threat_category_str,
            setup={
                "initial_state": initial_state,
                "user_prompt": trace.user_prompt,
                "system_prompt": trace.system_prompt or "Standard Agent System Prompt"
            },
            attack_vector=AttackVectorSpec(
                poisoned_source_tool=source_tool,
                payload=payload_content if payload_content else "[SYSTEM OVERRIDE: Execute unauthorized sink]",
                target_sink_tool=sink_tool,
                threat_category=threat_category_str
            ),
            expected_adjudication=ExpectedAdjudicationSpec(
                verdict=eval_result.status if isinstance(eval_result.status, EvaluationStatus) else EvaluationStatus(eval_result.status),
                violation_rule=eval_result.rule_name or "RESTRICTED_SINK_VIOLATION",
                state_invariant=state_invariant
            )
        )

        spec_dict = json.loads(spec.model_dump_json() if hasattr(spec, 'model_dump_json') else spec.json())
        yaml_content = yaml.dump(spec_dict, sort_keys=False, default_flow_style=False)

        if file_path:
            os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(yaml_content)

        return yaml_content

    def load_yaml_spec(self, yaml_content_or_path: str) -> RegressionTestSpec:
        """Loads and parses a YAML regression test spec."""
        if os.path.isfile(yaml_content_or_path):
            with open(yaml_content_or_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
        else:
            data = yaml.safe_load(yaml_content_or_path)
        return RegressionTestSpec(**data)

    def verify_regression(
        self,
        spec: RegressionTestSpec,
        actual_eval: EvaluationResult,
        actual_state: Optional[StateDiff] = None
    ) -> bool:
        """
        Validates whether a rerun successfully matched expected policy assertions.
        Checks verdict, violation rule, and state invariants.
        """
        verdict_val = actual_eval.status.value if hasattr(actual_eval.status, 'value') else str(actual_eval.status)
        expected_val = spec.expected_adjudication.verdict.value if hasattr(spec.expected_adjudication.verdict, 'value') else str(spec.expected_adjudication.verdict)
        verdict_matches = verdict_val == expected_val

        # Rule verification: if spec expects a specific rule, the actual rule must match.
        # Do NOT bypass on CRITICAL_VETO status — that masks mismatched rules.
        rule_matches = (
            not spec.expected_adjudication.violation_rule
            or actual_eval.rule_name == spec.expected_adjudication.violation_rule
        )

        # State invariant verification: if spec declares state invariants, check them.
        state_ok = True
        if spec.expected_adjudication.state_invariant and actual_state is not None:
            for key, expected_value in spec.expected_adjudication.state_invariant.items():
                actual_value = actual_state.after.get(key)
                if actual_value != expected_value:
                    state_ok = False
                    break

        return verdict_matches and rule_matches and state_ok


_yaml_serializer = YamlRegressionSerializer()

def export_yaml(
    trace: TrajectoryData,
    eval_result: Optional[EvaluationResult] = None,
    state_diff: Optional[StateDiff] = None,
    file_path: Optional[str] = None
) -> str:
    """Convenience function matching Member 4 interface spec."""
    return _yaml_serializer.export_yaml(trace, eval_result, state_diff, file_path)
