import os
import re
import uuid
import asyncio
import unicodedata
from typing import Optional, Tuple
from fastapi import UploadFile


class OCRFailureError(Exception):
    def __init__(self, message: str, metadata: dict = None):
        super().__init__(message)
        self.metadata = metadata or {}


class OCRValidator:
    """Phase 6: Validates OCR text and computes an ocr_quality_score (0-100)."""
    
    @staticmethod
    def validate_and_score(text: str) -> Tuple[str, float]:
        score = 100.0
        
        # 1. Date validation (e.g., "01/O1/2024" — letter O instead of 0)
        date_corruption_pattern = re.compile(r'\b\d{1,2}/[OolI]1?/\d{2,4}\b|\b[OolI]1?/\d{1,2}/\d{2,4}\b', re.IGNORECASE)
        date_corruptions = date_corruption_pattern.findall(text)
        if date_corruptions:
            score -= len(date_corruptions) * 10
            
        # 2. Number validation (e.g., "1O,000" or "1,OOO")
        # Looks for combinations of digits and letters that resemble corrupted numbers
        num_corruption_pattern = re.compile(r'\b\d{1,3},?[OolI]{1,3},?\d{3}\b', re.IGNORECASE)
        num_corruptions = num_corruption_pattern.findall(text)
        if num_corruptions:
            score -= len(num_corruptions) * 10
            
        # 3. Total cross-validation (heuristic)
        # Find "Total" followed by a number. Sum preceding numbers and compare.
        # This is a simplified check for the raw OCR text gate.
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if re.search(r'(?i)\btotal\b', line):
                total_match = re.search(r'([\d,]+\.\d{2})', line)
                if total_match:
                    try:
                        stated_total = float(total_match.group(1).replace(',', ''))
                        # Look at the 5 lines preceding for numbers
                        preceding_nums = []
                        for prev_line in lines[max(0, i-5):i]:
                            nums = re.findall(r'([\d,]+\.\d{2})', prev_line)
                            for n in nums:
                                preceding_nums.append(float(n.replace(',', '')))
                        if preceding_nums:
                            computed_sum = sum(preceding_nums)
                            if abs(computed_sum - stated_total) > 1.0 and stated_total not in preceding_nums:
                                # Found a discrepancy
                                score -= 15
                    except ValueError:
                        pass
        
        # 4. Low density / gibberish check
        # If < 20% of the characters are alphanumeric, it's likely a bad scan
        alnum_count = sum(1 for c in text if c.isalnum())
        if len(text) > 0 and (alnum_count / len(text)) < 0.2:
            score -= 30
            
        # 5. Suspicious repeating character patterns (e.g. "iii", "|||", "___")
        if re.search(r'([iI|_\-\~]){4,}', text):
            score -= 10
            
        score = max(0.0, min(100.0, score))
        return text, score


