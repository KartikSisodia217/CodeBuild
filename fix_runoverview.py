import re
with open("frontend/src/components/RunOverview.jsx", "r") as f:
    content = f.read()

content = content.replace("data.attack_analysis?", "data.threat_model?")
content = content.replace("data.trace?", "data.trajectory?")
content = content.replace("data.scenario_id", "data.run_id")

with open("frontend/src/components/RunOverview.jsx", "w") as f:
    f.write(content)
