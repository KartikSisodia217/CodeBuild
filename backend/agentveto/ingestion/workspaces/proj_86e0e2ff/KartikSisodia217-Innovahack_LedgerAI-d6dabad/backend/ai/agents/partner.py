from typing import Dict, Any
from backend.ai.agents.base import BaseAgent
from backend.ai.memory.blackboard import BlackboardState

class PartnerAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="partner")

    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        prompt = self.prompt_manager.load_prompt(self.agent_name, user_query=state.raw_text)
        
        # We need a routing decision schema. Since the partner doesn't have a dedicated schema file yet,
        # we will use a Pydantic model defined here.
        from pydantic import BaseModel
        class PartnerRouting(BaseModel):
            routing_decision: str
            
        result = await self.provider.generate_structured(prompt, PartnerRouting)
        return {"routing_decision": result.routing_decision}
