from sqlalchemy import String, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from backend.models.base import Base

class LangGraphCheckpoint(Base):
    __tablename__ = "langgraph_checkpoints"

    thread_id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        nullable=False
    )
    checkpoint_id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        nullable=False
    )
    checkpoint_data: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False
    )
    metadata_data: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True
    )
    parent_checkpoint_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
