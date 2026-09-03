import os
from pathlib import Path
from backend.exceptions.base import LedgerAIException

class PromptManager:
    """Utility class to load markdown prompt templates."""
    
    def __init__(self, prompts_dir: str = None):
        if prompts_dir is None:
            # Default to the current directory relative to this file
            base_path = Path(__file__).parent
            self.prompts_dir = base_path
        else:
            self.prompts_dir = Path(prompts_dir)
            
    def load_prompt(self, agent_name: str, **kwargs) -> str:
        """
        Loads a markdown prompt file and formats it with kwargs.
        Raises an exception if the prompt file does not exist.
        """
        file_path = self.prompts_dir / f"{agent_name}.md"
        
        if not file_path.exists():
            raise LedgerAIException(f"Prompt file not found for agent: {agent_name} at {file_path}", code="PROMPT_NOT_FOUND")
            
        with open(file_path, "r", encoding="utf-8") as f:
            template = f.read()
            
        try:
            return template.format(**kwargs)
        except KeyError as e:
            raise LedgerAIException(f"Missing format key {e} for prompt {agent_name}.md", code="PROMPT_FORMAT_ERROR")

prompt_manager = PromptManager()
