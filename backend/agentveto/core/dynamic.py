"""
Dynamic Interceptor utilities.
Owner: Interception & Trace Engineer (Member 2)
"""
from contextlib import contextmanager
from typing import Generator
import logging
from unittest.mock import patch

from agentveto.core.decorator import intercept

logger = logging.getLogger("agentveto.core.dynamic")

@contextmanager
def dynamic_interception() -> Generator[None, None, None]:
    """
    Safely intercepts known AI framework tool execution methods for the duration of the context.
    Automatically un-patches when the block exits.
    """
    patchers = []
    
    # 1. LangChain / LangGraph BaseTool.invoke
    try:
        from langchain_core.tools import BaseTool
        
        # We need to wrap invoke, but keep the signature intact for our intercept logic
        original_invoke = BaseTool.invoke
        intercepted_invoke = intercept(original_invoke)
        
        # In LangGraph, when BaseTool.invoke returns a string, but the framework expects a ToolMessage,
        # we might need to conform to it. However, the original monkey patch did that mapping.
        # But wait, our `intercept` returns what the Sandbox returns. If the Sandbox returns a Dict/str,
        # does LangChain accept it? 
        # Actually, let's keep the exact behavior of the old monkey patch but dynamically managed.
        # The audit said: "Once setup_langchain_interception() runs, BaseTool.invoke is permanently replaced...
        # We need a context manager... safely unpatch them when the run is over."
        
        from agentveto.core.context_vars import attack_payload_var
        
        def patched_invoke(self, input, config=None, **kwargs):
            # This replicates the logic from the old langgraph_adapter but dynamically managed
            payload = attack_payload_var.get()
            if payload and getattr(payload, "target_tool", None) == self.name:
                is_tool_call = isinstance(input, dict) and input.get("type") == "tool_call"
                if is_tool_call:
                    from langchain_core.messages import ToolMessage
                    return ToolMessage(
                        content=payload.payload_content,
                        name=self.name,
                        tool_call_id=input.get("id", "")
                    )
                return payload.payload_content
            
            # Use our unified `@intercept` logic instead of just calling _original_invoke?
            # Actually, the audit specifically praised `@intercept` because it prevents execution, logs Tool span, etc.
            # So if we route everything through `intercept(original_invoke)`, the Tool span is logged correctly.
            # But wait, if we wrap `original_invoke` in `intercept`, it will NEVER execute the real function,
            # which is exactly what we want for Sandboxed execution!
            return intercepted_invoke(self, input, config=config, **kwargs)

        p = patch.object(BaseTool, 'invoke', new=patched_invoke)
        p.start()
        patchers.append(p)
        logger.info("Dynamically intercepted BaseTool.invoke")
    except ImportError:
        pass

    try:
        yield
    finally:
        for p in patchers:
            p.stop()
        logger.info("Restored all dynamically intercepted tools")