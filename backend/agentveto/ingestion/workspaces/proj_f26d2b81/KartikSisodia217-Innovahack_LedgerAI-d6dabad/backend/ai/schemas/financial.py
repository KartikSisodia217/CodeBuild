from pydantic import BaseModel, Field

class AnalystOutput(BaseModel):
    narrative: str = Field(description="A concise, two-sentence business narrative explaining the cash-flow impact of the transaction.")
