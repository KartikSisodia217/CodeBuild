import unittest
import json
from agentveto.telemetry.storage import SQLiteSpanStorage, init_db
from agentveto.telemetry.openinference_logger import TraceManager

class TestTelemetry(unittest.TestCase):
    def setUp(self):
        init_db()
        self.trace_manager = TraceManager()
        
    def test_log_span(self):
        attributes = {
            "tool.name": "test_tool",
            "run_id": "unique_test_run_456",
            "tool.arguments": {"user_id": 42}
        }
        self.trace_manager.log_span("TOOL", attributes)
        
        trajectory = SQLiteSpanStorage.get_trajectory()
        # Find our span
        found = False
        for span in trajectory:
            if span.span_kind == "TOOL" and span.attributes.get("run_id") == "unique_test_run_456":
                found = True
                self.assertEqual(span.attributes.get("tool.name"), "test_tool")
                # Arguments are converted to JSON string in opentelemetry attributes,
                # but our SQLite save_span passes the original attributes dict which is serialized.
                # So we can check the tool.arguments from the sqlite row.
                self.assertEqual(span.attributes.get("tool.arguments"), {"user_id": 42})
                break
        
        self.assertTrue(found, "Span was not successfully logged to SQLite")

if __name__ == '__main__':
    unittest.main()