import re

for filename in ["frontend/src/components/RegressionView.jsx", "frontend/src/components/ScanProgress.jsx"]:
    with open(filename, "r") as f:
        content = f.read()

    replacements = {
        "evaluation.status === 'CRITICAL_VETO'": "data.verdict === 'VETO'",
        "{evaluation.status || 'CRITICAL_VETO'}": "{data.verdict || 'VETO'}"
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filename, "w") as f:
        f.write(content)
