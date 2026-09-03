import re
with open("frontend/src/components/RegressionView.jsx", "r") as f:
    content = f.read()

content = content.replace("data.yaml_content", "data.metadata?.yaml_content")
content = content.replace("data.scenario_id", "data.run_id")

with open("frontend/src/components/RegressionView.jsx", "w") as f:
    f.write(content)
