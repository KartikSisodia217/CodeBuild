import re

with open("tests/test_subprocess_runner.py", "r") as f:
    content = f.read()

replacement = """        result = run_external_project(manifest, "/tmp")
        from agentveto.contracts.schemas import ScanStatus
        assert result.status == ScanStatus.UNSUPPORTED_ENTRYPOINT"""

content = re.sub(r'        result = run_external_project\(manifest, "/tmp"\)\n        assert result\["status"\] == "unsafe_to_execute"', replacement, content)

with open("tests/test_subprocess_runner.py", "w") as f:
    f.write(content)
