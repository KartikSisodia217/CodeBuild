# AgentVeto final backend rebuild plan

## Reconnaissance

The repository had two execution designs.  `ExecutionRuntime` called
`run_langgraph_fixture` for fixtures in the API process, while uploads used a
subprocess helper.  The fixture runner manufactured AGENT and LLM spans, the
deterministic attack provider defaulted to `read_tickets`/`execute_refund`, and
the sandbox state manager inferred mutations from tool-name substrings.  Those
paths are not retained as a scan path.

Existing safe components to preserve are archive/GitHub ingestion, AST-only
discovery, Pydantic response compatibility, deterministic policy rules, and
the evidence-DAG renderer.  Frontend files are explicitly out of scope.

## Target canonical lifecycle

`ProjectWorkspace -> ProjectManifest -> classification -> AdapterRegistry ->
LangGraphAdapter specification -> ExecutionRuntime -> worker subprocess ->
target graph -> scoped interception -> observations -> trusted evaluator ->
evidence -> ScanResult`.

There is exactly one runtime entry point.  A controlled demo is a normal
workspace with an explicit `.agentveto/config.yaml`; it receives no in-process
fixture exemption.  All target-module imports happen inside the worker.

## Contracts and status

`contracts/schemas.py` is the canonical model module.  Operational status and
security verdict remain separate.  Only a `COMPLETED` result with a non-empty
observed trajectory can be evaluated to PASS or VETO.  All other outcomes,
including empty execution, have a null verdict.

## Adapter and runtime lifecycle

The registry selects only LangGraph.  Static discovery identifies framework
evidence but never imports project code.  Config validates a conservative
`module.path:object` entrypoint without importing it.  The parent supplies a
validated execution specification via JSON to a fresh worker, enforces a
timeout and bounded stdio, and receives JSON observations.  External projects
are permitted to use the same subprocess runtime, but that is an execution
boundary rather than a production sandbox.

## Attack, interception, and state lifecycle

Within the worker the adapter loads actual LangChain tool objects and extracts
their names, descriptions, and argument schemas.  The trusted parent uses
those schemas to derive a threat model, source/sink plan, and deterministic
payload; no fixture tool names are defaults.  The worker patches BaseTool only
while executing one run.  It intercepts the plan's source tool, returns a
schema-oriented simulated response, records actual tool invocation, and never
runs the intercepted tool body.  A state transition can occur only through an
explicit `agentveto_action` declared in tool metadata/configuration; there are
no action-name substring rules.

Tool and sandbox/state events are recorded only when they occur.  AGENT and
LLM events are omitted until supported by real framework/provider callbacks.
The trusted parent evaluates observed trajectory/state and makes evidence from
those observed spans only.  Re-evaluation is restricted to a stored,
completed, non-empty run record keyed by `run_id`.

## Files to rewrite/remove

Rewrite the runtime, worker, LangGraph adapter/interceptor, deterministic
provider, sandbox state semantics, static classification, and API orchestration.
Remove old host-fixture execution and legacy `read_tickets`/`execute_refund`
defaults.  Retain compatibility modules only as thin exports if tests or
clients import them.

## Test strategy

Run the existing suite plus controlled E2E workspaces that verify static
classification, subprocess-only import/execution, schema-specific plans,
blocked tool bodies, actual TOOL-only traces, explicit state actions, verdict
gating, re-evaluation isolation, and concurrent runs.  The demo expectations
are VETO for EchoLeak and PASS for the safe support graph.
