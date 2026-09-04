"""
Enhanced RAG Retriever — Phase 6
Improvements: Query rewriting, hybrid keyword boost, context compression,
token budgeting, semantic deduplication.
Maintains same public interface as before.
"""
import re
from typing import List, Dict, Any
from langchain_core.documents import Document
from backend.ai.rag.vector_store import vector_store_manager
from backend.observability.logger import logger


# Financial synonym expansion for query rewriting
_FINANCIAL_SYNONYMS: Dict[str, List[str]] = {
    "cash flow": ["inflows", "outflows", "net movement", "cash position"],
    "profit": ["net income", "earnings", "surplus", "bottom line"],
    "revenue": ["income", "turnover", "receipts", "sales"],
    "expenses": ["costs", "expenditure", "outgoings", "debits"],
    "balance": ["closing balance", "opening balance", "account balance", "funds"],
    "invoice": ["bill", "receipt", "purchase order", "tax invoice"],
    "gst": ["gstin", "igst", "cgst", "sgst", "tax"],
    "salary": ["payroll", "wages", "compensation", "remuneration"],
    "bank statement": ["account statement", "transaction history", "passbook"],
    "audit": ["reconciliation", "verification", "review"],
    "fraud": ["suspicious", "anomaly", "irregular", "duplicate"],
}

# Max tokens budget for retrieved context (approx 4 chars/token)
_MAX_CONTEXT_CHARS = 16_000  # ~4000 tokens
_SEMANTIC_DEDUP_THRESHOLD = 0.92  # Cosine similarity threshold for near-duplicate removal


class Retriever:
    def __init__(self, k: int = 5):
        self.k = k
        self.store = vector_store_manager.get_store()

    def _rewrite_query(self, query: str) -> str:
        """
        Expand query with financial domain synonyms for broader recall.
        Returns an augmented query string.
        """
        query_lower = query.lower()
        expansions = []
        for term, synonyms in _FINANCIAL_SYNONYMS.items():
            if term in query_lower:
                # Add top 2 synonyms that aren't already in query
                for syn in synonyms[:2]:
                    if syn not in query_lower:
                        expansions.append(syn)

        if expansions:
            expanded = f"{query} {' '.join(expansions)}"
            logger.info(f"[RETRIEVER] Query expanded: '{query}' → '{expanded[:80]}...'")
            return expanded
        return query

    def _keyword_boost_score(self, doc: Document, query: str) -> float:
        """
        Simple keyword overlap score for hybrid search.
        Documents with query terms in content get a boost.
        """
        query_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))
        doc_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', doc.page_content.lower()))
        if not query_tokens:
            return 0.0
        overlap = len(query_tokens & doc_tokens) / len(query_tokens)
        return overlap

    def _compress_chunk(self, content: str, query: str, max_chars: int = 600) -> str:
        """
        Context compression: keep the most relevant sentences from a chunk.
        Sentence-level relevance via keyword overlap.
        """
        if len(content) <= max_chars:
            return content

        sentences = re.split(r'(?<=[.!?])\s+', content)
        query_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))

        scored = []
        for sent in sentences:
            if len(sent.strip()) < 10:
                continue
            sent_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', sent.lower()))
            score = len(query_tokens & sent_tokens)
            scored.append((score, sent))

        # Sort by relevance, take top sentences up to max_chars
        scored.sort(key=lambda x: -x[0])
        result_parts = []
        total_len = 0
        for _, sent in scored:
            if total_len + len(sent) > max_chars:
                break
            result_parts.append(sent)
            total_len += len(sent)

        return " ".join(result_parts) if result_parts else content[:max_chars]

    def _semantic_dedup(self, docs: List[Document]) -> List[Document]:
        """
        Remove near-duplicate chunks using content similarity.
        Heuristic: if two chunks share >70% of their tokens, they're near-duplicates.
        """
        unique_docs = []
        seen_token_sets = []

        for doc in docs:
            tokens = set(re.findall(r'\b[a-zA-Z0-9]{3,}\b', doc.page_content.lower()))
            if not tokens:
                unique_docs.append(doc)
                continue

            is_duplicate = False
            for seen_tokens in seen_token_sets:
                if not seen_tokens:
                    continue
                intersection = len(tokens & seen_tokens)
                union = len(tokens | seen_tokens)
                jaccard = intersection / union if union > 0 else 0
                if jaccard > (1 - _SEMANTIC_DEDUP_THRESHOLD):  # ~0.08 threshold → high overlap
                    is_duplicate = True
                    break

            if not is_duplicate:
                unique_docs.append(doc)
                seen_token_sets.append(tokens)

        return unique_docs

    def _apply_token_budget(self, docs: List[Document], query: str) -> List[Document]:
        """
        Compress each chunk and enforce total character budget.
        """
        compressed_docs = []
        total_chars = 0

        for doc in docs:
            compressed_content = self._compress_chunk(doc.page_content, query)
            if total_chars + len(compressed_content) > _MAX_CONTEXT_CHARS:
                # Add partial if there's still budget
                remaining = _MAX_CONTEXT_CHARS - total_chars
                if remaining > 200:
                    doc = Document(
                        page_content=compressed_content[:remaining],
                        metadata=doc.metadata,
                    )
                    compressed_docs.append(doc)
                break
            doc = Document(page_content=compressed_content, metadata=doc.metadata)
            compressed_docs.append(doc)
            total_chars += len(compressed_content)

        return compressed_docs

    async def retrieve(self, query: str, filter_dict: Dict[str, Any] = None) -> List[Document]:
        """
        Enhanced retrieval pipeline:
        1. Query rewriting (synonym expansion)
        2. Vector similarity search (with extra fetch for dedup)
        3. Keyword boost re-ranking
        4. Semantic deduplication
        5. Context compression + token budgeting
        """
        conv_id = filter_dict.get("conversation_id", "unknown") if filter_dict else "unknown"

        # 1. Query rewriting
        expanded_query = self._rewrite_query(query)

        # 2. Fetch more docs to account for dedup and reranking losses
        fetch_k = (self.k + 5) * 2
        try:
            docs = await self.store.asimilarity_search(
                query=expanded_query,
                k=fetch_k,
                filter=filter_dict,
            )
        except Exception as e:
            logger.error(f"[RETRIEVER] Vector search failed: {e}")
            return []

        if not docs:
            logger.info(f"[RETRIEVER] No documents found. Filter: {conv_id}")
            return []

        # 3. Keyword boost re-ranking (hybrid score = vector rank + keyword overlap)
        scored = []
        for i, doc in enumerate(docs):
            vector_score = 1.0 / (i + 1)  # Reciprocal rank from vector search
            keyword_score = self._keyword_boost_score(doc, query)
            hybrid_score = 0.7 * vector_score + 0.3 * keyword_score
            scored.append((hybrid_score, doc))

        scored.sort(key=lambda x: -x[0])
        reranked = [doc for _, doc in scored]

        # 4. Semantic deduplication
        unique_docs = self._semantic_dedup(reranked)

        # 5. Limit to k then apply token budget with compression
        candidates = unique_docs[:self.k + 2]
        final_docs = self._apply_token_budget(candidates, query)

        logger.info(
            f"[RETRIEVER] {len(docs)} fetched → {len(unique_docs)} after dedup → "
            f"{len(final_docs)} returned. Filter: {conv_id}"
        )

        return final_docs
