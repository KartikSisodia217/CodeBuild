import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.routes import chat
from services import audio_engine

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ==============================================================================
    # 🚀 TEAMMATE HANDOFF BOUNDARY: API LIFECYCLE MANAGEMENT
    # ==============================================================================
    logger.info(f"Starting {settings.APP_NAME}...")
    
    # --------------------------------------------------------------------------
    # TODO TEAMMATES: WARM UP CHROMADB AND MODEL WEIGHTS HERE
    # --------------------------------------------------------------------------
    logger.info("TODO TEAMMATES: Initialize ChromaDB Connection Pool here.")
    logger.info("TODO TEAMMATES: Load local embedding models (Cohere/ONNX) here.")
    logger.info("TODO TEAMMATES: Warm up LangGraph StateGraphs here.")
    
    yield # The application runs during this yield
    
    logger.info("Shutting down API. Cleaning up resources...")
    # --------------------------------------------------------------------------
    # TODO TEAMMATES: GRACEFUL SHUTDOWN
    # --------------------------------------------------------------------------
    logger.info("TODO TEAMMATES: Close ChromaDB connections and flush telemetry here.")
    

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

# Allow requests from frontend
if settings.CORS_ORIGINS.strip() == "*":
    # Wildcard mode: allow all origins (allow_credentials must be False per CORS spec)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Explicit origins mode: supports credentials
    cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include the modular routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Read the audio bytes directly
    audio_bytes = await file.read()
    
    # Process through Gemini Flash (Google GenAI)
    transcription = await audio_engine.transcribe_voice_payload(audio_bytes, file.content_type)
    
    return {"text": transcription}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
