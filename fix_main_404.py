import re
with open("backend/main.py", "r") as f:
    content = f.read()

new_logic = """    if scenario_id not in ["zero_click_echoleak", "benign_support_flow"]:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown controlled fixture scenario '{scenario_id}'."
        )
    repository = "tests.fixtures.langgraph_test_project.agent:graph\""""

content = re.sub(r'    repository = "tests.fixtures.langgraph_test_project.agent:graph"', new_logic, content)

with open("backend/main.py", "w") as f:
    f.write(content)
