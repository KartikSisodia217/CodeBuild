import re
with open("backend/main.py", "r") as f:
    content = f.read()

# Currently `main.py` has:
#                 details_or_error = run_external_project(req.project_manifest, workspace_path)
#                 
#                 if isinstance(details_or_error, dict) and details_or_error.get("status") != "completed": ...

new_caller = """                exec_result = run_external_project(req.project_manifest, workspace_path)
                
                if exec_result.status != ScanStatus.COMPLETED:
                    return ScanResult(
                        status=exec_result.status,
                        metadata={"message": exec_result.error_message},
                        project_manifest=req.project_manifest
                    )
                
                # Retrieve from exec_result
                trace = exec_result.trajectory
                state_diff = exec_result.state_diff
                
                # Ensure trace exists
                if not trace:
                    return ScanResult(
                        status=ScanStatus.EXECUTION_FAILED,
                        metadata={"message": "Agent execution did not produce a trajectory."},
                        project_manifest=req.project_manifest
                    )
                    
                from agentveto.evaluator.policy_engine import evaluate_trace
                from agentveto.registry.evidence_graph import generate_dag
                eval_data = evaluate_trace(trace, state_diff)
                eval_data.details["execution_mode"] = "external_runtime"
                dag = generate_dag(trace, eval_data)
                
                _record_evaluation(eval_data)
                
                return ScanResult(
                    run_id=trace.run_id,
                    status=ScanStatus.COMPLETED,
                    verdict=eval_data.status,
                    project_manifest=req.project_manifest,
                    metadata={
                        "execution_mode": "external_runtime",
                        "threat_category": trace.metadata.get("attack_plan", {}).get("vector") if trace.metadata else None,
                        "duration_ms": 0,
                    },
                    threat_model=trace.metadata.get("attack_plan") if trace.metadata else None,
                    evaluation=eval_data,
                    trajectory=trace,
                    state_diff=state_diff,
                    evidence=dag
                )
"""

content = re.sub(r'                details_or_error = run_external_project\(req\.project_manifest, workspace_path\).*?evidence=details\.get\("evidence"\)\n                \)', new_caller, content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
