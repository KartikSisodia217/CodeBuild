from asteval import Interpreter
from backend.observability.telemetry import telemetry

class PythonCalculator:
    """A safe Python sandbox for mathematical evaluations using asteval."""
    
    def __init__(self):
        self.aeval = Interpreter()

    def evaluate(self, expression: str) -> float:
        """Evaluates a mathematical string expression securely."""
        try:
            result = self.aeval(expression)
            telemetry.log_tool_call("python_calculator", success=True)
            return float(result)
        except Exception as e:
            telemetry.log_tool_call("python_calculator", success=False, error_msg=str(e))
            raise ValueError(f"Failed to evaluate expression: {expression}. Error: {str(e)}")

calculator_tool = PythonCalculator()
