# LedgerAI

## Project Overview

**LedgerAI** is an autonomous, AI-native Financial Operating System designed to serve as a complete, multi-agent finance department for startups and SMEs. 

### The Problem It Solves
The current financial technology landscape is fundamentally broken for small businesses. Founders are forced to bridge fragmented workflows—invoices in emails, rules in complex tax portals, and payments in bank feeds. Manual bookkeeping is time-consuming, and compliance errors (like incorrect GST handling) trigger severe penalties. 

### Why It's Different
Unlike traditional accounting software (which is a passive tool requiring manual data entry) and standard AI chatbots (which are reactive, prone to hallucinations, and blindly trust their own outputs), LedgerAI operates as an active team of specialists. It relies on an event-driven, background-running ecosystem where AI agents collaborate, enforce strict tax rules, and independently audit each other's work before generating reports.

---



## Key Features

- **Multi-Agent AI Architecture**: Specialized agents for accounting, tax, compliance, and auditing.
- **Blackboard Memory**: A central, strictly validated state preventing conversational context bloat.
- **LangGraph Orchestration**: Robust execution graphs featuring conditional loops and retries.
- **RAG-based Tax Knowledge**: Deterministic retrieval of tax codes (e.g., IGST Act) via pgvector.
- **Deterministic Math Verification**: Zero LLM arithmetic hallucinations; all math executes in a secure Python sandbox.
- **Human-in-the-Loop (HITL)**: Stateful workflow interruptions for missing compliance data (e.g., LUT numbers).
- **Real-time Streaming**: Server-Sent Events (SSE) for transparent, real-time "Glass Box" UI tracking.
- **Audit Trail**: Immutable logging of every agent decision and calculation.

---

## System Overview

```text
User 
  ↓ 
FastAPI 
  ↓ 
LangGraph 
  ↓ 
AI Agents 
  ↓ 
Database 
  ↓ 
Dashboard
```

---

## Technology Stack

- **Frontend**: Next.js 14, TailwindCSS, Zustand, Framer Motion, Recharts
- **Backend**: FastAPI, Python 3.12, Pydantic
- **AI Core**: LangGraph, Google Gemini 2.5 Pro, Google Embeddings (text-embedding-004)
- **Database**: PostgreSQL with `pgvector`, SQLAlchemy, Alembic
- **Infrastructure**: Docker, Docker Compose, Uvicorn

---

## Folder Structure

```text
backend/
├── ai/                 # Encapsulated AI Core (Agents, LangGraph, RAG)
├── api/                # FastAPI REST Endpoints
├── config/             # Environment Configurations
├── database/           # SQLAlchemy Setup & Sessions
├── exceptions/         # Custom Exceptions
├── middleware/         # Request Logging & Tracing
├── models/             # ORM Relational Models
├── observability/      # Centralized Telemetry
├── schemas/            # Pydantic REST API Contracts
├── services/           # Traditional Business Logic
└── utils/              # Helper Functions
tests/                  # Independent Testing Suite
```

---

## Local Setup

Follow these steps to run the LedgerAI backend locally.

**1. Clone the repository**
```bash
git clone https://github.com/your-org/ledgerai.git
cd ledgerai
```

**2. Set up Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install Dependencies**
```bash
pip install -r requirements.txt
```

**4. Environment Variables**
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ledgerai
```

**5. Start the Database (Docker Compose)**
Ensure Docker is installed and running.
```bash
docker-compose up -d db
```

**6. Run FastAPI Server**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
*The API documentation will be available at `http://localhost:8000/docs`.*

---

## API Overview

- **`POST /api/v1/upload`**: Ingests financial documents (PDFs, images) and triggers the background LangGraph AI pipeline. Returns a `task_id`.
- **`GET /api/v1/stream/execution/{task_id}`**: Streams real-time Server-Sent Events (SSE) representing agent execution status, thoughts, and citations to the frontend Glass Box UI.
- **`POST /api/v1/hitl/resolve`**: Accepts user input for missing compliance requirements (e.g., LUT numbers) to unpause and resume the LangGraph checkpoint.

---

## Contributors

- **Frontend Lead**: UI, Glass Box Timeline, Dashboards
- **Backend Lead**: FastAPI, Database, Document Processing
- **AI/ML Lead**: LangGraph, Agents, RAG, Prompt Engineering