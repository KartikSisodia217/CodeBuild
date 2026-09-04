import re

# 1. Read tests/test_policy_engine.py
with open("tests/test_policy_engine.py", "r") as f:
    content = f.read()

# Replace evaluate_trace(trace) with evaluate_trace(trace, custom_rules=[...]) in tests
content = content.replace(
    "result = evaluate_trace(trace)",
    """from agentveto.schemas import PolicyRule
    rule = PolicyRule(rule_id="RULE-SINK-001", name="RESTRICTED_FINANCIAL_SINK", sink_tool="execute_refund", description="Test rule", threat_category="ASI01: Agent Goal Hijacking (Indirect Prompt Injection)")
    result = evaluate_trace(trace, custom_rules=[rule])"""
)

# Fix test_state_diff_unauthorized_mutation_veto
content = content.replace(
    "result = evaluate_trace(trace, state=state_diff)",
    "result = evaluate_trace(trace, state=state_diff, custom_rules=[PolicyRule(rule_id='1', name='r', sink_tool='execute_refund', description='r', threat_category='ASI')])"
)

# Fix test_known_source
content = content.replace(
    "result = evaluate_trace(trace)\n\n    assert result.status",
    "result = evaluate_trace(trace, custom_rules=[PolicyRule(rule_id='1', name='r', sink_tool='execute_refund', description='r', threat_category='ASI')])\n\n    assert result.status"
)

with open("tests/test_policy_engine.py", "w") as f:
    f.write(content)
