import re
with open("backend/agentveto/runtime.py", "r") as f:
    content = f.read()

new_list_func = """import dataclasses
def list_fixture_scenarios() -> list[dict]:
    return [
        {"id": k, **dataclasses.asdict(v), "execution_mode": "deterministic_fixture"}
        for k, v in SCENARIOS.items()
    ]"""

content = re.sub(r'def list_fixture_scenarios\(\) -> list\[dict\]:.*?for k, v in SCENARIOS_CATALOG\.items\(\)\n    \]', new_list_func, content, flags=re.DOTALL)

with open("backend/agentveto/runtime.py", "w") as f:
    f.write(content)
