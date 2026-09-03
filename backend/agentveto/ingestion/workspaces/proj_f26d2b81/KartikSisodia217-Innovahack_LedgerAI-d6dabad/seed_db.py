import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.config.settings import settings
from backend.models.base import Base
from backend.models.user import User
from backend.models.company import Company
from backend.models.transaction import Transaction
from backend.models.document import Document
from backend.models.audit_log import AuditLog
from backend.auth.jwt import get_password_hash
from sqlalchemy.future import select

# Use asyncpg
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI.replace("postgresql", "postgresql+asyncpg")

async def seed_db():
    print(f"Connecting to {DATABASE_URL}...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # Create all tables (if they don't exist)
    async with engine.begin() as conn:
        print("Ensuring tables exist...")
        await conn.run_sync(Base.metadata.create_all)
        
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Check if test user exists
        test_email = "test@company.com"
        result = await session.execute(select(User).where(User.email == test_email))
        user = result.scalars().first()
        
        if not user:
            print(f"Creating user: {test_email}")
            user = User(
                email=test_email,
                hashed_password=get_password_hash("password123"),
                role="admin",
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        else:
            print(f"User {test_email} already exists.")
            
        # Check if user has a company
        result = await session.execute(select(Company).where(Company.owner_id == user.id))
        company = result.scalars().first()
        
        if not company:
            print(f"Creating company for user {test_email}")
            company = Company(
                name="Test Company LLC",
                owner_id=user.id
            )
            session.add(company)
            await session.commit()
        else:
            print(f"Company already exists for user {test_email}.")
            
    print("\n✅ Database seeded successfully!")
    print("========================================")
    print("Login Email: test@company.com")
    print("Login Password: password123")
    print("========================================")

if __name__ == "__main__":
    asyncio.run(seed_db())
