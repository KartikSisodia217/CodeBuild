# AgentVeto Master Engineering Task Plan

## 1. Issue Inventory & Categorization

### Bucket A — Truth / Provenance
| ID | Title | Severity | Current Behavior | Why it's a problem | Dependencies | Status |
|---|---|---|---|---|---|---|
| A1 | External projects not genuinely scanned (1, 39, 70) | BLOCKER | External scans can fake results via fixtures | Breaks core product claim | B-Execution | Open |
| A2 | Legal.ai synthetic evidence (3, 4, 5, 27, 31) | BLOCKER | `execute_refund` mutations shown for non-agentic projects | Fabricated security events | C-State, B-Execution | Open |
| A3 | Synthetic traces indistinguishable from real (19, 20, 30) | IMPORTANT | Synthetic AGENT/LLM spans look real | Undermines evidence integrity | A4 | Open |
| A4 | VETO/PASS semantic ambiguity (28, 29, 58, 59) | BLOCKER | Empty traces can yield PASS, fixtures yield VETO | Verdict means nothing without provenance | C-Lifecycle | Open |
| A5 | Misleading execution metadata (21, 68) | CLEANUP | Metadata shows "subprocess" or "adversarial" for fixtures | Provenance is obscured | A4 | Open |
| A6 | Universal provenance guarantee missing (69) | REQUIRED | No cryptographically or logically strict trace-to-run mapping | Cannot trust UI evidence | A4 | Open |

### Bucket B — Execution
| ID | Title | Severity | Current Behavior | Why it's a problem | Dependencies | Status |
|---|---|---|---|---|---|---|
| B1 | LedgerAI execution failure (10, 52) | BLOCKER | Agentic repos stop at UNSUPPORTED_ENTRYPOINT | Product fails on real code | B3 | Open |
| B2 | Fixture runtime is not external (22) | BLOCKER | The only working scans are controlled fixtures | Not arbitrary agent scanning | B3 | Open |
| B3 | Subprocess worker needed (43, 44) | BLOCKER | No real process isolation for untrusted Python | Arbitrary code execution risk | B4 | Open |
| B4 | Generic Adapter / Interception (40, 42) | BLOCKER | Global monkey patching, non-generic LangGraph hooks | Concurrent execution fails | B5 | Open |
| B5 | Tool/State extraction (26, 50, 51) | REQUIRED | Hardcoded substring rules for tools/state | Cannot handle generic schemas | - | Open |
| B6 | Adversarial engine hardcoding (23, 24, 25) | BLOCKER | Attacks hardcoded to `read_tickets`/fixture targets | Not adaptive to arbitrary APIs | B5 | Open |
| B7 | Static detection limitations (8, 9, 48, 49) | NON-BLOCKING | Framework imports flagged as executable agents | Discovery over-promises | - | Open |

### Bucket C — State / Lifecycle
| ID | Title | Severity | Current Behavior | Why it's a problem | Dependencies | Status |
|---|---|---|---|---|---|---|
| C1 | Re-Evaluate cross-contamination (12, 13, 14, 15, 16, 17, 35) | BLOCKER | Re-evaluating an external run triggers a fixture scenario | Flawed identity mixing | - | FIXED |
| C2 | Conflicting agentic states (2, 32) | BLOCKER | UI shows "No agent" and "READY FOR SCAN" simultaneously | Lifecycle model broken | C3 | Open |
| C3 | Mixed execution/security terminal states (11, 33, 34, 56, 57) | IMPORTANT | UNSUPPORTED_ENTRYPOINT treated as completable/evaluable | Results are invalid | - | Open |
| C4 | Global mutable state (18, 53, 54) | BLOCKER | Shared sandbox instances and module-level singletons | Scans interfere | B4 | Open |
| C5 | Identity contract drift (55, 65, 66, 67) | IMPORTANT | Frontend relies on `scenario_id`, backend uses `run_id` | Endpoints misalign | - | Open |
| C6 | Fabricated dashboard metrics (36) | BLOCKER | Dashboard computes stats from static fixture count | Metrics are a lie | - | FIXED |

