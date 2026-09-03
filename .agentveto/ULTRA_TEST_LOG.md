# AgentVeto Ultra Test Log

## Final Baseline Run (Post-V1 Execution)

Command: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=backend python3 -m pytest -q -p no:cacheprovider tests/`

```text
.....................................................                    [100%]
53 passed in 1.72s
```

## Added Test Coverage

1. `test_regression_verification_rejects_wrong_rule`
2. `test_regression_verification_accepts_matching_rule`
3. `test_regression_state_invariant_checked`
4. `test_unknown_scenario_raises_key_error`
5. `test_fixture_functions_never_execute_body`
6. `test_dag_has_edge_labels_for_veto_scenario`
7. `test_dag_uses_parent_id_edges`
8. `test_state_diff_returns_field_paths_not_categories`
9. `test_evaluator_tracks_first_injection_source`
10. `test_pass_scenario_has_no_taint_labels`

## Fixes Verified
- [x] Assertions fixed for regression verification (`yaml_serializer.py`)
- [x] Date deprecations resolved (`schemas.py`)
- [x] State Diff extraction fixed (`state_manager.py`)
- [x] DeepDiff parsing bugs fixed (`SetOrdered` vs `set`)
- [x] Injection source correctly attributes to first observed tainted span (`policy_engine.py`)
- [x] Memory leak in sandbox state manager resolved.
- [x] Node.js remains missing (Frontend build blocked).

## Phase 3: Project Ingestion

### Execution
```bash
PYTHONPATH=backend python3 -m pytest tests/test_project_ingestion.py
```

### Coverage Added
- `test_valid_project_zip_with_interceptor`: Validates AST extraction without execution.
- `test_unsupported_project`: Validates rejection of non-AgentVeto files.
- `test_malicious_archive_traversal`: Protects against `../../` attacks.
- `test_absolute_path_archive`: Protects against absolute paths.
- `test_oversized_file`: Validates ZIP bomb protections.
- `tests/test_upload_fallback.py`: Validates that uploaded unsupported projects or non-agentic projects (like Legal.ai) correctly return `UNSUPPORTED` or `NOT_AGENTIC` statuses without executing a synthetic fake PASS trace.

### Results
- Passed: 68/68 backend tests. All legacy demos and endpoints continue to operate perfectly. False-positive upload bypass was successfully removed.
