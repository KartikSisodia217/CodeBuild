import re
with open("tests/test_api_endpoints.py", "r") as f:
    content = f.read()

content = content.replace('data["evidence"]["dag"]', 'data["evidence"]')

with open("tests/test_api_endpoints.py", "w") as f:
    f.write(content)
