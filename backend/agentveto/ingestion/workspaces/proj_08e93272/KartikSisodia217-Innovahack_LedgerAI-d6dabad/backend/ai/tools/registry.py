from typing import Dict, Any, List, Callable
from pydantic import BaseModel
import time
import logging

logger = logging.getLogger(__name__)

class ToolDefinition(BaseModel):
    name: str
    description: str
    inputs: List[str]
    outputs: List[str]
    version: str = "1.0.0"
    handler: Callable

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(self, tool: ToolDefinition):
        self._tools[tool.name] = tool
        logger.debug(f"Registered deterministic tool: {tool.name}")

    def execute(self, name: str, **kwargs) -> Dict[str, Any]:
        if name not in self._tools:
            raise ValueError(f"Tool {name} not found in registry.")
        
        tool = self._tools[name]
        start_time = time.time()
        
        try:
            result = tool.handler(**kwargs)
            duration_ms = (time.time() - start_time) * 1000
            
            # Ensure the output is a dictionary
            if not isinstance(result, dict):
                result = {"result": result}
                
            return {
                "success": True,
                "tool_name": name,
                "result": result,
                "execution_time_ms": duration_ms
            }
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(f"Tool {name} execution failed: {str(e)}", exc_info=True)
            return {
                "success": False,
                "tool_name": name,
                "error": str(e),
                "execution_time_ms": duration_ms
            }

    def get_all_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())
        
    def get_tool(self, name: str) -> ToolDefinition:
        if name not in self._tools:
            raise ValueError(f"Tool {name} not found")
        return self._tools[name]

# Global instance
registry = ToolRegistry()
