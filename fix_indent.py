import re
with open("backend/main.py", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "from fastapi import HTTPException, status" in line or "raise HTTPException(" in line or "status_code=status.HTTP_404_NOT_FOUND," in line or "detail=f\"Unknown controlled fixture scenario" in line or (line.strip() == ")" and "detail=" in lines[i-1]):
        # Add 4 spaces
        lines[i] = "    " + line

with open("backend/main.py", "w") as f:
    f.writelines(lines)
