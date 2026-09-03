import re
with open("frontend/src/components/ScanProgress.jsx", "r") as f:
    content = f.read()

content = content.replace("scanResult?.attack_analysis", "scanResult?.threat_model")
content = content.replace("data.verdict", "scanResult?.verdict")

with open("frontend/src/components/ScanProgress.jsx", "w") as f:
    f.write(content)
