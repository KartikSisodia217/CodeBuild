"""
AgentVeto Complete Test Runner
Executes all unit and integration test suites for Nishit (Policy & Evidence Engineer):
- Policy Engine & Deterministic Invariant Vetoes
- YAML Regression Serializer & Roundtrip Parsers
- Evidence DAG & React Flow Node/Edge Generation
- FastAPI REST API Endpoints
"""

import sys
import os
import time
import traceback

# Add project root and backend to path
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(root_path, "backend")
if root_path not in sys.path:
    sys.path.insert(0, root_path)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from tests.test_policy_engine import (
    test_zero_click_echoleak_triggers_critical_veto,
    test_benign_support_flow_passes,
    test_data_exfiltration_triggers_critical_veto,
    test_cascading_failure_triggers_warning,
    test_state_diff_unauthorized_mutation_veto
)
from tests.test_yaml_serializer import test_yaml_export_and_parse
from tests.test_evidence_graph import test_evidence_dag_generation
from tests.test_api_endpoints import (
    test_api_health,
    test_api_rules,
    test_api_scenarios_list_and_detail,
    test_api_evaluate,
    test_api_dag
)


def run_test_suite():
    tests = [
        ("Zero-Click EchoLeak Indirect Prompt Injection -> CRITICAL_VETO", test_zero_click_echoleak_triggers_critical_veto),
        ("Benign Customer Support Resolution -> PASS", test_benign_support_flow_passes),
        ("Sensitive API Key Exfiltration (DLP Scan) -> CRITICAL_VETO", test_data_exfiltration_triggers_critical_veto),
        ("Cascading Tool Retry Storm -> WARN", test_cascading_failure_triggers_warning),
        ("State Invariant Unauthorized Mutation -> CRITICAL_VETO", test_state_diff_unauthorized_mutation_veto),
        ("YAML Regression Test Export, Parse & Verify Roundtrip", test_yaml_export_and_parse),
        ("React Flow Evidence DAG Generation & Styling", test_evidence_dag_generation),
        ("FastAPI /api/health Endpoint", test_api_health),
        ("FastAPI /api/rules Security Policies Endpoint", test_api_rules),
        ("FastAPI /api/scenarios & Scenario Details Endpoint", test_api_scenarios_list_and_detail),
        ("FastAPI /api/evaluate Endpoint", test_api_evaluate),
        ("FastAPI /api/dag Endpoint", test_api_dag),
    ]

    print("\n" + "=" * 75)
    print(" [AGENTVETO TEST SUITE] NISHIT: POLICY & EVIDENCE ADJUDICATION ENGINE")
    print("=" * 75)

    passed_count = 0
    failed_count = 0
    start_all = time.time()

    for name, func in tests:
        t0 = time.time()
        try:
            func()
            elapsed = (time.time() - t0) * 1000.0
            print(f"  [PASS] {name:<60} ({elapsed:.2f} ms)")
            passed_count += 1
        except Exception as e:
            elapsed = (time.time() - t0) * 1000.0
            print(f"  [FAIL] {name:<60} ({elapsed:.2f} ms)")
            traceback.print_exc()
            failed_count += 1

    total_time = (time.time() - start_all) * 1000.0
    print("-" * 75)
    print(f" Summary: {passed_count} Passed, {failed_count} Failed | Total Execution Time: {total_time:.2f} ms")
    print("=" * 75 + "\n")

    if failed_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    run_test_suite()
