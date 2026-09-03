import re

with open('backend/agentveto/runtime.py', 'r') as f:
    content = f.read()

# Replace run_project method with nothing. 
# We can find the definition and delete until _fixture_runner = DeterministicFixtureRunner()
new_content = re.sub(r'    def run_project\(self, manifest: Any\) -> Dict\[str, Any\]:.*?(?=_fixture_runner = DeterministicFixtureRunner\(\))', '', content, flags=re.DOTALL)

with open('backend/agentveto/runtime.py', 'w') as f:
    f.write(new_content)

