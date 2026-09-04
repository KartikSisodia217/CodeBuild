from fastapi.testclient import TestClient
from backend.main import app
import json

client = TestClient(app)
manifest = {
    "project_name": "langgraph_test_benign",
    "source_type": "local_fixture",
    "repository": "tests.fixtures.langgraph_test_project.benign_agent:graph",
    "agentic": True,
    "supported": True,
    "integration_type": "langgraph"
}
response = client.post(
    "/api/scan",
    json={"agent_name": "Customer Support Agent", "attack_profile": "Adaptive Adversarial Testing (ASI01)", "environment": "Synthetic Sandbox", "project_manifest": manifest}
)
print(json.dumps(response.json()["evaluation"], indent=2))
