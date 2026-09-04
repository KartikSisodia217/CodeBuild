class LedgerAIException(Exception):
    """Base exception for all LedgerAI custom exceptions."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class AgentExecutionError(LedgerAIException):
    """Raised when an AI agent fails to execute properly."""
    def __init__(self, message: str, agent_name: str):
        super().__init__(message, code="AGENT_ERROR")
        self.agent_name = agent_name

class ToolExecutionError(LedgerAIException):
    """Raised when a tool (e.g., Python Sandbox) fails to execute."""
    def __init__(self, message: str, tool_name: str):
        super().__init__(message, code="TOOL_ERROR")
        self.tool_name = tool_name

class VerificationError(LedgerAIException):
    """Raised when the Verification agent flags an unresolvable issue."""
    def __init__(self, message: str):
        super().__init__(message, code="VERIFICATION_ERROR")
