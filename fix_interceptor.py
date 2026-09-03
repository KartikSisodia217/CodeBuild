import re
with open("backend/agentveto/interception/langchain_interceptor.py", "r") as f:
    content = f.read()

content = content.replace(
    "trace_mgr = trace_collector_var.get()",
    "trace_mgr = trace_collector_var.get()\n    from agentveto.telemetry.openinference_logger import TraceManager\n    logger = TraceManager()"
)
content = content.replace("trace_mgr.log_span(", "logger.log_span(")

with open("backend/agentveto/interception/langchain_interceptor.py", "w") as f:
    f.write(content)
