import os
from pathlib import Path
import platformdirs

def get_upload_dir() -> str:
    """
    Returns the absolute path to the OS-specific application data directory for uploads.
    Ensures the directory exists.
    """
    app_name = "LedgerAI"
    app_author = "LedgerAI" # Required by some platformdirs methods on Windows, though we can just use user_data_dir(appname)
    
    # Get the user data directory
    data_dir = Path(platformdirs.user_data_dir(appname=app_name, appauthor=app_author))
    
    # Define the uploads directory
    upload_dir = data_dir / "uploads"
    
    # Create the directory if it doesn't exist
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    return str(upload_dir)
