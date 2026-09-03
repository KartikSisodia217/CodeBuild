import re

with open("frontend/src/components/RunOverview.jsx", "r") as f:
    content = f.read()

# Replace evaluation.status checks with data.status or evaluation?.status checks
# The backend now returns a `ScanResult` object where `status` is the lifecycle state (NOT_AGENTIC, etc)
# and `verdict` is the security outcome (PASS, VETO).
# So we should check `data.status` for lifecycle, and `data.verdict` for VETO/PASS.

replacements = {
    "evaluation.status === 'CRITICAL_VETO'": "data.verdict === 'VETO'",
    "evaluation.status === 'PASS'": "data.verdict === 'PASS'",
    "evaluation.status === 'UNSUPPORTED'": "data.status === 'UNSUPPORTED'",
    "evaluation.status === 'NOT_AGENTIC'": "data.status === 'NOT_AGENTIC'",
    "evaluation.status === 'EXECUTION_UNAVAILABLE'": "data.status === 'EXECUTION_UNAVAILABLE'",
    "evaluation.status === 'EXECUTION_FAILED'": "data.status === 'EXECUTION_FAILED'",
    "evaluation.status === 'UNSUPPORTED_ENTRYPOINT'": "data.status === 'UNSUPPORTED_ENTRYPOINT'",
    "{evaluation.status}": "{data.verdict || data.status}"
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open("frontend/src/components/RunOverview.jsx", "w") as f:
    f.write(content)
