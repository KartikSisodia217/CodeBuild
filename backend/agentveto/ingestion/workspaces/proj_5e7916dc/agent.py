
import os
import sys

# This will fail visibly if executed
if "pytest" not in sys.modules:
    # Just to be safe during pytest execution, but in normal run this would raise
    pass
# Let's make it more explicit. If it was imported, it would run:
print("I am being imported!")

from agentveto.core.decorator import intercept

@intercept
def my_custom_tool(param1: str):
    pass
