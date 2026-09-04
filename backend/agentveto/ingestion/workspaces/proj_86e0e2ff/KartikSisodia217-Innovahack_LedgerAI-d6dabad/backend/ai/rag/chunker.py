import re
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentChunker:
    """
    Document chunker that splits text by page boundaries and financial sections,
    enriching each chunk with metadata for improved RAG retrieval.
    """
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def chunk_text(self, text: str, metadata: dict = None) -> List[Document]:
        metadata = metadata or {}
        
        # 1. Parse overall document type
        document_type = "unknown"
        doc_type_match = re.match(r'^\[DOCUMENT_TYPE:\s*([A-Z]+)\]\s*\n', text)
        if doc_type_match:
            document_type = doc_type_match.group(1).lower()
            text = text[doc_type_match.end():]
        elif text.startswith("Error:"):
            # If text is an extraction error message, ingest it as a single error chunk
            return [Document(
                page_content=text,
                metadata={
                    "conversation_id": metadata.get("conversation_id", "global"),
                    "document_id": metadata.get("document_id", ""),
                    "filename": metadata.get("file_name", metadata.get("filename", "unknown")),
                    "page_number": 1,
                    "chunk_index": 0,
                    "document_type": "error",
                    "financial_section": "Error"
                }
            )]

        # 2. Split text by page boundary delimiters (e.g. === PAGE X ===)
        page_pattern = r'=== PAGE (\d+) ===\s*\n'
        pages_split = re.split(page_pattern, text)
        
        pages = []
        if len(pages_split) <= 1:
            # If no page delimiters are found, treat the entire text as page 1
            pages.append((1, text))
        else:
            # re.split returns [prefix, page_num_1, page_content_1, page_num_2, page_content_2, ...]
            # If there's any text before the first page boundary, treat it as page 1
            if pages_split[0].strip():
                pages.append((1, pages_split[0]))
                
            for i in range(1, len(pages_split), 2):
                if i + 1 < len(pages_split):
                    page_num = int(pages_split[i])
                    page_content = pages_split[i + 1]
                    pages.append((page_num, page_content))

        # 3. Split by financial section tags within each page
        chunks: List[Document] = []
        chunk_idx = 0
        filename = metadata.get("file_name", metadata.get("filename", "unknown"))
        
        for page_num, page_content in pages:
            # Split page by [SECTION: Section Name]
            section_pattern = r'\[SECTION:\s*([^\]]+)\]\s*\n'
            sections_split = re.split(section_pattern, page_content)
            
            sections = []
            # Text before any section marker gets default section "General"
            first_block = sections_split[0]
            if first_block.strip():
                sections.append(("General", first_block))
                
            for i in range(1, len(sections_split), 2):
                if i + 1 < len(sections_split):
                    sec_name = sections_split[i].strip()
                    sec_text = sections_split[i + 1]
                    if sec_text.strip():
                        sections.append((sec_name, sec_text))
            
            # If no section blocks are parsed, default the entire page to "General"
            if not sections and page_content.strip():
                sections.append(("General", page_content))
                
            # Create chunks for each page-section block
            for sec_name, sec_text in sections:
                sec_text_clean = sec_text.strip()
                if not sec_text_clean:
                    continue
                
                # Split the block if it exceeds chunk size limits
                sub_docs = self.splitter.create_documents([sec_text_clean])
                for sub_doc in sub_docs:
                    chunk_metadata = {
                        "conversation_id": metadata.get("conversation_id", "global"),
                        "document_id": metadata.get("document_id", ""),
                        "filename": filename,
                        "page_number": page_num,
                        "chunk_index": chunk_idx,
                        "document_type": document_type,
                        "financial_section": sec_name
                    }
                    
                    chunks.append(Document(
                        page_content=sub_doc.page_content,
                        metadata=chunk_metadata
                    ))
                    chunk_idx += 1

        # Fallback if no chunks were generated at all
        if not chunks:
            chunks.append(Document(
                page_content="[Empty Document]",
                metadata={
                    "conversation_id": metadata.get("conversation_id", "global"),
                    "document_id": metadata.get("document_id", ""),
                    "filename": filename,
                    "page_number": 1,
                    "chunk_index": 0,
                    "document_type": document_type,
                    "financial_section": "General"
                }
            ))

        return chunks
