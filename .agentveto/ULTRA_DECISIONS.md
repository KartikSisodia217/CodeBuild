# AgentVeto V1 Engineering Decisions

## D-001 - Preserve the selected hybrid CI/CD tool-mocking architecture

- **Decision:** Improve the current decorator -> sandbox -> trace -> evaluator -> evidence flow;
  do not introduce containers, microVMs, proxies, an LLM judge, or a generic security platform.
- **Reason:** It directly follows the supplied architecture and keeps the hackathon claim focused
  on safe, schema-aware, pre-deployment adversarial simulation.
- **Alternatives:** Docker/microVM execution, an MCP gateway, an LLM adjudicator, or static-only
  sample traces.
- **Why alternatives were rejected:** They either exceed V1 scope, compromise deterministic
  adjudication, or fail to demonstrate adaptive tool-response injection.
- **Consequences:** The runner must clearly state that its mock environment is a controlled
  deterministic fixture when no live target/provider is connected.

## D-002 - Make deterministic demo fixtures first-class and transparent

- **Decision:** Use deterministic fixture target agents for the repeatable demo, but execute real
  AgentVeto modules and attach `execution_mode=deterministic_fixture` provenance to every result.
- **Reason:** It supports reproducible PASS/VETO demos without fabricating results or depending
  on remote LLMs.
- **Alternatives:** Continue serving pre-written evidence, or make a networked LLM mandatory.
- **Why alternatives were rejected:** Pre-written evidence is misleading; a mandatory LLM makes
  the demo flaky and prevents repeatable CI testing.
- **Consequences:** The product must describe fixtures as controlled simulations, not as live
  evaluation of an arbitrary external agent.
