import logging
import json
import os
import time
from typing import Any, Dict, Optional

# Structured Logger for OpenTelemetry-like traces
class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG if os.getenv("LEDGERAI_DEBUG") == "true" else logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s') # We'll format the JSON ourselves
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def _log(self, level: int, event_name: str, **kwargs):
        payload = {
            "timestamp": time.time(),
            "event": event_name,
            **kwargs
        }
        self.logger.log(level, json.dumps(payload))

    def info(self, event_name: str, **kwargs):
        self._log(logging.INFO, event_name, **kwargs)

    def error(self, event_name: str, **kwargs):
        self._log(logging.ERROR, event_name, **kwargs)

    def debug(self, event_name: str, **kwargs):
        self._log(logging.DEBUG, event_name, **kwargs)

    def trace(self, request_id: str, trace_id: str, event_name: str, **kwargs):
        payload = {
            "request_id": request_id,
            "execution_trace_id": trace_id,
            **kwargs
        }
        self.info(event_name, **payload)

logger = StructuredLogger("LedgerAI")
