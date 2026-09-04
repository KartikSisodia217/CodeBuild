# LedgerAI - AI Documentation

This document serves as the technical reference for the cognitive core of LedgerAI, detailing the agent logic, prompt strategies, RAG implementation, and verification systems.

---

## AI Philosophy

LedgerAI is built as a **Multi-Agent System**, not a chatbot. A single monolithic AI model attempting to categorize expenses, calculate tax laws, and audit its own work simultaneously will inevitably experience context bleed, bias, and hallucinations. 

By mirroring a real-world accounting firm, we split responsibilities into isolated, highly specialized agents. The Bookkeeper drafts, the Tax Specialist researches, and the Auditor verifies. This adversarial, collaborative approach guarantees mathematical and regulatory accuracy.

---

## Agent Responsibilities

### 1. Partner Agent
- **Purpose**: Acts as the orchestrator proxy and front-desk manager.
- **Inputs**: Raw user query or uploaded OCR text.
- **Outputs**: Routing decision and initialized state.
- **Responsibilities**: Classifies intent, determines required workflow execution, and instantiates the Blackboard.
- **Tools**: None.

### 2. Accounting Agent
- **Purpose**: Semantic processor for financial data.
- **Inputs**: Raw OCR text.
- **Outputs**: Structured `AccountingOutput` (Vendor details, Debit/Credit ledger lines).
- **Responsibilities**: Translates messy unstructured data into standardized double-entry accounting drafts.
- **Tools**: None.

### 3. GST & Tax Specialist
- **Purpose**: Indirect tax compliance enforcer.
- **Inputs**: `AccountingOutput` and transaction metadata.
- **Outputs**: Structured `GSTOutput` (SEZ flags, tax rates, required documentation).
- **Responsibilities**: Consults the tax code to apply exact tax rates and flag missing compliance documents (e.g., LUTs for SEZ supplies).
- **Tools**: RAG Retriever.

### 4. Compliance Agent
- **Purpose**: The organizational watchdog.
- **Inputs**: Transaction metadata.
- **Outputs**: Structured `ComplianceOutput` (Duplicate flags, risk score).
- **Responsibilities**: Checks historical transaction vectors for identical invoices to prevent double-billing and fraud.
- **Tools**: Vector Search.

### 5. Audit Agent
- **Purpose**: The final verification gatekeeper.
- **Inputs**: The complete, merged Blackboard state.
- **Outputs**: Structured `AuditOutput` (Approved boolean, reasoning, HITL flag).
- **Responsibilities**: Enforces the Disagree-or-Commit protocol. Never trusts the Accounting Agent's math. 
- **Tools**: Python Math Sandbox.

### 6. Financial Analyst Agent
- **Purpose**: Strategic insights generator.
- **Inputs**: Final verified ledger entry.
- **Outputs**: Structured `AnalystOutput` (Narrative).
- **Responsibilities**: Generates a brief, two-sentence business narrative explaining the cash-flow impact.
- **Tools**: None.

---

## Blackboard State

The **Blackboard** is a strictly typed Pydantic `BaseModel` containing the entire lifecycle state of a transaction.

### Data Flow
1. LangGraph holds the `BlackboardState` in memory.
2. The graph passes a copy of this state to an executing Agent.
3. The Agent generates a Pydantic schema representing its specific domain.
4. LangGraph's reducers merge the Agent's schema back into the central `BlackboardState`.

**Model Composition**: Includes `transaction_id`, `schema_version`, `raw_text`, `accounting_draft`, `gst_context`, `audit_status`, `error_count`, and `human_input_required`.

---

## Prompt Strategy

Prompts in LedgerAI are decoupled from business logic. They are stored as Markdown templates in `backend/ai/prompts/` and loaded dynamically via the `PromptManager`.

- **Structured Outputs**: Every prompt explicitly defines its role but relies on the LLM Provider to enforce JSON schema generation natively.
- **Role Specialization**: Prompts are extremely narrow. The Accounting prompt contains zero tax rules; the GST prompt contains zero formatting logic.
- **Validation**: We do not rely on LLM prompting to validate math. Math validation is shifted to deterministic Python execution.

---

## Provider Layer

The LLM logic is entirely abstracted behind a `ProviderFactory`. Agents request structured generation from a `BaseProvider` interface. The primary implementation (`GeminiProvider`) wraps the `langchain-google-genai` SDK. This allows agents to seamlessly generate Pydantic schemas without knowing the underlying API implementation details.

---

## Memory

LedgerAI clearly separates memory boundaries to prevent context bloat:
- **Blackboard (Short-Term)**: The immutable state flowing through the current active graph execution.
- **Conversation (Context)**: Not passed between agents. Chat histories are intentionally excluded from the Blackboard to ensure deterministic processing.
- **Retrieval (Knowledge)**: Persistent vector knowledge stored in `pgvector`.
- **Checkpointing (Persistence)**: Uses LangGraph's `AsyncPostgresSaver` to serialize and save the graph state directly to PostgreSQL at every step, enabling stateful interruption and resumption.

---

## RAG

The Retrieval-Augmented Generation pipeline is implemented natively in `backend/ai/rag/`:
- **Chunking**: Uses LangChain's `RecursiveCharacterTextSplitter`.
- **Embeddings**: Uses Google's `text-embedding-004` model.
- **Vector Database**: `pgvector` extension in PostgreSQL via `langchain-postgres`.
- **Retrieval**: Executes hybrid semantic search to extract exact tax codes and citations (e.g., Section 16 of the IGST Act) which the GST Agent then uses to defend its output.

---

## Verification

The system includes a dedicated `backend/ai/verification/` layer:
- **Disagree-or-Commit**: The Audit Agent will reject mathematically incorrect drafts, forcing LangGraph to loop back to the Accounting Agent up to 3 times before halting.
- **Deterministic Math**: The Audit Agent uses the `PythonCalculator` tool (`asteval` sandbox) to calculate sums. LLMs are prohibited from performing native arithmetic.
- **Consistency & Hallucination**: Post-generation scripts check for logical contradictions in the Blackboard before final database commits.

---

## Human-in-the-Loop (HITL)

LedgerAI operates autonomously but recognizes when human authority is required (e.g., missing legal documentation).
- **Interruption**: If the Audit Agent sets `human_input_required=True`, the LangGraph router immediately terminates the current run.
- **Checkpointing**: The state is serialized to PostgreSQL.
- **Resume**: The Frontend API (`/api/hitl/resolve`) passes the user's input back into the graph, fetching the checkpoint, and resuming exact execution without losing prior agent work.

---

## Future Improvements

- **Additional Providers**: Seamlessly plug in local open-source models via the Factory pattern for data-sensitive clients.
- **Better OCR**: Replace the standard text extraction with multi-modal vision parsing.
- **More Financial Tools**: Add API integrations for live banking feeds (Plaid, Stripe).
- **Multi-Company Support**: Enhance RAG metadata filtering to support infinite multi-tenant vector separation.
