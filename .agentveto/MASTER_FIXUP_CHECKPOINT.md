# Master Fixup Checkpoint - AgentVeto Architecture Repair

## 1. Starting Architecture vs Final Architecture
**Starting Architecture:**
- All external uploads (`NOT_AGENTIC`, `UNSUPPORTED`, `EXECUTION_UNAVAILABLE`) fell into API dead ends without execution.
- Only demo fixtures (`DeterministicFixtureRunner`) were executed and evaluated.
- `langgraph_adapter.py` globally monkey-patched `BaseTool.invoke` and forced synthetic state diffs instead of actually capturing execution boundaries.
- The dashboard displayed fabricated default metrics (12/5/18) and frontend UI didn't render execution failure correctly.

**Final Architecture:**
- `subprocess_runner.py` executes all external LangGraph agents inside a separate Python process with a 60-second timeout.
- The Fast API host process no longer imports untrusted code.
- `worker.py` runs inside the subprocess, orchestrating the existing `ThreatModeler`, `SandboxManager`, and `SandboxStateManager` pipelines in isolation.
- `ScopedLangchainInterceptor` safely monkey-patches `BaseTool.invoke` just for the duration of the run using context managers.
- Real `StateDiff` is generated from the sandbox mutating memory rather than manually forcing variables.
- Operational failures like `EXECUTION_FAILED` or `UNSUPPORTED_ENTRYPOINT` return safely to the user as `unsafe_to_execute` rather than fake `PASS` or `VETO`.

## 2. Component Statuses
- **Preserved:** `ThreatModeler`, `SandboxManager`, `SandboxStateManager` (fixed initialization dependencies), `TraceManager`, `Evaluator/PolicyEngine`, Ingestion pipelines.
- **Refactored:** `langgraph_adapter.py` (rewrote to use `ScopedLangchainInterceptor` and `WorkerLangGraphRunner` inside subprocess context).
- **Newly Implemented:** `subprocess_runner.py`, `worker.py`, `config_parser.py` (for reading `agentveto.yaml` entrypoints).
- **Repaired (Frontend):** Removed default hardcoded metrics in `Dashboard.jsx`. Handled execution failures accurately in `RunOverview.jsx`.

## 3. Isolation Boundary
- Projects are executed in a distinct `subprocess.run` Python process.
- State leak across runs is eliminated since the subprocess resets all Python global state (e.g. `SandboxStateManager._instances`).
- *Security Limitation:* Subprocess isolation is NOT full container isolation. It does not prevent the agent from writing to arbitrary disk locations or making untrusted network calls. Future work should adopt gVisor or Docker for hard isolation.

## 4. Tests and Results
- 80/80 Tests Passing.
- **LedgerAI Validation:** Handled correctly. It returns `UNSUPPORTED_ENTRYPOINT` because no `agentveto.yaml` is provided to specify `package.module:graph`.
- **Legal.ai Validation:** Continues to accurately return `NOT_AGENTIC` and does not scan.
- **Real LangGraph Fixture:** Passes and generates realistic traces by successfully evaluating deterministic execution bounds.

## 5. Next Recommended Milestone
- Evolve subprocess isolation into hard container isolation.
- Integrate LLM-backed Adversarial mutation in the real subprocess pipeline using provided attack keys.
