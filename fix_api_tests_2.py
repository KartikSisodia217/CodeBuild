import re
import glob

for filename in glob.glob("tests/test_*.py"):
    with open(filename, "r") as f:
        content = f.read()

    replacements = {
        'scan_resp.json()["detail"]': 'scan_resp.json()["metadata"]["message"]',
        'response.json()["detail"]': 'response.json()["metadata"]["message"]',
        'data["reason"]': 'data["metadata"]["reason"]',
        'response_veto.json()["scenario_details"]["evaluation"]["status"]': 'response_veto.json()["evaluation"]["status"]',
        'details = data["scenario_details"]': 'details = data',
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filename, "w") as f:
        f.write(content)
