# AgentVeto V1 Findings

## P0-001 - The demo scan does not execute the advertised architecture

- **Problem:** `/api/scan` returns static scenario details while the frontend animates a
  pre-written attack sequence. The threat modeler, attacker, sandbox, decorator, telemetry,
  policy engine, DAG, and regression serializer are not connected by the UI scan action.
- **Evidence:** `backend/main.py` returns `get_scenario_details()` from `start_scan_endpoint`;
  `frontend/src/components/ScanProgress.jsx` derives its steps and verdict from the selected
  scenario ID.
- **Impact:** The demo can be mistaken for fabricated attack evidence, which undermines the
  core product claim.
- **Proposed fix:** Add a deterministic-fixture vertical runner that invokes the existing
  architecture components and returns its generated result, with explicit provenance metadata.
- **Status:** In progress.

## P1-001 - Critical-policy taint provenance is inferred too broadly

- **Problem:** The evaluator records any known source tool as an injection source before
  confirming malicious content. A later unrelated unauthorized sink can be described as an
  indirect-injection chain.
- **Evidence:** `PolicyEngine.evaluate_trace()` sets `injection_source_span_id` for entries in
  `KNOWN_DATA_SOURCES` before the injection indicator check.
- **Impact:** Incorrect causal evidence and avoidable false explanations.
- **Proposed fix:** Separate observed injection, taint propagation, sink reachability, and
  authorization evidence; never mutate input trace records while evaluating.
- **Status:** Planned.

## P1-002 - Telemetry is not reconstructable by execution run

- **Problem:** SQLite spans omit a run ID, span ID, parent link, timing, and status; the storage
  API returns unrelated one-span trajectories rather than a correlated execution trace.
- **Impact:** Weak evidence integrity and untrustworthy multi-run investigation.
- **Proposed fix:** Store a normalized, versioned span record and expose per-run retrieval.
- **Status:** Planned.

## P1-003 - Regression replay self-fulfills the expected VETO

- **Problem:** The CLI builds a violating source/sink trace from the expected YAML result instead
  of rerunning a controlled scenario and comparing the independently generated output.
- **Impact:** A regression can pass without proving the implementation still blocks the behavior.
- **Proposed fix:** Use the fixture runner for supported regression scenarios and explicitly
  identify structural-only legacy regression specs.
- **Status:** Planned.

## P2-001 - Shared contracts carry duplicated/legacy terminology

- **Problem:** Duplicate span/status enums and aliases obscure canonical fields, and timestamps
  use deprecated naive UTC factories.
- **Impact:** Contract drift and warning noise.
- **Proposed fix:** Consolidate compatible aliases incrementally and move defaults to timezone-aware UTC.
- **Status:** Planned.

## P2-002 - Frontend renders source-controlled YAML through HTML injection

- **Problem:** `YamlViewer` uses `dangerouslySetInnerHTML` on YAML derived from API data.
- **Impact:** A malicious payload can execute markup in the local dashboard.
- **Proposed fix:** Render tokens as React text nodes, never injected HTML.
- **Status:** Planned.

## P2-003 - Local frontend validation is not provisioned

- **Problem:** `npm` is absent and `frontend/node_modules` is not installed in this workspace.
- **Impact:** The Vite build cannot be run until dependencies are provisioned.
- **Proposed fix:** Use the bundled package manager without modifying source lockfiles, then run the build.
- **Status:** In progress.

## Phase 3 Findings (Project Ingestion)
- **FastAPI File Uploads**: Added `python-multipart` to handle FastAPI `UploadFile` requests gracefully.
- **AST Parsing**: Discovered that analyzing Python code purely via `ast.parse` is highly effective and completely sidesteps the security risks associated with dynamically loading arbitrary modules via `importlib`.
- **Pipeline Reusability**: The existing AgentVeto pipeline (`ThreatModeler`, `AttackGraph`, `evaluate_trace`) was robust enough to handle dynamically generated `ToolSchemas` derived from AST without needing any modifications to the core engine.
