import unittest
import asyncio
from agentveto.core.decorator import intercept
from agentveto.core.context_vars import run_id_var

executed_sync = False
executed_async = False

@intercept
def dangerous_tool_sync(user_id: int):
    global executed_sync
    executed_sync = True
    return "real_sync_result"

@intercept
async def dangerous_tool_async(user_id: int):
    global executed_async
    executed_async = True
    return "real_async_result"

class TestInterceptor(unittest.TestCase):
    def setUp(self):
        global executed_sync, executed_async
        executed_sync = False
        executed_async = False
        run_id_var.set("test_run_123")
        
    def test_sync_interception(self):
        result = dangerous_tool_sync(user_id=42)
        # Verify original did not run
        self.assertFalse(executed_sync, "Original sync function was executed!")
        # Verify mock response is returned
        self.assertIsInstance(result, dict)
        self.assertEqual(result.get("status"), "success")
        self.assertEqual(result.get("tool_executed"), "dangerous_tool_sync")
        
    def test_async_interception(self):
        async def run_test():
            result = await dangerous_tool_async(user_id=42)
            self.assertFalse(executed_async, "Original async function was executed!")
            self.assertIsInstance(result, dict)
            self.assertEqual(result.get("status"), "success")
            self.assertEqual(result.get("tool_executed"), "dangerous_tool_async")
            
        asyncio.run(run_test())

if __name__ == '__main__':
    unittest.main()