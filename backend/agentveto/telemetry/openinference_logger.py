"""
Trace Engine
Owner: Interception & Trace Engineer (Member 2)
"""
from typing import Dict, Any
import json
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

# Basic Tracer setup
provider = TracerProvider()
# Add a console exporter for the MVP, or sqlite if requested.
# For MVP, just simple span processor is fine, since Evaluator needs to fetch it.
# We'll also store spans in-memory or provide a way to retrieve them if needed,
# but the evaluator might expect them in SQLite according to documents.
# For MVP telemetry, let's keep it simple.
"""
Trace Engine
Owner: Interception & Trace Engineer (Member 2)
"""
from typing import Dict, Any
import json
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

# Basic Tracer setup
provider = TracerProvider()
# Add a console exporter for the MVP, or sqlite if requested.
# For MVP, just simple span processor is fine, since Evaluator needs to fetch it.
# We'll also store spans in-memory or provide a way to retrieve them if needed,
# but the evaluator might expect them in SQLite according to documents.
# For MVP telemetry, let's keep it simple.
processor = SimpleSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("agentveto.tracer")

class TraceManager:
    def log_span(self, span_kind: str, attributes: Dict[str, Any]):
        """
        Log OpenInference compliant spans.
        """
        with tracer.start_as_current_span(name=f"agentveto.{span_kind}") as span:
            for key, value in attributes.items():
                if isinstance(value, (dict, list)):
                    span.set_attribute(key, json.dumps(value))
                else:
                    span.set_attribute(key, value)
            span.set_attribute("openinference.span.kind", span_kind)
            
        from agentveto.telemetry.storage import SQLiteSpanStorage
        SQLiteSpanStorage.save_span(span_kind, attributes)
