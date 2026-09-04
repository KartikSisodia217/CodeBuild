from sqlalchemy.orm import Session

from backend.models.stream import Stream
from backend.schemas.stream import StreamCreate, StreamUpdate


def create_stream(db: Session, stream: StreamCreate):
    db_stream = Stream(
        camera_name=stream.camera_name,
        rtsp_url=stream.rtsp_url,
        resolution=stream.resolution,
        fps=stream.fps,
        status=False,
    )

    db.add(db_stream)
    db.commit()
    db.refresh(db_stream)

    return db_stream


def get_all_streams(db: Session):
    return db.query(Stream).all()


def get_stream(db: Session, stream_id: int):
    return db.query(Stream).filter(Stream.id == stream_id).first()


def update_stream(db: Session, stream_id: int, stream: StreamUpdate):
    db_stream = db.query(Stream).filter(Stream.id == stream_id).first()

    if db_stream is None:
        return None

    db_stream.camera_name = stream.camera_name
    db_stream.rtsp_url = stream.rtsp_url
    db_stream.resolution = stream.resolution
    db_stream.fps = stream.fps
    db_stream.status = stream.status

    db.commit()
    db.refresh(db_stream)

    return db_stream


def delete_stream(db: Session, stream_id: int):
    db_stream = db.query(Stream).filter(Stream.id == stream_id).first()

    if db_stream is None:
        return None

    db.delete(db_stream)
    db.commit()

    return db_stream