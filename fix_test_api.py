import re
with open("tests/test_api_endpoints.py", "r") as f:
    content = f.read()

new_assertions = """    assert data["project_manifest"]["project_name"] == "zero_click_echoleak"
    assert data["evaluation"]["status"] == "VETO"
    assert "nodes" in data["evidence"]["dag"]
    assert "edges" in data["evidence"]["dag"]"""

content = re.sub(r'    assert data\["scenario_id"\] == "zero_click_echoleak".*?assert "version: agentveto/v1" in data\["yaml_content"\]', new_assertions, content, flags=re.DOTALL)

with open("tests/test_api_endpoints.py", "w") as f:
    f.write(content)
