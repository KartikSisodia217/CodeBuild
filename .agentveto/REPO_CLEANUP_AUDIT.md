# Repository Cleanup Audit

## A. Production Code
- backend/main.py
- backend/agentveto/ (core logic, ingestion, adapters, telemtry, sandbox, adversarial)
- frontend/src/ (React application)
- README.md, requirements.txt, pytest.ini, etc.

## B. Tests
- tests/ (All unit and integration tests)
- backend/test_regression.py

## C. Fixtures/Demo Assets
- tests/fixtures/langgraph_test_project/
- examples/sample_traces/
- examples/zero_click_echoleak/

## D. Obsolete Files
- files_list.txt (temporary generated file)
- test_comm_dir/ (temporary environment directory)
- legal_dummy/ (temporary test dummy script directory)
- config.json, test_spec.json (temporary testing configs)
- Legal.ai.zip (uploaded dummy asset at root level)

## E. Temporary Repair Scripts
Deleted the following scripts:
- rewrite_main.py, rewrite_main_final.py, rewrite_scan.py, rewrite_adapter.py
- fix.py, fix_adapter.py, fix_adapter_syntax.py, fix_all_tests.py, fix_api_tests.py, fix_api_tests_2.py
- fix_app_jsx.py, fix_fixture.py, fix_frontend.py, fix_frontend2.py, fix_http_tests.py, fix_indent.py
- fix_init.py, fix_interceptor.py, fix_langgraph_adapter.py, fix_main.py, fix_main_404.py, fix_main_careful.py
- fix_main_clean.py, fix_main_fixture.py, fix_main_ingest.py, fix_policy.py, fix_progress.py, fix_regression.py
- fix_runoverview.py, fix_runtime.py, fix_runtime2.py, fix_scan.py, fix_scanresult.py, fix_subprocess.py
- fix_subprocess_test.py, fix_test_api.py, fix_test_api2.py, fix_test_hardening.py, fix_test_logic.py
- fix_test_logic_2.py, fix_yaml.py
- update_main.py, run_benign.py, print_ledger_result.py, test_dummy_gen.py
- test_import.py, test_interceptor.py, test_interceptor2.py, test_interceptor3.py, test_interceptor4.py
- test_isolated.py, test_isolated_venv.py, test_isolated_venv2.py, test_namespace.py, test_namespace2.py
- test_script.py, test_venv_path.py, test_venv_syspath.py, test_worker.py, test_api_scan.py, test_list.txt
- backend/patch_test.py, backend/patch_discovery.py
- out.json, mock_spec.json

## F. Hardcoded Project Logic
- Verified NO special casing for external project discovery. The `analyze_project` uses generic `ProjectManifest` properties (`manifest.entrypoint`). 

## G. Legal.ai Specific Logic
- Verified no hardcoding in the runtime outside of specific fallback checks in `test_regression.py`, `test_reevaluation_isolation.py`, and `test_upload_fallback.py` to assert correct non-agentic reporting (`supported=False, agentic=False`).

## H. LedgerAI Specific Logic
- Removed LedgerAI hardcoded references across production logic except for comment notes indicating bug bypasses (e.g., `subprocess_runner.py` bypassing API key logger bug). Assertions checked in `test_regression.py` and `test_reevaluation_isolation.py` appropriately.

## I. Demo-Scenario Specific Logic
- Demo scenarios (`zero_click_echoleak`, `benign_support_flow`) are strictly routed as explicit fixtures with fallback control in `backend/main.py`. External dynamic uploads DO NOT fall back to these fixtures.
- Exploit markers (`read_tickets`, `execute_refund`, `999`) exist only in `tests/fixtures/`, tests directories, and `frontend/` UI default selections. Not in the core threat modeler.

## J. Generated/Cache Artifacts
- Removed all generated `backend/agentveto/ingestion/workspaces/*` cache dirs resulting from previous test ZIP extraction.
- Removed `backend/agentveto/telemetry/traces.db`.
- Removed `__pycache__` globally.

