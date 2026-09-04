import asyncio
import os
import sys

# Ensure backend module is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select

from backend.config.settings import settings
from backend.models.user import User
from backend.models.company import Company
from backend.auth.jwt import get_password_hash

async def init_db():
    print("Starting database initialization...")
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI.replace("postgresql", "postgresql+asyncpg"))
    AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Check if admin user exists
        admin_email = "admin@ledgerai.com"
        result = await session.execute(select(User).where(User.email == admin_email))
        user = result.scalars().first()
        
        if not user:
            print(f"Creating default user: {admin_email}")
            user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        else:
            print(f"User {admin_email} already exists.")
            
        # Check if default company exists
        result = await session.execute(select(Company).where(Company.owner_id == user.id))
        companies = result.scalars().all()
        
        if not companies:
            print("Creating default company for user...")
            company = Company(
                name="LedgerAI Demo Corp",
                owner_id=user.id
            )
            session.add(company)
            await session.commit()
        else:
            print("Default company already exists.")
            
    print("Database initialization completed.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
