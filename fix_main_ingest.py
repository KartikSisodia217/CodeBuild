import re

with open("backend/main.py", "r") as f:
    content = f.read()

ingest_github = """@app.post("/api/projects/analyze/github", response_model=ProjectManifest)
async def analyze_github_project(req: GithubAnalyzeRequest):
    from agentveto.ingestion.workspace_manager import create_workspace
    if req.source_type != "github":
        raise HTTPException(status_code=400, detail="Invalid source type.")
        
    workspace = create_workspace(source_type="github", repository=req.repository_url)
    
    try:
        repository, revision = fetch_github_repo(req.repository_url, workspace.workspace_path)
        workspace.repository = repository
        workspace.revision = revision
    except Exception as e:
        import shutil
        shutil.rmtree(workspace.workspace_path, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))
        
    manifest = discover_project(
        workspace.workspace_path, 
        project_name=repository.split('/')[-1],
        source_type="github",
        repository=repository,
        revision=revision
    )
    manifest.project_id = workspace.project_id
    return manifest
"""

ingest_zip = """@app.post("/api/projects/analyze", response_model=ProjectManifest)
async def analyze_project(file: UploadFile = File(...)):
    from agentveto.ingestion.workspace_manager import create_workspace
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
        
    workspace = create_workspace(source_type="zip", repository=file.filename)
    zip_path = os.path.join(workspace.workspace_path, "uploaded.zip")
    
    try:
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        try:
            safe_extract(zip_path, workspace.workspace_path)
        except ExtractionError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        manifest = discover_project(
            workspace.workspace_path, 
            project_name=file.filename,
            source_type="zip"
        )
        manifest.project_id = workspace.project_id
        return manifest
    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)
"""

content = re.sub(r'@app\.post\("/api/projects/analyze/github", response_model=ProjectManifest\).*?shutil\.rmtree\(temp_dir, ignore_errors=True\)', ingest_github, content, flags=re.DOTALL)
content = re.sub(r'@app\.post\("/api/projects/analyze", response_model=ProjectManifest\).*?shutil\.rmtree\(temp_dir, ignore_errors=True\)', ingest_zip, content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
