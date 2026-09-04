import os
from typing import Dict, Any
from backend.ai.rag.chunker import DocumentChunker
from backend.ai.rag.vector_store import vector_store_manager
from backend.observability.logger import logger

class IngestionPipeline:
    def __init__(self):
        self.chunker = DocumentChunker()
        self.store = vector_store_manager.get_store()

    async def ingest_document(self, text: str, metadata: Dict[str, Any]) -> None:
        """Chunks a document and ingests it into the vector store."""
        logger.info(f"Ingesting document with metadata: {metadata}")
        chunks = self.chunker.chunk_text(text, metadata)
        await self.store.aadd_documents(chunks)
        logger.info(f"[VECTOR_INGEST] Successfully ingested {len(chunks)} chunks. document_id={metadata.get('document_id', 'unknown')}, conversation_id={metadata.get('conversation_id', 'global')}")

ingestion_pipeline = IngestionPipeline()
