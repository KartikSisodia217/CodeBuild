from typing import List
from langchain_postgres import PGVector
from backend.config.settings import settings
from backend.ai.rag.embeddings import embeddings_manager
from sqlalchemy.ext.asyncio import create_async_engine

class VectorStoreManager:
    def __init__(self, collection_name: str = "ledgerai_knowledge"):
        self.collection_name = collection_name
        self.connection_string = settings.SQLALCHEMY_DATABASE_URI.replace("postgresql", "postgresql+psycopg")
        self.engine = create_async_engine(self.connection_string)
        
        self.vector_store = PGVector(
            embeddings=embeddings_manager.get_embeddings(),
            collection_name=self.collection_name,
            connection=self.engine,
            use_jsonb=True,
        )

    def get_store(self) -> PGVector:
        return self.vector_store

vector_store_manager = VectorStoreManager()
