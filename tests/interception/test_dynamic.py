import unittest
from agentveto.core.dynamic import dynamic_interception
from langchain_core.tools import BaseTool

class DummyTool(BaseTool):
    name: str = "dummy_tool"
    description: str = "A dummy tool"
    
    def _run(self, query: str) -> str:
        return "original_run_result"

class TestDynamicInterception(unittest.TestCase):
    def test_context_manager_patches_and_restores(self):
        tool = DummyTool()
        
        # Test original behavior
        original_result = tool.invoke({"query": "test"})
        self.assertEqual(original_result, "original_run_result")
        
        # Test intercepted behavior
        with dynamic_interception():
            # When intercepted, the original function NEVER runs.
            # Instead, it routes to SandboxManager which returns a mock.
            # Since SandboxManager uses heuristic fallback for unknown tools,
            # it should return a dictionary (or JSON string).
            intercepted_result = tool.invoke({"query": "test"})
            self.assertNotEqual(intercepted_result, "original_run_result")
            self.assertTrue(isinstance(intercepted_result, dict) or isinstance(intercepted_result, str))
            if isinstance(intercepted_result, dict):
                self.assertEqual(intercepted_result.get("status"), "success")
                self.assertEqual(intercepted_result.get("tool_executed"), "dummy_tool")
            
        # Test restored behavior
        restored_result = tool.invoke({"query": "test"})
        self.assertEqual(restored_result, "original_run_result")

if __name__ == '__main__':
    unittest.main()