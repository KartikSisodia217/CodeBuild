import asyncio
import os
import uuid
from backend.ai.orchestrator.executor import WorkflowExecutor
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock

async def test_orchestrator():
    print("Testing Orchestrator...")
    
    # Mocking the DB and Repository
    mock_db = AsyncMock(spec=AsyncSession)
    
    # We will override the executor's repo and retriever methods for testing
    executor = WorkflowExecutor(mock_db)
    
    # Mock context retrieval
    async def mock_get_context(user_id, retrieval_type, query):
        if retrieval_type == "documents":
            return "[Uploaded Documents Context]\nSample contract clause..."
        elif retrieval_type == "ledger":
            return "[Recent Ledger Transactions]\nTxn 123: 1000 Debited"
        return "No specific context available."
        
    executor._get_context = mock_get_context
    
    # Run test query
    query = "Review this contract for legal risks"
    print(f"Query: {query}")
    
    # Instead of actually calling Gemini (which requires API keys), we will mock the provider responses
    # Actually, if Gemini API key is in .env, it might just work. Let's try it first without mocking the provider.
    
    # Wait, in the test environment, we might not have the API key.
    pass

if __name__ == "__main__":
    asyncio.run(test_orchestrator())
