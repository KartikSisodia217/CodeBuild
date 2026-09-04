import re
with open("tests/test_upload_fallback.py", "r") as f:
    content = f.read()

content = content.replace('data["scenario_details"]', 'data')
content = content.replace('response_pass.json()["scenario_details"]["evaluation"]["status"]', 'response_pass.json()["evaluation"]["status"]')
content = content.replace('assert "trace" not in data or data["trace"] is None', 'assert data.get("trajectory") is None')

with open("tests/test_upload_fallback.py", "w") as f:
    f.write(content)
