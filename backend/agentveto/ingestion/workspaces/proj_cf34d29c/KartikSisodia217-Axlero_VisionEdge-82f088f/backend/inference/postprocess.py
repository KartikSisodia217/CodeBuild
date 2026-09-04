import numpy as np
from typing import List, Dict, Any
from .utils import BoundingBox, DetectionResult

class Postprocessor:
    """
    Handles converting raw tensor outputs back to meaningful bounding boxes in the original image space.
    """
    def __init__(self, conf_threshold: float = 0.25):
        self.conf_threshold = conf_threshold
        # Note: YOLOv10 doesn't strictly need NMS, so we don't implement complex IoU filtering here.
        # We simply filter by confidence and rescale.

    def scale_boxes(self, boxes: np.ndarray, meta: Dict[str, Any]) -> np.ndarray:
        """
        Rescales bounding boxes (x1, y1, x2, y2) to the original image shape based on letterbox metadata.
        
        Args:
            boxes: numpy array of shape (N, 4) containing [x1, y1, x2, y2].
            meta: Metadata dictionary from Preprocessor containing ratio and pad.
            
        Returns:
            Rescaled bounding boxes.
        """
        ratio = meta["ratio"]
        pad_w, pad_h = meta["pad"]
        
        # Unpad
        boxes[:, [0, 2]] -= pad_w  # x padding
        boxes[:, [1, 3]] -= pad_h  # y padding
        
        # Unscale
        boxes[:, :4] /= ratio
        
        # Clip bounding boxes to image boundaries
        orig_h, orig_w = meta["original_shape"]
        boxes[:, [0, 2]] = boxes[:, [0, 2]].clip(0, orig_w)
        boxes[:, [1, 3]] = boxes[:, [1, 3]].clip(0, orig_h)
        
        return boxes

    def postprocess(self, raw_output: np.ndarray, meta: Dict[str, Any], inference_time_ms: float = 0.0) -> DetectionResult:
        """
        Converts raw model output to standardized DetectionResult.
        
        Args:
            raw_output: Numpy array from YOLOv10 output. Expected shape varies by export,
                        but generally (1, 300, 6) -> [x1, y1, x2, y2, conf, class_id]
            meta: Metadata from Preprocessor.
            inference_time_ms: Tracked execution time.
            
        Returns:
            Standardized DetectionResult.
        """
        # Remove batch dimension if it exists
        if len(raw_output.shape) == 3:
            raw_output = raw_output[0]
            
        # YOLOv10 specific output shape: (N, 6) where cols are x1, y1, x2, y2, conf, cls
        # Filter by confidence
        mask = raw_output[:, 4] > self.conf_threshold
        detections = raw_output[mask]
        
        boxes_list: List[BoundingBox] = []
        if len(detections) > 0:
            # Separate boxes for scaling
            boxes = detections[:, :4]
            scaled_boxes = self.scale_boxes(boxes.copy(), meta)
            
            # Construct standard objects
            for i in range(len(detections)):
                x1, y1, x2, y2 = scaled_boxes[i]
                conf = float(detections[i, 4])
                cls_id = int(detections[i, 5])
                
                # In a real system, we'd map cls_id to a name from a loaded label map.
                # For now, we use stringified IDs.
                boxes_list.append(BoundingBox(
                    x1=float(x1), y1=float(y1), x2=float(x2), y2=float(y2),
                    confidence=conf,
                    class_id=cls_id,
                    class_name=str(cls_id)
                ))
                
        orig_h, orig_w = meta["original_shape"]
        return DetectionResult(
            boxes=boxes_list,
            inference_time_ms=inference_time_ms,
            image_width=orig_w,
            image_height=orig_h
        )
