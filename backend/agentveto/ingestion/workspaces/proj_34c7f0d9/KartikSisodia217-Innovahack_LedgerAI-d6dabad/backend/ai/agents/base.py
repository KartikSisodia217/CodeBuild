from abc import ABC, abstractmethod
from typing import Dict, Any
from backend.ai.memory.blackboard import BlackboardState
from backend.ai.providers.factory import ProviderFactory
from backend.ai.prompts.manager import prompt_manager

class BaseAgent(ABC):
    """Abstract base class for all AI Agents in LedgerAI."""
    
    def __init__(self, agent_name: str, provider_name: str = "gemini"):
        self.agent_name = agent_name
        self.provider = ProviderFactory.get_provider(provider_name)
        self.prompt_manager = prompt_manager

    @abstractmethod
    async def invoke(self, state: BlackboardState) -> Dict[str, Any]:
        """
        Executes the agent's logic.
        Must return a dictionary containing the state updates to be merged into the Blackboard.
        """
        pass
