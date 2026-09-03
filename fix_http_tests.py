import re

for filename in ["tests/test_github_ingestion.py", "tests/test_project_ingestion.py", "tests/test_upload_fallback.py"]:
    with open(filename, "r") as f:
        content = f.read()

    # Undo the overly broad replacement for HTTP errors
    content = content.replace('response.json()["metadata"]["message"]', 'response.json().get("detail", response.json().get("metadata", {}).get("message", ""))')
    content = content.replace('scan_resp.json()["metadata"]["message"]', 'scan_resp.json().get("detail", scan_resp.json().get("metadata", {}).get("message", ""))')

    with open(filename, "w") as f:
        f.write(content)
