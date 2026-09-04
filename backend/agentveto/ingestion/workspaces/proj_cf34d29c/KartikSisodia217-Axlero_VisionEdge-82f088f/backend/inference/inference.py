import time
import numpy as np
import torch
from typing import Union, Tuple
import cv2

from .config import InferenceConfig
from .utils import DetectionResult, get_logger
from .model_loader import load_yolo_model
from .preprocess import Preprocessor
from .postprocess import Postprocessor
from .tensorrt_engine import TensorRTEngine

logger = get_logger(__name__)

class VisionEdgeInference:
    """
    Main inference API for the VisionEdge backend.
    
    Provides a simple interface for downstream modules to pass in image frames
    and receive standardized DetectionResults, abstracting away the model backend.
    """
    def __init__(self, config: InferenceConfig = None, backend: str = "pytorch"):
        """
        Initializes the inference engine.
        
        Args:
            config: Optional custom InferenceConfig. Defaults to default settings.
            backend: The execution backend to use ("pytorch" or "tensorrt").
        """
        self.config = config or InferenceConfig()
        self.backend = backend.lower()
        
        self.preprocessor = Preprocessor(target_size=self.config.input_size)
        self.postprocessor = Postprocessor(conf_threshold=self.config.conf_threshold)
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Initializing VisionEdgeInference on device: {self.device} with backend: {self.backend}")
        
        if self.backend == "pytorch":
            self._init_pytorch()
        elif self.backend == "tensorrt":
            self._init_tensorrt()
        else:
            raise ValueError(f"Unsupported backend: {self.backend}")
            
    def _init_pytorch(self):
        """Initializes the standard PyTorch YOLO model."""
        # load_yolo_model returns an ultralytics YOLO object
        self.model = load_yolo_model(self.config)
        self.model.to(self.device)
        # Warmup
        logger.info("Warming up PyTorch model...")
        dummy_input = torch.zeros(
            (1, 3, self.config.input_size[0], self.config.input_size[1]), 
            device=self.device
        )
        self.model(dummy_input, verbose=False)
        logger.info("PyTorch model ready.")
        
    def _init_tensorrt(self):
        """Initializes the TensorRT engine."""
        logger.info("Initializing TensorRT engine...")
        self.trt_engine = TensorRTEngine(self.config)
        logger.info("TensorRT model ready.")

    def _predict_pytorch(self, tensor_data: np.ndarray) -> Tuple[np.ndarray, float]:
        """Runs inference via PyTorch."""
        t_start = time.perf_counter()
        
        # Convert numpy to tensor, push to GPU
        tensor = torch.from_numpy(tensor_data).to(self.device)
        
        with torch.no_grad():
            # The ultralytics model returns a list of Results objects or raw tensors depending on how called.
            # Using standard __call__ on the raw tensor bypassing ultralytics pre/post processing
            # actually requires using model.model directly.
            # But the simplest stable way for Phase 1 is to use the model object itself.
            # However, since we want strict control over latency testing and pre/post processing,
            # we will call the internal PyTorch module.
            raw_preds = self.model.model(tensor)
            
        t_end = time.perf_counter()
        
        # YOLOv10 outputs a tensor of shape (B, N, 6) or tuple depending on export state.
        # Ensure we just grab the final predictions.
        if isinstance(raw_preds, tuple):
            preds = raw_preds[0]
        else:
            preds = raw_preds
            
        return preds.cpu().numpy(), (t_end - t_start) * 1000.0

    def predict(self, frame: np.ndarray) -> DetectionResult:
        """
        Runs object detection on a single frame.
        
        Args:
            frame: A numpy array representing the image (e.g., from cv2.imread).
            
        Returns:
            A standardized DetectionResult object.
        """
        if frame is None or frame.size == 0:
            raise ValueError("Invalid empty frame passed to predict()")
            
        # 1. Preprocess
        tensor_data, meta = self.preprocessor.preprocess(frame)
        
        # 2. Inference
        if self.backend == "pytorch":
            raw_output, inference_time_ms = self._predict_pytorch(tensor_data)
        elif self.backend == "tensorrt":
            raw_output, inference_time_ms = self.trt_engine.predict(tensor_data)
        else:
            raise NotImplementedError(f"Backend {self.backend} prediction not implemented.")
            
        # 3. Postprocess
        result = self.postprocessor.postprocess(
            raw_output=raw_output,
            meta=meta,
            inference_time_ms=inference_time_ms
        )
        
        return result
