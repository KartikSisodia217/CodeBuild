from typing import AsyncGenerator, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.settings import settings
from backend.database.session import get_db

# OAuth2 scheme config. Authentication routes will be implemented in Phase 4.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    auto_error=False
)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Placeholder dependency to retrieve the authenticated user from JWT.
    This will be fully implemented in Phase 4.
    """
    if not token:
        # Return a mock user for Phase 1-3 testing so we do not block api development
        return {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": "admin@ledgerai.com",
            "role": "admin",
            "company_id": "00000000-0000-0000-0000-000000000000"
        }
    
    # In Phase 4, we will decode the JWT token and fetch user from DB
    return {
        "id": "authenticated_mock_user_id",
        "email": "user@ledgerai.com",
        "role": "user",
        "company_id": "mock_company_id"
    }

async def get_current_active_company_id(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> str:
    """
    Dependency to get the current tenant (Company ID) context for multi-tenant data isolation.
    """
    return current_user.get("company_id")
