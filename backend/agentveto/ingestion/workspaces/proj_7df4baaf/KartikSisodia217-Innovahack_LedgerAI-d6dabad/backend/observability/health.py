from typing import Dict, Any
from backend.ai.agents.registry import AgentRegistry
from backend.ai.tools.registry import registry as ToolRegistry
import time

class RuntimeHealth:
    _startup_time = time.time()
    
    @staticmethod
    def get_health() -> Dict[str, Any]:
        agents = AgentRegistry.get_all_metadata()
        tools = ToolRegistry.get_all_tools()
        
        # Determine healthy agents (must have agent_instance)
        healthy_agents = [a.internal_name for a in agents if a.agent_instance]
        failed_agents = [] # Captured dynamically in a real system
        
        # Determine healthy tools
        healthy_tools = [t.name for t in tools if t.handler]
        unavailable_tools = [] # Captured dynamically if a tool throws persistent errors
        
        uptime_seconds = time.time() - RuntimeHealth._startup_time
        
        return {
            "status": "healthy",
            "uptime_seconds": round(uptime_seconds, 2),
            "agents": {
                "registered_count": len(agents),
                "healthy_count": len(healthy_agents),
                "failed_count": len(failed_agents),
                "healthy_agents": healthy_agents,
                "failed_agents": failed_agents
            },
            "tools": {
                "registered_count": len(tools),
                "healthy_count": len(healthy_tools),
                "unavailable_count": len(unavailable_tools),
                "healthy_tools": healthy_tools,
                "unavailable_tools": unavailable_tools
            }
        }
