import re

with open("backend/main.py", "r") as f:
    content = f.read()

new_scan = """@app.post("/api/scan", response_model=ScanResult)
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
                
                # If it's a legacy dict response, we should map it to ScanResult.
                if isinstance(details_or_error, dict):
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
                    # Need to parse this into a proper ScanResult!
                    eval_data = details.get("evaluation", {})
                    verdict_str = eval_data.get("status")
                    verdict = SecurityVerdict.VETO if verdict_str == "VETO" else (SecurityVerdict.PASS if verdict_str == "PASS" else None)
                    
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
                return _fallback_fixture(req.project_manifest.project_name, req.project_manifest)

    # Legacy support
    return _fallback_fixture(req.scenario_id, req.project_manifest)
"""

content = re.sub(r'@app\.post\("/api/scan"\).*?# Legacy support\n    return _fallback_fixture\(req\.scenario_id, req\.project_manifest\)', new_scan, content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
