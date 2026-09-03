import unittest
import json
from agentveto.telemetry.storage import SQLiteSpanStorage, init_db
from agentveto.telemetry.openinference_logger import TraceManager

class TestTelemetry(unittest.TestCase):
    def setUp(self):
        init_db()
        # Clean DB before each test
        SQLiteSpanStorage.clear_trajectory()
        self.trace_manager = TraceManager()
        
    def test_log_span_and_run_isolation(self):
        attributes1 = {"tool.name": "tool_1", "run_id": "run_A", "tool.arguments": {"user_id": 1}}
        attributes2 = {"tool.name": "tool_2", "run_id": "run_B", "tool.arguments": {"user_id": 2}}
        attributes3 = {"tool.name": "tool_3", "run_id": "run_A", "tool.arguments": {"user_id": 3}}
        
        self.trace_manager.log_span("TOOL", attributes1)
        self.trace_manager.log_span("TOOL", attributes2)
        self.trace_manager.log_span("TOOL", attributes3)
        
        # Test retrieving all
        all_traj = SQLiteSpanStorage.get_trajectory()
        self.assertEqual(len(all_traj), 3)
        
        # Test run_id isolation
        run_a_traj = SQLiteSpanStorage.get_trajectory(run_id="run_A")
        self.assertEqual(len(run_a_traj), 2)
        self.assertEqual(run_a_traj[0].attributes["tool.name"], "tool_1")
        self.assertEqual(run_a_traj[1].attributes["tool.name"], "tool_3")
        
        run_b_traj = SQLiteSpanStorage.get_trajectory(run_id="run_B")
        self.assertEqual(len(run_b_traj), 1)
        self.assertEqual(run_b_traj[0].attributes["tool.name"], "tool_2")

    def test_clear_trajectory(self):
        attributes = {"tool.name": "test_tool", "run_id": "test_run_123"}
        self.trace_manager.log_span("TOOL", attributes)
        
        self.assertEqual(len(SQLiteSpanStorage.get_trajectory()), 1)
        SQLiteSpanStorage.clear_trajectory(run_id="test_run_123")
        self.assertEqual(len(SQLiteSpanStorage.get_trajectory()), 0)

if __name__ == '__main__':
    unittest.main()