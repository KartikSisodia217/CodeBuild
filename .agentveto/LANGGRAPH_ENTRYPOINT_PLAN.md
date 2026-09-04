# LangGraph Generic Entrypoint Discovery Plan

## Current Entrypoint Flow
- `discover_project` runs static AST checks to set `manifest.agentic` and `manifest.integration_type`.
- It currently parses `.agentveto/config.yaml` using `parse_project_config`, which sets `manifest.entrypoint`.
- In `ExecutionRuntime.execute()`, it checks `if not self.manifest.entrypoint:` and returns `UNSUPPORTED_ENTRYPOINT`.

## Current Validation Logic
- The trusted parent process solely checks for the presence of the `manifest.entrypoint` string (e.g., `module:object`).
- If missing, it fails without executing.

## Current Subprocess Boundary
- Execution happens via `subprocess_runner.py` calling `agentveto.worker`.
- The worker uses `LangGraphAdapter` which imports the entrypoint using `importlib.import_module(module_name)` and getattr.
- Only the worker imports target code.

## Candidate Entrypoint Strategies
- Create `backend/agentveto/ingestion/entrypoint_discovery.py` containing AST visitors to find LangGraph entrypoints.
- Look for:
  - Assigning `compile()` to a variable.
  - Functions containing `.invoke()` on a graph.
- Define `EntrypointCandidate` with `module`, `object_name`, `kind`, `confidence`, `dependencies`, etc.
- Rank candidates:
  1. Compiled graphs.
  2. Invoker functions.
  3. Explicit config.
  4. Others.
- Update `discover_project` to inject the best discovered entrypoint into `manifest.entrypoint` if explicit config is missing.
- Refactor `LangGraphAdapter` in the worker to handle the discovered entrypoint. It shouldn't assume `{}` input.

## Risks
- Resolving the object inside the worker might fail if it's a function vs a `StateGraph`.
- Input arguments might differ (e.g. `{"input": ...}` vs `{"messages": ...}`).
- Arbitrary code execution during discovery (prevented by strict AST analysis).

## Exact Files to Modify
- `backend/agentveto/ingestion/entrypoint_discovery.py` (NEW)
- `backend/agentveto/ingestion/discovery.py` (to call discovery)
- `backend/agentveto/subprocess_runner.py`
- `backend/agentveto/adapters/langgraph_adapter.py`
- `backend/agentveto/worker.py` (if input schemas need tweaking)
- `backend/api/main.py` (to preserve re-evaluate exact `run_id` behavior)
- `backend/tests/...` (new test files)

## Tests Required
- AST discovery for compiled graphs, functions.
- Missing config with discoverable graph.
- Invalid candidate.
- Subprocess timeout.
- Tool interception logic.
- LedgerAI regression.
- External LangGraph fixture end-to-end.
