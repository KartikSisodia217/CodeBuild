# AgentVeto V1 Hardening Roadmap

Architecture reference: `Docs/Final Architecture.pdf` and `Docs/WorkSplit_Codebuild.pdf`.
The project remains a modular, pre-deployment adversarial simulation gate. This plan preserves
the established ownership boundaries and does not introduce a second product architecture.

- [x] Phase 0 - Baseline audit and reproducibility baseline
- [~] Phase 1 - Contract, API, and execution-flow hardening
- [ ] Phase 2 - Adversarial engine hardening
- [ ] Phase 3 - Synthetic sandbox hardening
- [ ] Phase 4 - Deterministic evaluator hardening
- [ ] Phase 5 - Evidence and trace hardening
- [ ] Phase 6 - Frontend data fidelity and UX hardening
- [ ] Phase 7 - Deterministic demo engineering
- [ ] Phase 8 - Testing and reliability
- [ ] Phase 9 - Measured performance work
- [ ] Phase 10 - Security of AgentVeto itself
- [ ] Phase 11 - Developer experience and documentation
- [ ] Phase 12 - Final hackathon polish

## Current priority order

1. Replace the pre-authored scan result with a clearly labeled deterministic fixture runner that
   executes the real module contracts and policy/evidence pipeline.
2. Make trace correlation, taint provenance, authorization evidence, and policy explanations
   deterministic and inspectable.
3. Ensure the frontend consumes actual run results and represents fixture provenance honestly.
4. Add vertical PASS/VETO/replay coverage, then refresh setup and demo documentation.
