from typing import Dict, Any, Tuple
from pydantic import BaseModel

class ConfidenceMetadata(BaseModel):
    retrieved_documents: int = 0
    successful_tool_calls: int = 0
    failed_tool_calls: int = 0
    evidence_count: int = 0
    warnings_count: int = 0
    context_quality_score: int = 0 # 0-100

class ConfidenceEngine:
    """
    Centralized engine to compute confidence scores based on objective execution metadata.
    This prevents LLMs from hallucinating arbitrary percentages.
    """
    
    @staticmethod
    def calculate(metadata: ConfidenceMetadata) -> Tuple[str, str]:
        """
        Returns a tuple of (formatted_confidence_string, reasoning_string)
        """
        score = 0
        reasons = []
        
        # 1. Document Retrieval
        if metadata.retrieved_documents > 0:
            score += 30
            reasons.append(f"Retrieved {metadata.retrieved_documents} relevant documents.")
        else:
            reasons.append("No specific documents retrieved.")
            
        # 2. Tool Execution
        if metadata.successful_tool_calls > 0:
            tool_bonus = min(metadata.successful_tool_calls * 15, 45) # Max 45 points from tools
            score += tool_bonus
            reasons.append(f"Successfully executed {metadata.successful_tool_calls} deterministic tools.")
            
        if metadata.failed_tool_calls > 0:
            score -= 10
            reasons.append(f"Failed to execute {metadata.failed_tool_calls} tools.")
            
        # 3. Evidence
        if metadata.evidence_count > 0:
            score += 25
            reasons.append("Findings are backed by direct evidence.")
            
        # 4. Warnings
        if metadata.warnings_count > 0:
            score -= 15
            reasons.append("Analysis contains warnings or caveats.")
            
        # Cap score
        score = max(0, min(score, 100))
        
        # Determine narrative
        if score >= 80:
            narrative = f"{score}% - High confidence. { ' '.join(reasons) }"
        elif score >= 50:
            narrative = f"{score}% - Moderate confidence. { ' '.join(reasons) }"
        else:
            narrative = f"{score}% - Low confidence. { ' '.join(reasons) }"
            
        return f"{score}%", narrative
