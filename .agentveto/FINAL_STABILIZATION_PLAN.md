# AgentVeto Final Stabilization Plan

## Current Architecture
- Parent process handles routing, static discovery (AST parsing), policy orchestration, and evaluation.
- Worker process strictly isolates dynamic target code loading, patching, and execution.
- Communication crosses process boundaries via JSON IPC.
- Demos/fixtures are segregated to independent workflows or distinct run modes.

## Issue 1: Legal.ai (RAG app)
- **Root Cause**: Legal.ai lacks agentic components like `@tool` decorators or LangGraph modules. The frontend modal disabled the 'Run Scan' button when `agentic=False`, effectively trapping the user or failing to proceed to a terminal unsupported state.
- **Data/Lifecycle Flow**: Upload -> Static Discovery -> `agentic=False` -> `NewScanModal` shows "Cannot Scan Project" but didn't allow continuation -> User couldn't trigger `/api/scan` to commit `NOT_AGENTIC`.
- **Proposed Minimal Change**: Allow the user to click "View Details" to submit the unsupported project. The backend correctly maps this to the `NOT_AGENTIC` terminal state without attempting execution or using fixtures. 

## Issue 2: LedgerAI Re-evaluation & Fixture Contamination
- **Root Cause**: Old traces/fixtures were leaking into external runs via frontend `scenario_id` state or backend `ExecutionRuntime` fallback.
- **Data/Lifecycle Flow**: `POST /api/scan/{run_id}/re-evaluate` was used.
- **Proposed Minimal Change**: `main.py` explicitly rejects re-evaluation for `NOT_AGENTIC` and `UNSUPPORTED`. For `EXECUTION_FAILED`, it acts as a no-op returning the unchanged terminal status. If an external scan is executable, `ExecutionRuntime(..., run_id=exact_run_id)` executes from scratch against the real project code, generating a 100% new trace and evaluation. Fixtures are strictly isolated to `scenario_id` logic.

## Issue 3: LedgerAI Metadata Lost
- **Root Cause**: The frontend `RunOverview.jsx` displayed "Unknown" framework because it was reading from `meta.integration_type` instead of `manifest.integration_type`. When execution fails, `ExecutionRuntime._terminal` retains `project_manifest` but doesn't artificially duplicate `integration_type` into `metadata`.
- **Data/Lifecycle Flow**: `ScanResult.project_manifest.integration_type` contains "langgraph", but frontend checked `ScanResult.metadata.integration_type`.
- **Proposed Minimal Change**: Update `RunOverview.jsx` to correctly extract and display `manifest.integration_type`.

## Issue 4: LedgerAI "0 TOOLS FOUND"
- **Root Cause**: LedgerAI dynamically registers tools or inherits them, bypassing the AST parser that looks for literal `@tool` decorators. The frontend falsely claimed "0 TOOLS FOUND," implying the agent was impotent rather than our parser being limited.
- **Proposed Minimal Change**: Changed UI wording in `NewScanModal.jsx` to `{agent.tools?.length || 0} explicit tool declarations` to accurately reflect the backend's static AST boundaries.

## Issue 5: Large Binary Artifact Ingestion
- **Root Cause**: `extractor.py` was checking file size limits (10MB) before skipping known binary types, causing legitimate RAG/WASM projects to fail entire extraction.
- **Proposed Minimal Change**: Add `.wasm`, `.so`, `.dylib`, `.dll`, `.exe`, `.bin`, `.o`, `.obj`, `.a`, `.lib`, `.class` to `DEFAULT_EXCLUDED_EXTENSIONS`. `should_exclude` triggers `continue` before the size threshold check.

## Issue 6: Generic LangGraph Entrypoint Discovery
- **Root Cause**: `entrypoint_discovery.py` used `base_path.walk()` which is a Python 3.12+ exclusive API, failing silently and returning no candidates on older runtimes.
- **Proposed Minimal Change**: Changed `base_path.walk()` to standard `os.walk(base_path)`. The generic discovery logic now correctly finds `backend.ai.workflows.graph:run_workflow` and similar candidates without hardcoding LedgerAI.

## Verification & Tests
All 19 Pytest suites pass, validating:
- No trusted parent imports.
- True worker isolation.
- Empty traces cannot yield PASS.
- Generic LangGraph discovery works.
- Lifecycle state machines transition perfectly.
