"""
Trace Engine
Owner: Interception & Trace Engineer (Member 2)

Captures OpenInference-compatible telemetry spans for the AgentVeto pipeline.
Spans are stored in SQLite for durable per-run evidence and optionally exported
to the console for debugging (set AGENTVETO_CONSOLE_TELEMETRY=1).
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

from agentveto.contracts.schemas import OpenInferenceSpan, SpanKind
from agentveto.core.context_vars import (
    parent_span_id_var,
    run_id_var,
    trace_collector_var,
)

# --- Provider setup (executed once at module import) ---
provider = TracerProvider()
# Console export is intentionally opt-in to keep test/CI output clean.
if os.environ.get("AGENTVETO_CONSOLE_TELEMETRY") == "1":
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("agentveto.tracer")


class TraceManager:
    def log_span(
        self,
        span_kind: str,
        attributes: Dict[str, Any],
        *,
        name: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_parameters: Optional[Dict[str, Any]] = None,
        input_value: Any = None,
        output_value: Any = None,
        status_code: str = "OK",
        is_tainted: bool = False,
        is_injection_source: bool = False,
        is_unauthorized_sink: bool = False,
    ) -> OpenInferenceSpan:
        """Log an OpenInference-compliant span and persist it to SQLite storage."""
        run_id = run_id_var.get()
        collector = trace_collector_var.get()
        sequence = (len(collector) + 1) if collector is not None else None
        span_id = (
            f"span_{run_id}_{sequence:03d}"
            if run_id and sequence is not None
            else f"span_{uuid.uuid4().hex[:12]}"
        )
        started_at = datetime.now(timezone.utc)

        with tracer.start_as_current_span(name=f"agentveto.{span_kind}") as span:
            for key, value in attributes.items():
                if isinstance(value, (dict, list)):
                    span.set_attribute(key, json.dumps(value))
                else:
                    span.set_attribute(key, value)
            span.set_attribute("openinference.span.kind", span_kind)
            if run_id:
                span.set_attribute("agentveto.run_id", run_id)
            span.set_attribute("agentveto.span_id", span_id)

        storage_attributes = dict(attributes)
        storage_attributes.update(
            {
                "agentveto.run_id": run_id,
                "agentveto.span_id": span_id,
                "agentveto.parent_span_id": parent_span_id_var.get(),
            }
        )
        if os.environ.get("AGENTVETO_WORKER_PROCESS") != "1":
            from agentveto.telemetry.storage import SQLiteSpanStorage
            SQLiteSpanStorage.save_span(span_kind, storage_attributes)

        try:
            kind = SpanKind(span_kind.upper())
        except ValueError:
            kind = SpanKind.CHAIN

        record = OpenInferenceSpan(
            span_id=span_id,
            parent_id=parent_span_id_var.get(),
            kind=kind,
            name=name or tool_name or f"agentveto.{span_kind.lower()}",
            tool_name=tool_name,
            tool_parameters=tool_parameters,
            input_value=input_value,
            output_value=output_value,
            attributes=storage_attributes,
            status=status_code,
            status_code=status_code,
            start_time=started_at,
            end_time=datetime.now(timezone.utc),
            is_tainted=is_tainted,
            is_injection_source=is_injection_source,
            is_unauthorized_sink=is_unauthorized_sink,
        )
        if collector is not None:
            collector.append(record)
        return record
