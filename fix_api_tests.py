import re
import glob

for filename in glob.glob("tests/test_*.py"):
    with open(filename, "r") as f:
        content = f.read()

    # Replacements for new ScanResult format
    replacements = {
        'data["scenario_details"]["metadata"]': 'data["metadata"]',
        'data["scenario_details"]["evaluation"]': 'data["evaluation"]',
        'data["status"] == "not_agentic"': 'data["status"] == "NOT_AGENTIC"',
        'data["status"] == "unsupported"': 'data["status"] == "UNSUPPORTED"',
        'response_veto.json()["status"] == "completed"': 'response_veto.json()["status"] == "COMPLETED"',
        'assert scan_resp.status_code == 501': 'assert scan_resp.status_code == 200\n    assert scan_resp.json()["status"] == "UNSUPPORTED"',
        'assert response.status_code == 501': 'assert response.status_code == 200\n    assert response.json()["status"] == "UNSUPPORTED"',
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filename, "w") as f:
        f.write(content)
