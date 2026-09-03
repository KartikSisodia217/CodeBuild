# Next Agent Instruction

## Current State
Project Ingestion and User Project Scanning have been fully implemented in the backend. 
- Created `backend/agentveto/ingestion/` with `extractor.py` and `discovery.py` to safely unzip and perform AST-based static analysis of user code.
- Added `/api/projects/analyze` endpoint for project uploading and analysis.
- Modified `/api/scan` to support synthetic scans of uploaded projects without executing arbitrary code, maintaining strict isolation.
- Added `tests/test_project_ingestion.py` which passes successfully along with the entire backend suite (61 tests total).

## Files Changed
- `backend/main.py`
- `backend/agentveto/contracts/schemas.py`
- `backend/agentveto/runtime.py`
- `backend/agentveto/ingestion/__init__.py` (new)
- `backend/agentveto/ingestion/extractor.py` (new)
- `backend/agentveto/ingestion/discovery.py` (new)
- `tests/test_project_ingestion.py` (new)
- `requirements.txt` (added `python-multipart`)

## Remaining Work
The backend now correctly supports safe user project ingestion and deterministic synthetic scans. The next phase must focus on integrating this backend functionality into the Frontend React UI. 
- Create a UI to upload a ZIP file.
- Call `/api/projects/analyze` to display the `ProjectManifest`.
- Trigger `/api/scan` with the manifest.
- Update demo selectors.

## Next Recommended Actions
1. Install Node.js dependencies in the frontend and configure the build process if needed.
2. Build the project ingestion UI in `frontend/src/` to interact with `/api/projects/analyze`.
3. Do NOT execute or require frontend changes outside of the UI scope.