### Cross-cutting Security
| ID | Title | Severity | Current Behavior | Why it's a problem | Dependencies | Status |
|---|---|---|---|---|---|---|
| S1 | Unsafe dynamic imports (41) | BLOCKER | importlib.import_module executes untrusted top-level code | ACE | B3 | Open |
| S2 | Shared trace storage (62, 63) | REQUIRED | `traces.db` is global | Contamination | - | Open |
| S3 | Archive and network gaps (45, 46, 47) | REQUIRED | Symlink/SSRF gaps in GitHub ingestion | Host vulnerabilities | - | Open |

### Testing, Documentation & Cleanup
| ID | Title | Severity | Current Behavior | Why it's a problem | Dependencies | Status |
|---|---|---|---|---|---|---|
| T1 | Missing real E2E test (38) | BLOCKER | Tests cover fixtures, not arbitrary external repos | No proof of capability | B1 | Open |
| T2 | Missing Frontend coverage (37) | REQUIRED | 0 frontend tests | Regression risk | - | Open |
| D1 | Overstated claims (60, 61) | REQUIRED | CI/CD, sandboxing, and generic claims exceed reality | Misleading product | - | Open |
| U1 | Duplicate code remnants (6, 7, 64) | CLEANUP | Duplicate policy rules, stale scripts | Tech debt | - | Open |

## 2. Symptomatic vs Architectural
The vast majority of the "Truth / Provenance" issues (A1, A2, A3, A4, A5) and "State Contamination" (C1, C4, C5) are symptoms of two root architectural failures:
1. **Lack of Strict Terminal States:** The evaluator previously allowed empty/failed execution traces to be evaluated, treating absence of evidence as a PASS, or falling back to fixture injection.
2. **Missing Subprocess IPC Contract:** Because external execution was incomplete, the system fell back to in-process execution or synthetic span generation. Once we mandate that **ONLY** spans received via IPC from a Subprocess Worker can be evaluated, all synthetic evidence issues disappear immediately.

## 3. Product Contract & Lifecycle

### Canonical Pipeline
`INGEST` -> `DISCOVER` -> `CLASSIFY` -> `ENTRYPOINT RESOLUTION` -> `ISOLATED EXECUTION` (Worker Subprocess) -> `TOOL INTERCEPTION` (Worker) -> `ADVERSARIAL INJECTION` (Parent to Worker) -> `REAL TOOL ACTION` (Worker) -> `TRACE IPC` (Worker to Parent) -> `STATE OBSERVATION` -> `DETERMINISTIC EVALUATION` -> `EVIDENCE DAG` -> `PASS/VETO`

### Terminal States
- **NOT_AGENTIC**: No execution. Terminal. Not Re-evaluable.
- **UNSUPPORTED**: Framework not supported. Terminal. Not Re-evaluable.
- **UNSUPPORTED_ENTRYPOINT**: Valid framework, but no safe way to execute. Terminal. Not Re-evaluable.
- **EXECUTION_UNAVAILABLE**: General worker crash before execution. Terminal. Not Re-evaluable.
- **EXECUTION_FAILED**: Target graph crashed during execution. Terminal. Not Re-evaluable.
- **COMPLETED**: Execution finished, yielding an evaluation. Terminal. Re-evaluable.

## 4. The True Critical Path
The missing links to achieve a real external scan:
1. `actual entrypoint resolution`: Safely importing arbitrary project modules in a worker.
2. `isolated execution`: A clean Python subprocess with bounded I/O and strict timeouts.
3. `actual tool interception`: Hooking LangChain/LangGraph tools dynamically at runtime without global monkey-patching.
4. `adversarial payload injection`: Creating payload logic derived from the discovered schema, not hardcoded strings.
5. `real trace/state evidence`: Emitting actual `Interceptor` spans over IPC back to the parent evaluator.

