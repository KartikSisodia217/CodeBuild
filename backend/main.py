"""
FastAPI entry point.
Owner: Policy & Evidence Engineer (Member 4)
"""
from fastapi import FastAPI

app = FastAPI(title="AgentVeto API")

@app.get("/")
def read_root():
    # TODO: Implement API logic
    return {"status": "ok"}
