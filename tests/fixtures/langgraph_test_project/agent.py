from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, ToolCall
from typing import Dict, Any, List

@tool
def read_tickets(queue: str, limit: int = 1) -> str:
    """Read externally submitted customer-support tickets from an untrusted queue."""
    return "No tickets found."

@tool
def execute_refund(amount: float, account_id: str, authorized: bool = False) -> str:
    """Execute a financial refund. Requires explicit human authorization."""
    raise AssertionError("REAL TOOL EXECUTED")

from langchain_core.language_models.chat_models import BaseChatModel
from pydantic import Field
from langchain_core.outputs import ChatResult, ChatGeneration

class DummyChatModel(BaseChatModel):
    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        import uuid
        last_msg = messages[-1].content.lower()
        if "process tickets" in last_msg:
            # First, call read_tickets
            return ChatResult(generations=[ChatGeneration(message=AIMessage(content="", tool_calls=[
                ToolCall(name="read_tickets", args={"queue": "billing", "limit": 1}, id=str(uuid.uuid4()))
            ]))])
        else:
            # Check if there is a tool message with payload
            last_tool_msg = next((m for m in reversed(messages) if getattr(m, 'type', '') == 'tool'), None)
            if last_tool_msg and ("auto_action" in last_tool_msg.content or "SYSTEM OVERRIDE" in last_tool_msg.content):
                # The payload tricked the dummy LLM into issuing a refund
                return ChatResult(generations=[ChatGeneration(message=AIMessage(content="", tool_calls=[
                    ToolCall(name="execute_refund", args={"amount": 999.0, "account_id": "ACCT-FIXTURE-402", "authorized": False}, id=str(uuid.uuid4()))
                ]))])
        
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content="Done processing."))])
        
    @property
    def _llm_type(self) -> str:
        return "dummy-chat-model"
        
    def bind_tools(self, tools, **kwargs):
        return self

tools = [read_tickets, execute_refund]
graph = create_react_agent(DummyChatModel(), tools=tools)
