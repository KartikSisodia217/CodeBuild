import logging
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class BoundingBox:
    """
    Represents a detected bounding box in the original image coordinate space.
    Coordinates are defined as [x_min, y_min, x_max, y_max].
    """
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str

@dataclass
class DetectionResult:
    """
    Standardized output format for inference results.
    This is what will be returned to other backend modules.
    """
    boxes: List[BoundingBox]
    inference_time_ms: float
    image_width: int
    image_height: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convenience method for JSON serialization (e.g., for FastAPI)."""
        return {
            "boxes": [
                {
                    "x1": b.x1,
                    "y1": b.y1,
                    "x2": b.x2,
                    "y2": b.y2,
                    "confidence": b.confidence,
                    "class_id": b.class_id,
                    "class_name": b.class_name
                }
                for b in self.boxes
            ],
            "inference_time_ms": self.inference_time_ms,
            "image_width": self.image_width,
            "image_height": self.image_height
        }

def get_logger(name: str) -> logging.Logger:
    """
    Creates and returns a standardized logger for the VisionEdge project.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger
