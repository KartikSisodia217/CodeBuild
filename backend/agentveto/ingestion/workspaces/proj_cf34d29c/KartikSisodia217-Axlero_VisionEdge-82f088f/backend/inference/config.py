import os
from dataclasses import dataclass, field
from typing import Tuple

@dataclass
class InferenceConfig:
    """
    Configuration for VisionEdge inference pipeline.
    This class handles model paths, execution backends, and preprocessing hyperparameters.
    """
    
    # Model variants: yolov10n, yolov10s, yolov10m, yolov10b, yolov10l, yolov10x
    model_name: str = "yolov10s"
    
    # Directories
    models_dir: str = field(default_factory=lambda: os.path.join(os.getcwd(), "models"))
    
    # Preprocessing
    input_size: Tuple[int, int] = (640, 640) # (height, width)
    
    # Postprocessing
    conf_threshold: float = 0.25
    iou_threshold: float = 0.45
    
    # TensorRT specific
    fp16: bool = True
    max_workspace_size: int = 1 << 30 # 1GB
    
    def __post_init__(self):
        os.makedirs(self.models_dir, exist_ok=True)
        
    @property
    def pytorch_weights_path(self) -> str:
        return os.path.join(self.models_dir, f"{self.model_name}.pt")
        
    @property
    def onnx_model_path(self) -> str:
        return os.path.join(self.models_dir, f"{self.model_name}.onnx")
        
    @property
    def tensorrt_engine_path(self) -> str:
        return os.path.join(self.models_dir, f"{self.model_name}.engine")
