from sqlalchemy import Boolean, Column, Integer, String

from backend.core.database import Base


class Stream(Base):
    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True)
    camera_name = Column(String, nullable=False)
    rtsp_url = Column(String, nullable=False)
    resolution = Column(String, nullable=False)
    fps = Column(Integer, nullable=False)
    status = Column(Boolean, default=False)