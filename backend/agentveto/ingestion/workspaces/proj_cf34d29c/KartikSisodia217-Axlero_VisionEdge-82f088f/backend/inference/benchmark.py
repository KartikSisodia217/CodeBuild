import time
import cv2
import numpy as np
from tabulate import tabulate

from .inference import VisionEdgeInference
from .config import InferenceConfig
from .utils import get_logger

logger = get_logger("Benchmark")

def generate_dummy_frames(num_frames: int = 100, size: tuple = (1080, 1920, 3)):
    """Generates random numpy arrays to simulate video frames (e.g., 1080p)."""
    logger.info(f"Generating {num_frames} dummy frames of size {size}...")
    return [np.random.randint(0, 255, size, dtype=np.uint8) for _ in range(num_frames)]

def benchmark_backend(engine: VisionEdgeInference, frames: list) -> dict:
    """Runs the benchmark on a specific initialized engine."""
    logger.info(f"Starting warmup for {engine.backend} backend...")
    for _ in range(10):
        engine.predict(frames[0])
        
    logger.info(f"Running benchmark for {engine.backend} backend on {len(frames)} frames...")
    
    total_latency = 0.0
    start_time = time.perf_counter()
    
    for frame in frames:
        result = engine.predict(frame)
        total_latency += result.inference_time_ms
        
    end_time = time.perf_counter()
    
    total_time_s = end_time - start_time
    avg_inference_latency = total_latency / len(frames)
    fps = len(frames) / total_time_s
    
    return {
        "backend": engine.backend,
        "avg_inference_latency_ms": avg_inference_latency,
        "total_fps": fps,
    }

def run_benchmarks():
    """Main benchmark execution function."""
    config = InferenceConfig()
    
    # 1. Initialize engines
    # Note: TensorRT engine initialization will trigger ONNX export and Engine building
    # if they do not already exist in the models/ directory.
    pytorch_engine = VisionEdgeInference(config=config, backend="pytorch")
    try:
        trt_engine = VisionEdgeInference(config=config, backend="tensorrt")
    except Exception as e:
        logger.error(f"Failed to initialize TensorRT engine: {e}")
        logger.error("Ensure TensorRT and PyCUDA are correctly installed in your environment.")
        return

    # 2. Generate dummy data (Simulating a 1080p stream)
    frames = generate_dummy_frames(num_frames=100)

    # 3. Run Benchmarks
    pt_results = benchmark_backend(pytorch_engine, frames)
    trt_results = benchmark_backend(trt_engine, frames)

    # 4. Report
    table = [
        ["Backend", "Avg Pure Inference Latency (ms)", "End-to-End FPS"],
        [pt_results["backend"], f"{pt_results['avg_inference_latency_ms']:.2f}", f"{pt_results['total_fps']:.2f}"],
        [trt_results["backend"], f"{trt_results['avg_inference_latency_ms']:.2f}", f"{trt_results['total_fps']:.2f}"]
    ]
    
    print("\n" + "="*50)
    print(" VISIONEDGE INFERENCE BENCHMARK RESULTS")
    print("="*50)
    print(tabulate(table, headers="firstrow", tablefmt="grid"))
    print("\n* End-to-End FPS includes preprocessing (letterboxing, HWC->CHW) and postprocessing.")
    
    speedup = pt_results['avg_inference_latency_ms'] / trt_results['avg_inference_latency_ms']
    print(f"\nTensorRT achieved a {speedup:.2f}x speedup in pure inference latency over PyTorch.")

if __name__ == "__main__":
    run_benchmarks()
