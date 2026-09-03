"""add_document_intelligence

Revision ID: 0b36af110e6c
Revises: 002_conversations
Create Date: 2026-07-24 00:20:11.876023

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
"""add_document_intelligence

Revision ID: 0b36af110e6c
Revises: 002_conversations
Create Date: 2026-07-24 00:20:11.876023

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0b36af110e6c'
down_revision: Union[str, Sequence[str], None] = '002_conversations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('documents', sa.Column('document_type', sa.String(length=100), nullable=True, comment='Detected document type (Bank Statement, Invoice, etc.)'))
    op.add_column('documents', sa.Column('ocr_quality_score', sa.Float(), nullable=True, comment='OCR quality score 0.0-1.0. Below 0.4 = low quality.'))
    op.add_column('documents', sa.Column('analysis_data', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='Structured analysis results from BankStatementAnalyzer or other engines.'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('documents', 'analysis_data')
    op.drop_column('documents', 'ocr_quality_score')
    op.drop_column('documents', 'document_type')
