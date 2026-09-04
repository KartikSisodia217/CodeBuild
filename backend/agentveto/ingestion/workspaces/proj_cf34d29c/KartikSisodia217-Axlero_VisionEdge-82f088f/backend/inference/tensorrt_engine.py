import os
import time
import numpy as np
try:
    import tensorrt as trt
    import pycuda.driver as cuda
    import pycuda.autoinit  # Required for initializing CUDA driver
except ImportError:
    trt = None
    cuda = None

from .config import InferenceConfig
from .utils import get_logger
from .model_loader import load_yolo_model

logger = get_logger(__name__)

class TensorRTEngine:
    """
    Wrapper for NVIDIA TensorRT execution.
    Handles engine building, memory allocation, and asynchronous inference.
    """
    def __init__(self, config: InferenceConfig):
        self.config = config
        if trt is None or cuda is None:
            raise ImportError("TensorRT or PyCUDA not found. Please install tensorrt and pycuda.")
            
        self.logger = trt.Logger(trt.Logger.WARNING)
        self.engine = None
        self.context = None
        self.inputs = []
        self.outputs = []
        self.bindings = []
        self.stream = None
        
        self._load_or_build_engine()
        self._allocate_buffers()

    def _export_to_onnx(self):
        """Uses Ultralytics export functionality to generate the ONNX file."""
        logger.info(f"Exporting PyTorch model to ONNX: {self.config.onnx_model_path}")
        model = load_yolo_model(self.config)
        # YOLOv10 ultralytics export natively supports half precision and dynamic shapes,
        # but for max performance on edge we use static shapes.
        model.export(
            format="onnx",
            half=self.config.fp16,
            dynamic=False,
            imgsz=self.config.input_size,
            simplify=True
        )

    def _build_engine(self):
        """Builds a TensorRT engine from an ONNX file."""
        if not os.path.exists(self.config.onnx_model_path):
            self._export_to_onnx()
            
        logger.info(f"Building TensorRT engine from {self.config.onnx_model_path}. This may take a few minutes...")
        builder = trt.Builder(self.logger)
        network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
        config = builder.create_builder_config()
        
        # Define workspace size (e.g., 1GB)
        config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, self.config.max_workspace_size)
        
        if self.config.fp16 and builder.platform_has_fast_fp16:
            config.set_flag(trt.BuilderFlag.FP16)
            
        parser = trt.OnnxParser(network, self.logger)
        with open(self.config.onnx_model_path, "rb") as model:
            if not parser.parse(model.read()):
                for error in range(parser.num_errors):
                    logger.error(parser.get_error(error))
                raise RuntimeError("Failed to parse ONNX file.")
                
        serialized_engine = builder.build_serialized_network(network, config)
        if serialized_engine is None:
            raise RuntimeError("Failed to build TensorRT engine.")
            
        with open(self.config.tensorrt_engine_path, "wb") as f:
            f.write(serialized_engine)
        logger.info(f"Engine successfully saved to {self.config.tensorrt_engine_path}")

    def _load_or_build_engine(self):
        """Loads an existing engine or triggers a build."""
        if not os.path.exists(self.config.tensorrt_engine_path):
            self._build_engine()
            
        logger.info(f"Loading engine from {self.config.tensorrt_engine_path}")
        runtime = trt.Runtime(self.logger)
        with open(self.config.tensorrt_engine_path, "rb") as f:
            self.engine = runtime.deserialize_cuda_engine(f.read())
            
        self.context = self.engine.create_execution_context()

    def _allocate_buffers(self):
        """Allocates host and device memory for inputs and outputs."""
        for binding in self.engine:
            size = trt.volume(self.engine.get_tensor_shape(binding))
            dtype = trt.nptype(self.engine.get_tensor_dtype(binding))
            
            # Allocate pinned memory (page-locked) on host for fast CPU-GPU transfers
            host_mem = cuda.pagelocked_empty(size, dtype)
            # Allocate device memory on GPU
            device_mem = cuda.mem_alloc(host_mem.nbytes)
            
            self.bindings.append(int(device_mem))
            
            if self.engine.get_tensor_mode(binding) == trt.TensorIOMode.INPUT:
                self.inputs.append({"host": host_mem, "device": device_mem, "shape": self.engine.get_tensor_shape(binding)})
            else:
                self.outputs.append({"host": host_mem, "device": device_mem, "shape": self.engine.get_tensor_shape(binding)})
                
        self.stream = cuda.Stream()
        logger.info("CUDA memory buffers allocated.")

    def predict(self, input_data: np.ndarray):
        """
        Executes inference via TensorRT asynchronously.
        
        Args:
            input_data: Numpy array of preprocessed image data.
            
        Returns:
            Tuple of (output numpy array, inference latency in ms).
        """
        # Ensure memory is contiguous and matches the allocated buffer type
        np.copyto(self.inputs[0]["host"], input_data.ravel().astype(self.inputs[0]["host"].dtype))
        
        t_start = time.perf_counter()
        
        # Transfer input data to GPU
        cuda.memcpy_htod_async(self.inputs[0]["device"], self.inputs[0]["host"], self.stream)
        
        # Run inference
        self.context.execute_async_v2(bindings=self.bindings, stream_handle=self.stream.handle)
        
        # Transfer output data back to CPU
        for out in self.outputs:
            cuda.memcpy_dtoh_async(out["host"], out["device"], self.stream)
            
        # Synchronize the stream to ensure completion
        self.stream.synchronize()
        
        t_end = time.perf_counter()
        
        # Assuming single output for YOLOv10 (N, 6)
        output = self.outputs[0]["host"].copy().reshape(self.outputs[0]["shape"])
        return output, (t_end - t_start) * 1000.0
