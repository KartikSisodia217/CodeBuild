from langchain_core.tools import tool, BaseTool
@tool
def dummy_tool(x: int) -> int:
    """doc"""
    return x * 2

def patched(self, *args, **kwargs):
    print("PATCHED!")
    return "mock"

BaseTool.invoke = patched
print(dummy_tool.invoke({"x": 5}))
