import re
with open("frontend/src/App.jsx", "r") as f:
    content = f.read()

# Fix the component prop passing
content = content.replace("attackData={scenarioData?.attack_analysis}", "attackData={scenarioData?.threat_model}")
content = content.replace("trace={scenarioData?.trace}", "trace={scenarioData?.trajectory}")
content = content.replace("dag={scenarioData?.dag}", "dag={scenarioData?.evidence}")

with open("frontend/src/App.jsx", "w") as f:
    f.write(content)
