from pydantic import BaseModel


class StreamCreate(BaseModel):
    camera_name: str
    rtsp_url: str
    resolution: str
    fps: int


class StreamUpdate(BaseModel):
    camera_name: str
    rtsp_url: str
    resolution: str
    fps: int
    status: bool


class StreamResponse(BaseModel):
    id: int
    camera_name: str
    rtsp_url: str
    resolution: str
    fps: int
    status: bool

    class Config:
        from_attributes = True