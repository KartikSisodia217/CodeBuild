# Agent Discovery Fix - Final Report

## 1. Why LedgerAI was previously classified as "No agents detected"
The prior logic in `discovery.py` was too rigid when creating `AgentCandidate` entries for the `ProjectManifest.agents` list. It ONLY generated an agent candidate if a file explicitly contained `@tool`/`@action` decorators or an `agentveto` import. LedgerAI relies heavily on custom Python subclasses and LangGraph orchestration without these decorators. Although `is_agentic` was globally toggled to `True` for LedgerAI purely due to its use of `langgraph` framework imports combined with `StateGraph`, the lack of explicit `@tool` decorators meant `agents = []` was emitted. The frontend, seeing an empty array, displayed "No agents detected in project."

## 2. What actual source constructs prove LedgerAI is agentic
LedgerAI defines robust agent architectures, particularly visible through:
- Inheriting from dedicated base agent classes (e.g., `class PartnerAgent(BaseAgent)`)
- Organizing multiple files under an `agents/` directory structure (`backend/ai/agents/cfo.py`, `backend/ai/agents/ledger.py`, etc.)
- Constructing `StateGraph` workflows composed of these concrete agent classes (e.g. `add_node("partner_agent", ...)`)
- Emitting explicit `AgentResult` objects detailing tool invocations.

## 3. Why Legal.ai remains non-agentic
Legal.ai is a RAG pipeline utilizing LangGraph primarily for state transitions (`StateGraph`, `compile`) but devoid of any autonomous agent constructs. It has no tool registrations (`ToolNode`, `bind_tools`, `@tool`), no LLM planner/executor react agent patterns (`create_react_agent`), and no underlying classes or nodes representing independent agents.

## 4. Why framework detection and agent detection were being conflated
The previous logic automatically concluded `is_agentic = True` for LangGraph if it encountered *any* graph construct (like `StateGraph` or `compile`), even if those constructs were solely used for RAG pipelines. It conflated "the project uses the LangGraph framework" with "the project implements an autonomous agent."

## 5. Where READY FOR SCAN was incorrectly allowed
A project with `agentic == True` and `integration_type == "langgraph"` gets assigned `supported = True`. This caused the frontend to assume the project is fully supported and enabled the "Run Scan" flow. Because Legal.ai got swept up in the overly broad `is_agentic = True` check for LangGraph (as detailed above), it was incorrectly allowed to reach "READY FOR SCAN" despite not containing a single agent.

## 6. Files changed
- `backend/agentveto/ingestion/discovery.py`
- `backend/test_regression.py`

## 7. Tests added/updated
I rewrote `test_regression.py` to enforce the canonical testing structure and explicit invariants requested:
- `test_framework_only_project_a`: Ensures `agentic = False` for mere `import langgraph` and proves it resolves to `NOT_AGENTIC` and cannot reach execution logic.
- `test_genuine_langgraph_agent_b`: Ensures `create_react_agent` proves `agentic = True`.
- `test_ledgerai_source_patterns_c`: Ensures `class PartnerAgent(BaseAgent)` properly flags as `agentic = True`.
- `test_legalai_representative_source_d`: Ensures mere `StateGraph` accompanied by `AgentState(TypedDict)` (a RAG pattern) safely maps to `agentic = False`.
- `test_unsupported_agent_g`: Ensures an `autogen` agent is detected as `agentic = True` but `supported = False` and resolves to `UNSUPPORTED` status.

## 8. Exact backend response for Legal.ai
```json
{
  "project_id": "proj_04a87aca",
  "project_name": "Uploaded Project",
  "language": "python",
  "frameworks": [],
  "agentic_signals": [
    "LangGraph structural nodes: compile, StateGraph"
  ],
  "detected_tools": [],
  "data_sources": [],
  "data_sinks": [],
  "agentveto_integration": null,
  "supported_adapter": null,
  "explicit_configuration": null,
  "entrypoint": null,
  "agents": [],
  "warnings": [
    "No static agentic construct was detected."
  ],
  "errors": [],
  "agentic": false,
  "supported": false,
  "integration_type": "langgraph",
  "source_type": "zip",
  "repository": null,
  "revision": null
}
```

## 9. Exact backend response for LedgerAI
```json
{
  "project_id": "proj_d8366360",
  "project_name": "Uploaded Project",
  "language": "python",
  "frameworks": [],
  "agentic_signals": [
    "Agentic directory structure: backend/ai/agents/ledger.py",
    "Agent class detected: BaseAgent",
    ... (47 detailed signals total) ...
    "LangGraph structural nodes: compile, StateGraph"
  ],
  "detected_tools": [],
  "data_sources": [],
  "data_sinks": [],
  "agentveto_integration": null,
  "supported_adapter": null,
  "explicit_configuration": null,
  "entrypoint": null,
  "agents": [
    {
      "name": "partner",
      "file": "backend/ai/agents/partner.py",
      "entry_point": null,
      "integration": "python_interceptor",
      "tools": []
    },
    ... (25 agent files total) ...
  ],
  "warnings": [],
  "errors": [],
  "agentic": true,
  "supported": true,
  "integration_type": "langgraph",
  "source_type": "zip",
  "repository": null,
  "revision": null
}
```

## 10. Confirmation that NOT_AGENTIC cannot reach the execution runtime
This is explicitly handled in the backend (`backend/main.py`) which early returns a `ScanStatus.NOT_AGENTIC` response without instantiating `ExecutionRuntime`. The regression test `test_framework_only_project_a` explicitly verifies that the actual execution subprocess is never invoked (verified via mocking `run_external_project.assert_not_called()`).
