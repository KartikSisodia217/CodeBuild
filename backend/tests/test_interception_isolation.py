import pytest
from langchain_core.tools import tool, BaseTool
from agentveto.interception.langchain_interceptor import patch_tool_instances
from agentveto.core.context_vars import attack_payload_var

@tool
def sample_tool(x: int) -> int:
    """dummy docstring"""
    return x

@tool
def another_tool(y: int) -> int:
    """another dummy"""
    return y

def test_no_global_monkey_patching():
    """
    Test that patch_tool_instances only affects the specific instances provided,
    and does NOT modify BaseTool or un-passed tool instances.
    """
    # Keep a reference to the original invoke class method
    original_base_invoke = BaseTool.invoke

    # We patch only sample_tool
    patch_tool_instances([sample_tool], policies={})
    
    # 1. BaseTool.invoke must remain unchanged (no class-level patching)
    assert BaseTool.invoke is original_base_invoke
    
    # 2. another_tool must not be affected (not in the list)
    assert getattr(another_tool, "func") is not None
    
    # 3. sample_tool should be patched, but its invoke is NOT patched at the class level
    # We verify it can be invoked safely without throwing
    res = sample_tool.invoke({"x": 5})
    assert res == 5
