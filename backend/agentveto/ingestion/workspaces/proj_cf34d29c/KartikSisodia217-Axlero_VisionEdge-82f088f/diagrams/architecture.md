# VisionEdge Architecture

```
                 Client / Browser
                        │
                        ▼
                 FastAPI Backend
                (backend/main.py)
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   API Routes      Core Services     Schemas
   (api/v1)        (core/)           (schemas/)
        │
        ▼
   SQLAlchemy ORM
        │
        ▼
   SQLite Database
   (visionedge.db)
```

## Components

### Client
- Sends HTTP requests.

### FastAPI Backend
- Receives API requests.
- Processes business logic.

### API Routes
- User APIs
- Health API

### Core
- Database
- Configuration
- Logging
- Exception Handling

### Schemas
- Request validation
- Response validation

### Models
- SQLAlchemy Models

### Database
- SQLite Database
