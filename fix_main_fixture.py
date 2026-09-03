import re
with open("backend/main.py", "r") as f:
    content = f.read()

replacement = """            else:
                from agentveto.adapters.langgraph_adapter import run_langgraph_fixture
                exec_result = run_langgraph_fixture(req.project_manifest.repository)
                
                trace = exec_result.trajectory
                state_diff = exec_result.state_diff
                
                from agentveto.evaluator.policy_engine import evaluate_trace
                from agentveto.registry.evidence_graph import generate_dag
                eval_data = evaluate_trace(trace, state_diff)
                eval_data.details["execution_mode"] = "langgraph_adapter"
                dag = generate_dag(trace, eval_data)
                
                _record_evaluation(eval_data)
                
                return ScanResult(
                    run_id=trace.run_id,
                    status=ScanStatus.COMPLETED,
                    verdict=eval_data.status,
                    project_manifest=req.project_manifest,
                    metadata={
                        "execution_mode": "langgraph_adapter",
                        "threat_category": trace.metadata.get("attack_plan", {}).get("vector") if trace.metadata else None,
                    },
                    threat_model=trace.metadata.get("attack_plan") if trace.metadata else None,
                    evaluation=eval_data,
                    trajectory=trace,
                    state_diff=state_diff,
                    evidence=dag
                )"""

content = re.sub(r'            else:\n                from agentveto\.adapters\.langgraph_adapter import run_langgraph_fixture\n                details = run_langgraph_fixture\(req\.project_manifest\.repository\).*?evidence=details\.get\("evidence"\)\n                \)', replacement, content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
