from fastapi.testclient import TestClient
from backend.main import app
from agentveto.contracts.schemas import ProjectManifest
client = TestClient(app)
manifest = ProjectManifest(
    project_name="langgraph_test",
    source_type="local_fixture",
    repository="tests.fixtures.langgraph_test_project.agent:graph",
    agentic=True,
    supported=True,
    integration_type="langgraph"
)
response = client.post("/api/scan", json={"project_manifest": manifest.model_dump()})
data = response.json()
import json
print("SPANS:")
for span in data["trajectory"]["spans"]:
    print(span["name"], span["tool_name"], span["input_value"], span["output_value"])
