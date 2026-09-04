import backend.models

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1.health import router as health_router
from backend.api.v1.users import router as users_router
from backend.api.v1.auth import router as auth_router
from backend.api.v1.dashboard import router as dashboard_router
from backend.api.v1.streams import router as streams_router

from backend.core.database import Base, engine
from backend.core.exceptions import register_exception_handlers
from backend.core.logging import logger

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisionEdge API",
    description="Hardware Accelerated Video Pipeline Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(streams_router)

register_exception_handlers(app)


@app.get("/")
def root():
    return {
        "message": "Welcome to VisionEdge API"
    }


logger.info("VisionEdge API started successfully.")