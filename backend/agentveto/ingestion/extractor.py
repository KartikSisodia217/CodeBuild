import os
import zipfile
from pathlib import Path
from typing import Optional

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES = 1000
MAX_EXTRACTED_SIZE = 50 * 1024 * 1024  # 50 MB

class ExtractionError(Exception):
    pass

def safe_extract(zip_path: str, extract_to: str) -> None:
    extract_dir = Path(extract_to)
    extract_dir.mkdir(parents=True, exist_ok=True)
    
    total_extracted_size = 0
    extracted_files = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
                
            # Protect against absolute paths and path traversal
            if info.filename.startswith('/') or '..' in info.filename:
                raise ExtractionError(f"Malicious archive path detected: {info.filename}")
            
            if info.file_size > MAX_FILE_SIZE:
                raise ExtractionError(f"File {info.filename} exceeds maximum size of {MAX_FILE_SIZE} bytes.")
                
            total_extracted_size += info.file_size
            if total_extracted_size > MAX_EXTRACTED_SIZE:
                raise ExtractionError(f"Total extracted size exceeds maximum of {MAX_EXTRACTED_SIZE} bytes.")
                
            extracted_files += 1
            if extracted_files > MAX_FILES:
                raise ExtractionError(f"Number of files exceeds maximum of {MAX_FILES}.")
                
            # Safely extract
            target_path = extract_dir / info.filename
            # Double check to prevent traversal
            if not target_path.resolve().is_relative_to(extract_dir.resolve()):
                 raise ExtractionError(f"Malicious archive path attempted traversal: {info.filename}")
            
            zf.extract(info, extract_dir)
