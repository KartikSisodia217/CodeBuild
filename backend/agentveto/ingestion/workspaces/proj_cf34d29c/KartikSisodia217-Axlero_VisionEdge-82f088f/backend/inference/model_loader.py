import os
from typing import Any
from .config import InferenceConfig
from .utils import get_logger

logger = get_logger(__name__)

def load_yolo_model(config: InferenceConfig) -> Any:
    """
    Loads the YOLOv10 model using the Ultralytics library.
    If the model weights do not exist locally, they are downloaded automatically.
    
    Args:
        config: InferenceConfig containing model name and paths.
        
    Returns:
        The loaded YOLO model object.
    """
    try:
        from ultralytics import YOLO
    except ImportError as e:
        logger.error("Failed to import ultralytics. Please ensure it is installed: `pip install ultralytics`")
        raise e

    model_path = config.pytorch_weights_path
    
    # If the file doesn't exist, ultralytics will attempt to download it
    # provided we just pass the name (e.g., "yolov10s.pt").
    # Once downloaded, we should move it or rely on ultralytics's cache,
    # but to be safe, if it's missing in our models_dir, we load by name
    # and save it back to our directory.
    
    if not os.path.exists(model_path):
        logger.info(f"Model weights not found at {model_path}. Attempting to download {config.model_name}.pt...")
        # Load by name to trigger download
        model = YOLO(f"{config.model_name}.pt")
        # Save explicitly to our managed directory so subsequent loads are local
        model.save(model_path)
        logger.info(f"Model successfully saved to {model_path}")
    else:
        logger.info(f"Loading local model from {model_path}")
        model = YOLO(model_path)
        
    return model
