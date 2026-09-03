import re
with open("backend/agentveto/adapters/langgraph_adapter.py", "r") as f:
    content = f.read()

# Remove the old ScopedLangchainInterceptor entirely
content = re.sub(r'class ScopedLangchainInterceptor:.*?@contextmanager', '@contextmanager', content, flags=re.DOTALL)

# Add the import
content = content.replace(
    "from agentveto.adapters.base import AgentAdapter",
    "from agentveto.interception.langchain_interceptor import ScopedLangchainInterceptor\nfrom agentveto.adapters.base import AgentAdapter"
)

with open("backend/agentveto/adapters/langgraph_adapter.py", "w") as f:
    f.write(content)
