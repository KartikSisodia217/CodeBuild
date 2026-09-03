# Next Agent Instruction

## Current State
Project Ingestion has been hardened, and bugs related to False Agentic Positives (Legal.ai) and GitHub SSL fetch errors have been resolved.
- `backend/agentveto/ingestion/discovery.py` now uses stricter checking (`langchain.agents`, `langgraph`, `crewai`, `@tool`) avoiding misclassifying standard RAG/LLM scripts as agents.
- `backend/agentveto/ingestion/github.py` now uses `httpx.stream` to bypass macOS local issuer SSL errors that occur natively in `urllib`, and strictly propagates 404, 403, and 429 status codes as proper `ExtractionError` messages for the frontend.
- `tests/test_github_ingestion.py` was adapted to mock `httpx` properly. All 77 tests in the backend suite pass.

## Files Changed
- `backend/agentveto/ingestion/discovery.py`
- `backend/agentveto/ingestion/github.py`
- `tests/test_github_ingestion.py`
- `frontend/src/components/NewScanModal.jsx` (JSX syntax fix)

## Remaining Work
The static ingestion and parsing system is now fully complete and correctly isolates Agentic components and distinguishes them from actual `AgentVeto` integrations. `Legal.ai.zip` now accurately reports `NOT_AGENTIC`, and `Innovahack_LedgerAI` reports `UNSUPPORTED`.
However, **arbitrary execution is still NOT IMPLEMENTED**. 
When a supported `ProjectManifest` requests a security scan via `/api/scan`, the backend raises a `501 Not Implemented`.

## Next Recommended Actions
The next logical step is to implement the real target agent sandbox orchestrator.
1. Build a Docker or microVM orchestrator inside `backend/agentveto/sandbox/`.
2. Connect `/api/scan` to instantiate this container for supported projects.
3. Inject the `AgentVeto` python adapter, execute the agent's entry point, capture telemetry/trajectories, and generate the final Evidence DAG.
