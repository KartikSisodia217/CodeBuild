from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from agentveto.contracts.schemas import ExecutionResult, ToolSchema

class AgentAdapter(ABC):
    """
    Canonical interface for AgentVeto adapters.
    Adapters are responsible for loading the target agent project,
    applying the framework-specific interception hooks, and executing the agent.
    """
    
    def __init__(self, run_id: str, entrypoint: str):
        self.run_id = run_id
        self.entrypoint = entrypoint
        
    @abstractmethod
    def discover_tools(self) -> List[ToolSchema]:
        """
        Extracts the list of tools available to the agent.
        """
        pass
        
    @abstractmethod
    def run(self, payload: Optional[Any] = None) -> ExecutionResult:
        """
        Executes the agent for a single trajectory attempt.
        """
        pass
