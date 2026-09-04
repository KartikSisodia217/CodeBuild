with open("tests/test_yaml_serializer.py", "r") as f:
    c = f.read()
c = c.replace("eval_from agentveto.schemas import PolicyRule\n    result = evaluate_trace", "from agentveto.schemas import PolicyRule\n    eval_result = evaluate_trace")
with open("tests/test_yaml_serializer.py", "w") as f:
    f.write(c)
