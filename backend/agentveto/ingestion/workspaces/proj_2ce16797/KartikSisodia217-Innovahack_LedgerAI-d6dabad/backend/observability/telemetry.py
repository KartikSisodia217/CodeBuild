from typing import Any, Dict
from backend.observability.logger import logger

class Telemetry:
    @staticmethod
    def log_agent_execution(agent_name: str, duration_ms: float, tokens_used: int, status: str) -> None:
        """Track agent execution metrics."""
        logger.info(
            f"Agent Execution: {agent_name} | Status: {status} | "
            f"Duration: {duration_ms}ms | Tokens: {tokens_used}"
        )

    @staticmethod
    def log_tool_call(tool_name: str, success: bool, error_msg: str = "") -> None:
        """Track tool call metrics."""
        status = "SUCCESS" if success else "FAILED"
        msg = f"Tool Call: {tool_name} | Status: {status}"
        if error_msg:
            msg += f" | Error: {error_msg}"
        logger.info(msg)

telemetry = Telemetry()
