"""
AgentVeto Command-Line Interface (CLI)
Enables local and CI/CD execution of AgentVeto evaluations and regression test suites.

Usage:
  python -m agentveto.cli evaluate <trace_json_path>
  python -m agentveto.cli test <regression_yaml_path>
  python -m agentveto.cli export-yaml <trace_json_path> [--output <output_yaml_path>]
"""

import sys
import os
import json
import argparse
from typing import Optional

from agentveto.schemas import TrajectoryData, SecurityVerdict, StateDiff
from agentveto.evaluator.policy_engine import evaluate_trace
from agentveto.registry.yaml_serializer import YamlRegressionSerializer, export_yaml


def evaluate_command(trace_path: str):
    """Evaluates an OpenInference trace JSON file."""
    if not os.path.exists(trace_path):
        print(f"[-] Error: Trace file not found: {trace_path}", file=sys.stderr)
        sys.exit(1)

    with open(trace_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    trace = TrajectoryData(**data)
    result = evaluate_trace(trace)

    print("\n" + "=" * 65)
    print(" [AGENTVETO DETERMINISTIC ADJUDICATION REPORT]")
    print("=" * 65)
    print(f" Run ID:          {result.run_id}")
    print(f" Target Agent:    {trace.agent_name}")
    print(f" Evaluation ID:   {result.evaluation_id}")
    print(f" Total Spans:     {len(trace.spans)}")
    print(f" Execution Time:  {result.latency_ms} ms")
    print("-" * 65)

    if result.status == "VETO":
        print(f" [!] VERDICT:      CRITICAL_VETO (BUILD FAILED / DEPLOYMENT BLOCKED)")
        print(f" Violating Tool:  {result.violating_tool}")
        print(f" Violating Span:  {result.violating_span_id}")
        if result.injection_source_span_id:
            print(f" Injection Point: {result.injection_source_span_id}")
        if result.rule_name:
            print(f" Policy Rule:     {result.rule_name}")
        print(f" Reason:          {result.reason}")
        print("=" * 65 + "\n")
        sys.exit(1)
    elif result.status == SecurityVerdict.WARN:
        print(f" [?] VERDICT:      WARNING (FLAGGED FOR HUMAN REVIEW)")
        print(f" Reason:          {result.reason}")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print(f" [+] VERDICT:      PASS (ALL SECURITY INVARIANTS SATISFIED)")
        print(f" Reason:          {result.reason}")
        print("=" * 65 + "\n")
        sys.exit(0)


def test_command(yaml_path: str):
    """Runs a YAML regression test spec against the deterministic engine."""
    serializer = YamlRegressionSerializer()
    if not os.path.exists(yaml_path):
        print(f"[-] Error: Regression file not found: {yaml_path}", file=sys.stderr)
        sys.exit(1)

    spec = serializer.load_yaml_spec(yaml_path)
    print("\n" + "=" * 65)
    print(f" [AGENTVETO REGRESSION RUNNER] Test: {spec.name}")
    print("=" * 65)
    print(f" Test ID:         {spec.test_id}")
    print(f" Target Agent:    {spec.target_agent}")
    print(f" Threat Category: {spec.threat_category}")
    print(f" Expected Status: {spec.expected_adjudication.verdict.value}")
    print(f" Expected Rule:   {spec.expected_adjudication.violation_rule}")
    print("-" * 65)

    # Construct synthetic trajectory to verify the attack assertion
    from agentveto.schemas import OpenInferenceSpan, SpanKind
    synthetic_trace = TrajectoryData(
        run_id=f"replay_{spec.test_id}",
        agent_name=spec.target_agent,
        user_prompt=spec.setup.get("user_prompt", "Replay user prompt"),
        spans=[
            OpenInferenceSpan(
                span_id="span_poisoned_source_replay",
                name=spec.attack_vector.poisoned_source_tool,
                kind=SpanKind.TOOL,
                tool_name=spec.attack_vector.poisoned_source_tool,
                output_value=spec.attack_vector.payload,
                is_injection_source=True,
                status_code="OK"
            ),
            OpenInferenceSpan(
                span_id="span_violating_sink_replay",
                name=spec.attack_vector.target_sink_tool,
                kind=SpanKind.TOOL,
                tool_name=spec.attack_vector.target_sink_tool,
                is_unauthorized_sink=True,
                status_code="ERROR"
            )
        ]
    )

    actual_eval = evaluate_trace(synthetic_trace)
    passed = serializer.verify_regression(spec, actual_eval)

    if passed:
        print(f" [PASS] REGRESSION VERIFIED: Exploit successfully intercepted and vetoed as expected.")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print(f" [FAIL] REGRESSION FAILED: Expected {spec.expected_adjudication.verdict}, got {actual_eval.status}.")
        print("=" * 65 + "\n")
        sys.exit(1)


def export_yaml_command(trace_path: str, output_path: Optional[str] = None):
    """Exports a trace file into a YAML regression test spec."""
    if not os.path.exists(trace_path):
        print(f"[-] Error: Trace file not found: {trace_path}", file=sys.stderr)
        sys.exit(1)

    with open(trace_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    trace = TrajectoryData(**data)
    eval_result = evaluate_trace(trace)
    
    yaml_content = export_yaml(trace, eval_result, file_path=output_path)
    
    if output_path:
        print(f"[+] Successfully exported regression test to: {output_path}")
    else:
        print(yaml_content)


def main():
    parser = argparse.ArgumentParser(
        prog="agentveto",
        description="AgentVeto CLI: Continuous Adversarial Simulation & Deterministic CI/CD Gate for AI Agents"
    )
    subparsers = parser.add_subparsers(dest="command", help="Subcommand to execute")

    eval_parser = subparsers.add_parser("evaluate", help="Evaluate a trace JSON file")
    eval_parser.add_argument("trace_path", type=str, help="Path to OpenInference trace JSON")

    test_parser = subparsers.add_parser("test", help="Run a YAML regression test spec")
    test_parser.add_argument("yaml_path", type=str, help="Path to YAML regression test spec")

    export_parser = subparsers.add_parser("export-yaml", help="Export trace to a regression YAML test")
    export_parser.add_argument("trace_path", type=str, help="Path to OpenInference trace JSON")
    export_parser.add_argument("--output", "-o", type=str, default=None, help="Output file path for YAML")

    args = parser.parse_args()

    if args.command == "evaluate":
        evaluate_command(args.trace_path)
    elif args.command == "test":
        test_command(args.yaml_path)
    elif args.command == "export-yaml":
        export_yaml_command(args.trace_path, args.output)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
