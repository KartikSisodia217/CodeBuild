from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseProvider(ABC):
    """Abstract base class for all LLM providers."""
    
    @abstractmethod
    async def generate_structured(self, prompt: str, schema: type) -> Any:
        """Generate structured output conforming to a Pydantic schema."""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        """Generate unstructured text."""
        pass
