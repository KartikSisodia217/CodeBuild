from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1",
    tags=["Health"]
)


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "project": "VisionEdge",
        "version": "1.0.0"
    }