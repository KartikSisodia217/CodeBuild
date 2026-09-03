import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSON

from backend.models.base import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=True
    )
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    s3_url: Mapped[str] = mapped_column(
        String(512),
        nullable=False
    )
    raw_text: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="UPLOADED",
        nullable=False
    )

    # Phase 6 — Document Intelligence
    document_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Detected document type (Bank Statement, Invoice, etc.)"
    )
    ocr_quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="OCR quality score 0.0-1.0. Below 0.4 = low quality."
    )
    analysis_data: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="Structured analysis results from BankStatementAnalyzer or other engines."
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="documents"
    )
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="documents"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="document"
    )
