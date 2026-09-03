import os
import re
import asyncio
from backend.ai.rag.chunker import DocumentChunker
from backend.services.ocr import OCRService

def test_chunker_basic():
    print("Running Chunker Basic Test...")
    chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)
    
    test_text = (
        "[DOCUMENT_TYPE: MIXED]\n"
        "=== PAGE 1 ===\n"
        "Random Header\n"
        "[SECTION: Account Summary]\n"
        "Beginning Balance: $10,000.00\n"
        "Ending Balance: $12,500.00\n"
        "[SECTION: Deposits]\n"
        "Deposit 1: $2,500.00 on 2026-07-01\n"
        "=== PAGE 2 ===\n"
        "[SECTION: Debits]\n"
        "Debit 1: $100.00\n"
        "Debit 2: $200.00\n"
    )
    
    metadata = {
        "file_name": "statement.pdf",
        "conversation_id": "test-conv-123",
        "document_id": "doc-uuid-abc"
    }
    
    chunks = chunker.chunk_text(test_text, metadata)
    
    for i, chunk in enumerate(chunks):
        print(f"\n--- Chunk {i} ---")
        print(f"Content:\n{chunk.page_content}")
        print(f"Metadata: {chunk.metadata}")
        
    # Validations
    assert len(chunks) == 4, f"Expected 4 chunks, got {len(chunks)}"
    
    # Verify metadata fields
    assert chunks[0].metadata["page_number"] == 1
    assert chunks[0].metadata["financial_section"] == "General"
    assert chunks[0].metadata["document_type"] == "mixed"
    
    assert chunks[1].metadata["page_number"] == 1
    assert chunks[1].metadata["financial_section"] == "Account Summary"
    assert chunks[1].metadata["document_type"] == "mixed"
    
    assert chunks[2].metadata["page_number"] == 1
    assert chunks[2].metadata["financial_section"] == "Deposits"
    assert chunks[2].metadata["document_type"] == "mixed"
    
    assert chunks[3].metadata["page_number"] == 2
    assert chunks[3].metadata["financial_section"] == "Debits"
    assert chunks[3].metadata["document_type"] == "mixed"
    
    print("\nBasic Chunker test passed successfully!")

def test_normalization():
    print("\nRunning OCRService Normalization/Section Tagging Test...")
    service = OCRService()
    
    raw_text = (
        "Statement  Summary\n"
        "  Beginning  Balance   $1000.00  \n"
        "Ending  Balance   $2000.00\n"
        "Transaction  Detail\n"
        "  2026-07-01   Salary   $1000.00   credit  \n"
        "Service  Charges\n"
        "Monthly fee $15.00\n"
        "Page 1 of 2"
    )
    
    normalized = service._normalize_text(raw_text)
    tagged = service._detect_and_tag_sections(normalized)
    
    print(f"Tagged Text:\n{tagged}")
    
    # Check sections tagging
    assert "[SECTION: Account Summary]" in tagged
    assert "[SECTION: Beginning Balance]" in tagged
    assert "[SECTION: Ending Balance]" in tagged
    assert "[SECTION: Transactions]" in tagged
    assert "[SECTION: Fees]" in tagged
    
    # Check page numbers removal
    assert "Page 1 of 2" not in tagged
    # Check spacing preservation
    assert "Salary  $1000.00  credit" in tagged or "Salary   $1000.00   credit" in tagged
    
    print("\nOCRService Normalization/Section Tagging test passed successfully!")

async def test_end_to_end_pdf_extraction():
    print("\nRunning End-to-End PDF Ingestion & OCR Test inside Container...")
    import fitz
    
    # 1. Create a Digital PDF
    digital_pdf_path = "test_digital.pdf"
    doc1 = fitz.open()
    page1 = doc1.new_page()
    page1.insert_text((50, 50), "This is a digital page with a lot of text so it does not trigger OCR. It contains some Account Summary data and Ending Balance info.")
    doc1.save(digital_pdf_path)
    doc1.close()
    
    # 2. Create a Scanned PDF (low text, will trigger OCR fallback)
    scanned_pdf_path = "test_scanned.pdf"
    doc2 = fitz.open()
    page2 = doc2.new_page()
    # Insert tiny text that is < 50 chars to simulate a scanned page
    page2.insert_text((100, 100), "Deposits")
    doc2.save(scanned_pdf_path)
    doc2.close()
    
    service = OCRService()
    
    try:
        # Test Digital Extraction
        print("Extracting from digital PDF...")
        text_digital = await service.extract_text(digital_pdf_path)
        print(f"Digital Result:\n{text_digital}\n")
        assert "[DOCUMENT_TYPE: DIGITAL]" in text_digital
        assert "Account Summary" in text_digital
        
        # Test OCR Fallback (on test_scanned.pdf)
        print("Extracting from scanned PDF (triggers OCR)...")
        text_scanned = await service.extract_text(scanned_pdf_path)
        print(f"Scanned Result:\n{text_scanned}\n")
        assert "[DOCUMENT_TYPE: SCANNED]" in text_scanned
        assert "Deposits" in text_scanned or "deposits" in text_scanned.lower()
        
        print("\nEnd-to-End PDF Ingestion and OCR test passed successfully!")
    finally:
        # Clean up files
        if os.path.exists(digital_pdf_path):
            os.remove(digital_pdf_path)
        if os.path.exists(scanned_pdf_path):
            os.remove(scanned_pdf_path)

if __name__ == "__main__":
    test_chunker_basic()
    test_normalization()
    asyncio.run(test_end_to_end_pdf_extraction())
    print("\nALL UNIT AND INTEGRATION TESTS PASSED!")