class OCRService:
    """
    Service for extracting raw text from uploaded financial documents.
    Supports digital PDFs, scanned PDFs (via OCR), mixed PDFs, and images.
    """
    
    def __init__(self, storage_dir: str = None):
        if storage_dir is None:
            from backend.core.paths import get_upload_dir
            self.storage_dir = get_upload_dir()
        else:
            self.storage_dir = storage_dir
            os.makedirs(self.storage_dir, exist_ok=True)

    async def save_file(self, file: UploadFile) -> str:
        """Saves an uploaded file to local blob storage and returns the S3/local URI."""
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.storage_dir, unique_filename)
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        return file_path

    def _normalize_text(self, text: str) -> str:
        """Normalizes unicode characters, line endings, and layout whitespaces."""
        if not text:
            return ""
        # Normalize malformed Unicode characters
        text = unicodedata.normalize('NFKC', text)
        
        # Standardize carriage returns
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        
        lines = []
        for line in text.split('\n'):
            # Strip trailing whitespace on each line
            line = line.rstrip()
            if not line:
                lines.append('')
                continue
            
            # Remove page number headers/footers pattern (e.g. Page 1 of 5)
            line = re.sub(r'(?i)\bpage\s+\d+(\s+of\s+\d+)?\b', '', line)
            
            # Preserve spacing >= 2 to maintain tabular structure, collapse single spaces
            line = re.sub(r' {2,}', '  ', line)
            lines.append(line.strip() if not line.startswith(' ') else line)
            
        return '\n'.join(lines)

    def _detect_and_tag_sections(self, text: str) -> str:
        """Detects key financial sections in the text and injects section markers."""
        lines = text.split("\n")
        tagged_lines = []
        current_section = "General"
        
        # Financial section patterns mapped to standardized labels
        section_patterns = [
            (r'(?i)\baccount\s+summary\b|\bstatement\s+summary\b|\bsummary\s+of\s+accounts\b', "Account Summary"),
            (r'(?i)\bbeginning\s+balance\b|\bstarting\s+balance\b|\bprevious\s+balance\b', "Beginning Balance"),
            (r'(?i)\bending\s+balance\b|\bnew\s+balance\b|\bcurrent\s+balance\b', "Ending Balance"),
            (r'(?i)\bdeposits\b|\bcredits\b|\badditions\b|\belectronic\s+deposits\b', "Deposits"),
            (r'(?i)\bwithdrawals\b|\bdebits\b|\bsubtractions\b|\belectronic\s+withdrawals\b|\bpayments\b', "Debits"),
            (r'(?i)\btransaction\s+detail\b|\btransaction\s+history\b|\bdaily\s+transaction\b|\btransaction\b|\bpost\s+date\b|\bval\s+date\b', "Transactions"),
            (r'(?i)\bchecks\b|\bchecks\s+paid\b|\bcleared\s+checks\b', "Checks"),
            (r'(?i)\bservice\s+charges\b|\bfees\b|\binterest\s+charges\b|\bfinance\s+charges\b|\bcard\s+fees\b', "Fees"),
        ]
        
        for line in lines:
            stripped = line.strip()
            # If line is a heading matching a section pattern
            for pattern, sec_name in section_patterns:
                if re.search(pattern, stripped):
                    if current_section != sec_name:
                        tagged_lines.append(f"[SECTION: {sec_name}]")
                        current_section = sec_name
                    break
            tagged_lines.append(line)
            
        return "\n".join(tagged_lines)

    def _strip_repeating_headers_footers(self, pages_text: list[str]) -> list[str]:
        """Dynamically identifies and removes repeating headers/footers across pages."""
        if len(pages_text) < 3:
            return pages_text
            
        header_lines_count = {}
        footer_lines_count = {}
        
        for page_text in pages_text:
            lines = [line.strip() for line in page_text.split('\n') if line.strip()]
            headers = lines[:3]
            footers = lines[-3:]
            
            for h in headers:
                header_lines_count[h] = header_lines_count.get(h, 0) + 1
            for f in footers:
                footer_lines_count[f] = footer_lines_count.get(f, 0) + 1
                
        # Threshold: line appears in more than 50% of the pages
        threshold = len(pages_text) / 2
        common_headers = {h for h, count in header_lines_count.items() if count > threshold}
        common_footers = {f for f, count in footer_lines_count.items() if count > threshold}
        
        cleaned_pages = []
        for page_text in pages_text:
            lines = page_text.split('\n')
            cleaned_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped in common_headers or stripped in common_footers:
                    continue
                cleaned_lines.append(line)
            cleaned_pages.append('\n'.join(cleaned_lines))
            
        return cleaned_pages

    async def extract_text(self, file_path: str) -> Tuple[str, float]:
        """
        Extracts raw text from the document.
        Automatically detects image-based PDFs and runs OCR if needed.
        Returns: (extracted_text, ocr_quality_score)
        Raises: OCRFailureError if extraction fails.
        """
        from backend.observability.logger import logger
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            raise OCRFailureError("File not found.", metadata={"file_path": file_path})

        file_extension = os.path.splitext(file_path)[1].lower()
        extracted_text = ""
        
        # Handle directly uploaded images
        if file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            try:
                import pytesseract
                from PIL import Image
                
                logger.info(f"Ingesting image file directly: {file_path}")
                img = Image.open(file_path)
                # Normalize image orientation and convert to RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                    
                # Run OCR
                loop = asyncio.get_event_loop()
                text = await loop.run_in_executor(
                    None, 
                    lambda: pytesseract.image_to_string(img, config='--psm 3')
                )
                
                normalized = self._normalize_text(text)
                tagged = self._detect_and_tag_sections(normalized)
                
                extracted_text = (
                    "[DOCUMENT_TYPE: SCANNED]\n"
                    "=== PAGE 1 ===\n"
                    f"{tagged}"
                )
            except Exception as e:
                logger.error(f"Image OCR failed for {file_path}: {e}")
                if "tesseract" in str(e).lower() or "not found" in str(e).lower():
                    raise OCRFailureError(
                        "OCR/Tesseract binary is not installed or configured on the system.",
                        metadata={"error": str(e)}
                    )
                raise OCRFailureError(f"Failed to perform OCR on image. Details: {e}", metadata={"error": str(e)})

        # Handle PDF documents
        elif file_extension == '.pdf':
            try:
                import fitz
                import pytesseract
                from PIL import Image
                from io import BytesIO
            except ImportError as e:
                logger.error(f"Missing import for PDF processing: {e}")
                raise OCRFailureError(f"Missing required Python dependencies. Details: {e}", metadata={"error": str(e)})

            try:
                doc = fitz.open(file_path)
            except Exception as e:
                logger.error(f"Failed to open PDF {file_path}: {e}")
                raise OCRFailureError("Corrupted or invalid PDF file.", metadata={"error": str(e)})

            if doc.is_encrypted:
                doc.close()
                logger.error(f"PDF is encrypted: {file_path}")
                raise OCRFailureError("Password-protected PDF file.", metadata={"encrypted": True})

            pages_raw = []
            ocr_pages_count = 0
            digital_pages_count = 0
            total_pages = len(doc)
            
            if total_pages == 0:
                doc.close()
                raise OCRFailureError("Empty document.", metadata={"pages": 0})

            try:
                for page in doc:
                    page_idx = page.number + 1
                    # Try digital text extraction first
                    text = page.get_text("text", sort=True)
                    
                    # If page contains almost no text, switch to OCR for this page
                    if len(text.strip()) < 50:
                        logger.info(f"Page {page_idx} of {file_path} appears scanned. Running OCR...")
                        
                        # Render page at 2x resolution (approx 150-200 DPI) for high accuracy OCR
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                        img = Image.open(BytesIO(pix.tobytes("png")))
                        
                        loop = asyncio.get_event_loop()
                        ocr_text = await loop.run_in_executor(
                            None, 
                            lambda: pytesseract.image_to_string(img, config='--psm 3')
                        )
                        pages_raw.append(ocr_text)
                        ocr_pages_count += 1
                    else:
                        pages_raw.append(text)
                        digital_pages_count += 1
            except Exception as e:
                logger.error(f"OCR execution failed on page loop: {e}")
                doc.close()
                if "tesseract" in str(e).lower() or "not found" in str(e).lower():
                    raise OCRFailureError(
                        "OCR/Tesseract binary is not installed or configured on the system.",
                        metadata={"error": str(e)}
                    )
                raise OCRFailureError(f"Ingestion failed during page processing. Details: {e}", metadata={"error": str(e)})

            doc.close()

            # Clean and normalize pages
            cleaned_pages = self._strip_repeating_headers_footers(pages_raw)
            
            final_text_parts = []
            
            # Determine overall document type
            if ocr_pages_count > 0 and digital_pages_count > 0:
                doc_type = "MIXED"
            elif ocr_pages_count > 0:
                doc_type = "SCANNED"
            else:
                doc_type = "DIGITAL"
                
            final_text_parts.append(f"[DOCUMENT_TYPE: {doc_type}]")
            
            for i, page_raw in enumerate(cleaned_pages):
                page_num = i + 1
                normalized = self._normalize_text(page_raw)
                tagged = self._detect_and_tag_sections(normalized)
                
                final_text_parts.append(f"=== PAGE {page_num} ===")
                final_text_parts.append(tagged)
                
            extracted_text = "\n".join(final_text_parts)
        else:
            logger.error(f"Unsupported file type: {file_extension}")
            raise OCRFailureError(f"Unsupported file format '{file_extension}'.", metadata={"extension": file_extension})

        # Phase 6: Validate and score the OCR output
        validated_text, quality_score = OCRValidator.validate_and_score(extracted_text)
        
        return validated_text, quality_score
