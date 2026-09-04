from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.dependencies import get_db
from backend.schemas.stream import (
    StreamCreate,
    StreamResponse,
    StreamUpdate,
)
from backend.services.stream_service import (
    create_stream,
    get_all_streams,
    get_stream,
    update_stream,
    delete_stream,
)

router = APIRouter(
    prefix="/api/v1/streams",
    tags=["Streams"],
)


@router.post("/", response_model=StreamResponse, status_code=201)
def create_new_stream(
    stream: StreamCreate,
    db: Session = Depends(get_db),
):
    return create_stream(db, stream)


@router.get("/", response_model=list[StreamResponse])
def read_streams(db: Session = Depends(get_db)):
    return get_all_streams(db)


@router.get("/{stream_id}", response_model=StreamResponse)
def read_stream(
    stream_id: int,
    db: Session = Depends(get_db),
):
    stream = get_stream(db, stream_id)

    if stream is None:
        raise HTTPException(
            status_code=404,
            detail="Stream not found",
        )

    return stream


@router.put("/{stream_id}", response_model=StreamResponse)
def update_existing_stream(
    stream_id: int,
    updated_stream: StreamUpdate,
    db: Session = Depends(get_db),
):
    stream = update_stream(
        db,
        stream_id,
        updated_stream,
    )

    if stream is None:
        raise HTTPException(
            status_code=404,
            detail="Stream not found",
        )

    return stream


@router.delete("/{stream_id}")
def delete_existing_stream(
    stream_id: int,
    db: Session = Depends(get_db),
):
    stream = delete_stream(db, stream_id)

    if stream is None:
        raise HTTPException(
            status_code=404,
            detail="Stream not found",
        )

    return {
        "message": "Stream deleted successfully"
    }