"""
VisionEdge Inference Module

This module provides hardware-accelerated real-time video analytics inference
using YOLOv10 and TensorRT.
"""

from .config import InferenceConfig
from .utils import BoundingBox, DetectionResult

__all__ = [
    "InferenceConfig",
    "BoundingBox",
    "DetectionResult",
]
