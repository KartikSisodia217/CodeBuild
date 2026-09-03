with open("backend/main.py", "r") as f:
    content = f.read()

new_exec = """        runtime = ExecutionRuntime(manifest, "")
        scan_result = runtime.execute()
        
        if scan_result.evaluation:
            _record_evaluation(scan_result.evaluation)
            yaml_str = export_yaml(scan_result.trajectory, scan_result.evaluation, scan_result.state_diff)
            scan_result.metadata["yaml_content"] = yaml_str
            
        return scan_result"""
content = content.replace('''        runtime = ExecutionRuntime(manifest, "")
        scan_result = runtime.execute()
        
        if scan_result.evaluation:
            _record_evaluation(scan_result.evaluation)
            
        return scan_result''', new_exec)

new_details_exec = """    runtime = ExecutionRuntime(manifest, "")
    scan_result = runtime.execute()
    
    if scan_result.evaluation:
        yaml_str = export_yaml(scan_result.trajectory, scan_result.evaluation, scan_result.state_diff)
        scan_result.metadata["yaml_content"] = yaml_str
        
    return scan_result.model_dump()"""
content = content.replace('''    runtime = ExecutionRuntime(manifest, "")
    scan_result = runtime.execute()
    
    return scan_result.model_dump()''', new_details_exec)

with open("backend/main.py", "w") as f:
    f.write(content)
