import os
import tempfile
import urllib.request
import urllib.parse
from typing import Tuple
from pathlib import Path
from agentveto.ingestion.extractor import safe_extract, ExtractionError

def parse_github_url(url: str) -> Tuple[str, str, str]:
    """Parses a GitHub URL and returns owner, repo, and a download URL.
    Validates that it's a github.com URL, not a private/internal endpoint.
    """
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ('http', 'https'):
        raise ValueError("Invalid URL scheme. Only http and https are allowed.")
    if parsed.hostname != 'github.com':
        raise ValueError("Only github.com URLs are supported.")
        
    path_parts = parsed.path.strip('/').split('/')
    if len(path_parts) < 2:
        raise ValueError("URL must include owner and repository.")
        
    owner, repo = path_parts[0], path_parts[1]
    if repo.endswith('.git'):
        repo = repo[:-4]
        
    download_url = f"https://api.github.com/repos/{owner}/{repo}/zipball/HEAD"
    
    return owner, repo, download_url

import httpx

def fetch_github_repo(url: str, extract_dir: str) -> Tuple[str, str]:
    """Fetches a github repository into the extract_dir and returns the repository string and revision (SHA).
    """
    owner, repo, download_url = parse_github_url(url)
    
    with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp:
        zip_path = tmp.name
        
    try:
        try:
            with httpx.stream("GET", download_url, headers={'User-Agent': 'AgentVeto'}, follow_redirects=True, timeout=30.0) as response:
                if response.status_code == 404:
                    raise ExtractionError(f"GitHub repository '{owner}/{repo}' not found.")
                elif response.status_code == 403 or response.status_code == 429:
                    raise ExtractionError("GitHub API rate limit exceeded.")
                response.raise_for_status()
                
                with open(zip_path, 'wb') as out_file:
                    bytes_read = 0
                    max_bytes = 50 * 1024 * 1024 # 50 MB limit for the zip file itself
                    for chunk in response.iter_bytes(chunk_size=8192):
                        bytes_read += len(chunk)
                        if bytes_read > max_bytes:
                            raise ExtractionError(f"Repository archive exceeds maximum allowed size ({max_bytes / 1024 / 1024} MB).")
                        out_file.write(chunk)
        except httpx.RequestError as e:
            raise ExtractionError(f"Network error while communicating with GitHub: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise ExtractionError(f"GitHub returned an unexpected status code: {e.response.status_code}")
            
        safe_extract(zip_path, extract_dir)
        
        extracted_dirs = list(Path(extract_dir).iterdir())
        revision = "HEAD"
        if len(extracted_dirs) == 1 and extracted_dirs[0].is_dir():
            dirname = extracted_dirs[0].name
            parts = dirname.split('-')
            if len(parts) >= 3:
                revision = parts[-1]
                
        return f"{owner}/{repo}", revision
    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)
