from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.config.settings import settings

# Setup connection pool configurations suited for production-grade concurrency
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI.replace("postgresql", "postgresql+asyncpg"),
    echo=False,
    pool_size=20,            # Maintain up to 20 persistent connections
    max_overflow=10,         # Allow temporary overflow up to 10 connections
    pool_pre_ping=True,      # Verify connection validity before checkout (failsafe)
    pool_recycle=1800,       # Recycle connections every 30 minutes to prevent stales
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    """Dependency for getting async DB sessions."""
    async with AsyncSessionLocal() as session:
        yield session

