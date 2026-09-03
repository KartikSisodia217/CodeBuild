from langchain_core.tools import tool, BaseTool
@tool
def dummy_tool(x: int) -> int:
    """doc"""
    return x * 2

print(type(dummy_tool).mro())
print(dummy_tool.invoke.__func__ is BaseTool.invoke)
