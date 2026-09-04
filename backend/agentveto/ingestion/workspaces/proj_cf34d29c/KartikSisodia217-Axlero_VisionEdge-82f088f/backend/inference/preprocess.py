import cv2
import numpy as np
from typing import Tuple, Dict, Any

class Preprocessor:
    """
    Handles image transformations required before feeding data into the YOLO model.
    """
    def __init__(self, target_size: Tuple[int, int] = (640, 640)):
        # target_size is (height, width)
        self.target_size = target_size

    def letterbox(self, img: np.ndarray, color: Tuple[int, int, int] = (114, 114, 114)) -> Tuple[np.ndarray, float, Tuple[float, float]]:
        """
        Resizes and pads the image to the target size while maintaining aspect ratio.
        
        Args:
            img: Original image (H, W, C) in BGR format.
            color: Padding color.
            
        Returns:
            padded_img: The letterboxed image.
            ratio: The scaling ratio used.
            pad: The (pad_w, pad_h) applied to the image.
        """
        shape = img.shape[:2]  # current shape [height, width]
        new_shape = self.target_size

        # Scale ratio (new / old)
        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        
        # Compute padding
        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding
        
        # Divide padding to both sides
        dw /= 2
        dh /= 2

        if shape[::-1] != new_unpad:  # resize
            img = cv2.resize(img, new_unpad, interpolation=cv2.INTER_LINEAR)

        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        
        # Apply padding
        padded_img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)

        return padded_img, r, (dw, dh)

    def preprocess(self, img: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Full preprocessing pipeline: Letterbox -> BGR to RGB -> HWC to CHW -> Normalize.
        
        Args:
            img: Original image as a numpy array.
            
        Returns:
            tensor_data: The preprocessed numpy array ready for tensor conversion (1, C, H, W).
            meta: Dictionary containing ratio and padding used, needed for postprocessing.
        """
        original_shape = img.shape[:2]
        
        # 1. Letterbox resizing
        padded_img, ratio, (pad_w, pad_h) = self.letterbox(img)
        
        # 2. Convert BGR to RGB
        img_rgb = cv2.cvtColor(padded_img, cv2.COLOR_BGR2RGB)
        
        # 3. Convert HWC to CHW and add batch dimension
        # YOLO requires (Batch, Channel, Height, Width)
        img_chw = img_rgb.transpose((2, 0, 1))[None, ...]
        
        # 4. Normalize to [0, 1] and ensure it's contiguous in memory (helps TensorRT/PyTorch)
        img_norm = np.ascontiguousarray(img_chw, dtype=np.float32) / 255.0
        
        meta = {
            "original_shape": original_shape,
            "ratio": ratio,
            "pad": (pad_w, pad_h)
        }
        
        return img_norm, meta