## 5. Execution (Bucket B) Dependency Graph
**Goal:** Run `LedgerAI` (or any generic repo) via a Subprocess.
1. `B6 (Process isolation)` -> Establish `worker.py` as a subprocess.
2. `B1 (Entrypoint discovery)` -> Validate module path in Parent, send string to Worker.
3. `B5 (External Python execution)` -> Worker dynamically imports module (Safe because it's isolated).
4. `B2 (Adapter interface)` -> Worker initiates framework-specific execution.
5. `B11 (Tool interception)` -> Worker intercepts `BaseTool.invoke` locally for its own process.
6. `B13 (IPC Trajectory transport)` -> Worker serializes spans to stdout/stderr.
7. `B14 (State observation)` -> Parent reads spans, constructs StateDiff, builds Trajectory.

## 6. Provenance (Bucket A) Dependency Graph
1. **REAL Spans Only**: The parent evaluator must only accept `TOOL` spans. `AGENT` and `LLM` spans should not be faked.
2. **Run ID Binding**: `run_id` is passed to the Subprocess Worker as an environment variable or argument. Every IPC message contains this `run_id`.
3. **Verdict Gating**: `evaluate_trace()` strictly returns `None` if `spans.length == 0`. No PASS or VETO without real spans.

## 7. Lifecycle (Bucket C) Dependency Graph
- `workspace_id`: Local disk path. Owned by Ingestion.
- `project_manifest`: The logical representation. Owned by Discovery.
- `run_id`: UUID generated precisely at the moment of scan execution. Owned by `ExecutionRuntime`.
- `scenario_id`: A frontend-only concept for selecting demo templates. MUST NOT be passed to execution endpoints for external projects.

## 8. Testing Strategy
1. **E2E Test**: `test_external_langgraph_scan.py` -> Ingests a mock zip (with a real python LangGraph file), invokes the Worker, asserts an IPC trace is received, and asserts a valid PASS/VETO verdict based on the mock tools.
2. **Terminal State Tests**: Asserts `UNSUPPORTED_ENTRYPOINT` and `NOT_AGENTIC` cannot be routed to `evaluate_trace`.
3. **Concurrency Test**: 2 simultaneous scans with mocked tools that mutate state; assert no cross-contamination.

## 9. Capability Matrix

| Feature | Real External Capability | Controlled Fixture Capability | Static Analysis Only | Not Implemented |
|---|---|---|---|---|
| Code Ingestion | YES | YES | - | - |
| Agent Discovery | - | - | YES | - |
| Entrypoint Loading | - | YES | - | YES |
| Sandboxed Execution | - | YES (In-process) | - | YES |
| Tool Interception | - | YES (Monkey-patch) | - | YES |
| Adaptive Adversarial | - | YES (Hardcoded) | - | YES |
| DAG Evidence | - | YES | - | - |

## 10. Recommended Implementation Order

1. **Phase 1: Canonical Execution Contract (Lifecycle)**
   - Fix all Terminal States (`NOT_AGENTIC`, `UNSUPPORTED_ENTRYPOINT`).
   - Gate `evaluate_trace` on `COMPLETED` and `spans > 0`.
2. **Phase 2: Real External Execution (Process Isolation)**
   - Build the Subprocess Worker (`worker.py`).
   - Implement basic module importing (resolving S1).
3. **Phase 3: Generic Tool Interception**
   - Refactor `LangGraphAdapter` to be instantiated inside the Worker.
   - Remove global monkey patching.
   - Implement IPC span serialization.
4. **[x] Phase 4: Real Adversarial Injection**
   - Remove `execute_refund` hardcodes from the engine.
   - Dynamically build payload targeting the discovered `ToolSchema`.

5. **[x] Phase 5: Evidence & UI Finalization**
   - Ensure the React UI correctly displays the new IPC-generated execution trace (S1, S2 fixes naturally resolve this).
   - Verify `execute_refund` mutations are not displayed for non-agentic projects (B4, A2).
