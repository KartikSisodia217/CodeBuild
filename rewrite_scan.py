import re

with open("backend/main.py", "r") as f:
    content = f.read()

# Replace from `def start_scan_endpoint(req: StartScanRequest):` up to `def get_scenario_details`
new_func = """@app.post("/api/scan", response_model=ScanResult)
def start_scan_endpoint(req: StartScanRequest):
    if req.project_manifest:
        from agentveto.contracts.schemas import ScanResult, ScanStatus, SecurityVerdict
        if not req.project_manifest.agentic:
            return ScanResult(
                status=ScanStatus.NOT_AGENTIC,
                metadata={"reason": "no_agent_detected", "message": "No agentic component was detected in this project."},
                project_manifest=req.project_manifest
            )
        if not req.project_manifest.supported:
            return ScanResult(
                status=ScanStatus.UNSUPPORTED,
                metadata={"reason": "no_supported_integration", "message": "Project analyzed, but no supported AgentVeto runtime integration was detected."},
                project_manifest=req.project_manifest
            )
        
        if req.project_manifest.integration_type == "langgraph":
            if req.project_manifest.source_type != "local_fixture":
                from agentveto.subprocess_runner import run_external_project
                from agentveto.ingestion.workspace_manager import get_workspace
                
                workspace = get_workspace(req.project_manifest.project_id)
                workspace_path = workspace.workspace_path if workspace else req.project_manifest.project_name
                
                details_or_error = run_external_project(req.project_manifest, workspace_path)
                
                if isinstance(details_or_error, dict) and details_or_error.get("status") != "completed":
                    if details_or_error.get("status") == "execution_failed":
                        return ScanResult(
                            status=ScanStatus.EXECUTION_FAILED,
                            metadata={"reason": details_or_error.get("reason"), "message": details_or_error.get("message")},
                            project_manifest=req.project_manifest
                        )
                    if details_or_error.get("status") == "unsafe_to_execute":
                        return ScanResult(
                            status=ScanStatus.UNSUPPORTED_ENTRYPOINT,
                            metadata={"reason": details_or_error.get("reason"), "message": details_or_error.get("message")},
                            project_manifest=req.project_manifest
                        )
                
                details = details_or_error.get("scenario_details", {})
                eval_data = details.get("evaluation", {})
                verdict_str = eval_data.get("status") if isinstance(eval_data, dict) else (eval_data.status if hasattr(eval_data, "status") else None)
                if hasattr(verdict_str, "value"): verdict_str = verdict_str.value
                verdict = SecurityVerdict.VETO if verdict_str == "VETO" else (SecurityVerdict.PASS if verdict_str == "PASS" else None)
                
                _record_evaluation(eval_data)
                
                return ScanResult(
                    run_id=details.get("metadata", {}).get("id", "unknown"),
                    status=ScanStatus.COMPLETED,
                    verdict=verdict,
                    project_manifest=req.project_manifest,
                    metadata=details.get("metadata", {}),
                    threat_model=details.get("attack_analysis"),
                    evaluation=eval_data,
                    trajectory=details.get("trace"),
                    state_diff=details.get("state_diff"),
                    evidence=details.get("evidence")
                )
            else:
                from agentveto.adapters.langgraph_adapter import run_langgraph_fixture
                details = run_langgraph_fixture(req.project_manifest.repository)
                _record_evaluation(details["evaluation"])
                eval_data = details["evaluation"]
                verdict_str = eval_data.status.value if hasattr(eval_data.status, 'value') else eval_data.status
                verdict = SecurityVerdict.VETO if verdict_str == "VETO" else (SecurityVerdict.PASS if verdict_str == "PASS" else None)
                
                return ScanResult(
                    run_id=details["trace"].run_id,
                    status=ScanStatus.COMPLETED,
                    verdict=verdict,
                    project_manifest=req.project_manifest,
                    metadata=details.get("metadata", {}),
                    threat_model=details.get("attack_analysis"),
                    evaluation=eval_data,
                    trajectory=details["trace"],
                    state_diff=details["state_diff"],
                    evidence=details.get("evidence")
                )

        return ScanResult(
            status=ScanStatus.UNSUPPORTED,
            metadata={"message": "Real runtime execution engine is not yet implemented for uploaded projects."},
            project_manifest=req.project_manifest
        )
    else:
        from agentveto.contracts.schemas import ScanResult, ScanStatus, SecurityVerdict
        scenario_id = req.scenario_id or "zero_click_echoleak"
        try:
            details = run_fixture_scenario(scenario_id)
        except KeyError:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown controlled fixture scenario '{scenario_id}'.",
            )
            
        _record_evaluation(details["evaluation"])
        eval_data = details["evaluation"]
        verdict_str = eval_data.status.value if hasattr(eval_data.status, 'value') else eval_data.status
        verdict = SecurityVerdict.VETO if verdict_str == "VETO" else (SecurityVerdict.PASS if verdict_str == "PASS" else None)
        
        return ScanResult(
            run_id=details["trace"].run_id,
            status=ScanStatus.COMPLETED,
            verdict=verdict,
            metadata=details.get("metadata", {}),
            threat_model=details.get("attack_analysis"),
            evaluation=eval_data,
            trajectory=details["trace"],
            state_diff=details["state_diff"],
            evidence=details.get("evidence")
        )

"""

new_content = re.sub(
    r'@app\.post\("/api/scan"\).*?@app\.get\("/api/scenarios/\{scenario_id\}"\)',
    new_func + '\n@app.get("/api/scenarios/{scenario_id}")',
    content,
    flags=re.DOTALL
)

with open("backend/main.py", "w") as f:
    f.write(new_content)
