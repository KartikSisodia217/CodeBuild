import os
import zipfile
from pathlib import Path
from typing import Optional, Set

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES = 1000
MAX_EXTRACTED_SIZE = 50 * 1024 * 1024  # 50 MB

class ExtractionError(Exception):
    pass

DEFAULT_EXCLUDED_DIRS = {
    '.git',
    '__pycache__',
    'node_modules',
    '.venv',
    'venv',
    'env',
    'dist',
    'build',
    'chroma_db'
}

DEFAULT_EXCLUDED_EXTENSIONS = {
    '.pyc',
    '.sqlite',
    '.sqlite3',
    '.db',
    '.wasm',
    '.so',
    '.dylib',
    '.dll',
    '.exe',
    '.bin',
    '.o',
    '.obj',
    '.a',
    '.lib',
    '.class'
}

def should_exclude(filename: str, excluded_dirs: Set[str], excluded_extensions: Set[str]) -> bool:
    path = Path(filename)
    if path.suffix in excluded_extensions:
        return True
    for part in path.parts:
        if part in excluded_dirs:
            return True
    return False

def safe_extract(zip_path: str, extract_to: str, excluded_dirs: Optional[Set[str]] = None, excluded_extensions: Optional[Set[str]] = None) -> None:
    extract_dir = Path(extract_to)
    extract_dir.mkdir(parents=True, exist_ok=True)
    
    if excluded_dirs is None:
        excluded_dirs = DEFAULT_EXCLUDED_DIRS
    if excluded_extensions is None:
        excluded_extensions = DEFAULT_EXCLUDED_EXTENSIONS
        
    total_extracted_size = 0
    extracted_files = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
                
            # Protect against absolute paths and path traversal
            if info.filename.startswith('/') or '..' in info.filename:
                raise ExtractionError(f"Malicious archive path detected: {info.filename}")
            
            if should_exclude(info.filename, excluded_dirs, excluded_extensions):
                continue
                
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
