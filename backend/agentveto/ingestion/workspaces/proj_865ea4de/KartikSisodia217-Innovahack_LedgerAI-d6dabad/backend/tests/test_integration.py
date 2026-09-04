import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import create_app

app = create_app()

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "LedgerAI Backend"}

@pytest.mark.asyncio
async def test_unauthorized_upload():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/upload")
    # Should be 401 Unauthorized because no token is provided
    assert response.status_code == 401
