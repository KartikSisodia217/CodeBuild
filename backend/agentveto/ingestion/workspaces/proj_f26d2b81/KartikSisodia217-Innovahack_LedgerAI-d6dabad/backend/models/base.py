from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Unified SQLAlchemy 2.0 Declarative Base model.
    All database models in LedgerAI must inherit from this class.
    """
    pass

