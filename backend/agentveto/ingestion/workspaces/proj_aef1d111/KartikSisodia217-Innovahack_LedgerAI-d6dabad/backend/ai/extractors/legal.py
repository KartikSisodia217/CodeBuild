import re
from pydantic import BaseModel
from typing import Optional

class LegalClauses(BaseModel):
    termination: Optional[str] = None
    renewal: Optional[str] = None
    penalty: Optional[str] = None
    confidentiality: Optional[str] = None

class ClauseExtractor:
    @staticmethod
    def extract(context: str) -> LegalClauses:
        clauses = LegalClauses()
        
        # In a real system, this could be an LLM-based extraction or semantic search
        # For now, we use regex to grab the sentence containing the keyword
        sentences = [s.strip() for s in re.split(r'[.!?]', context) if s.strip()]
        
        for sentence in sentences:
            s_lower = sentence.lower()
            if "terminat" in s_lower and not clauses.termination:
                clauses.termination = sentence
            elif "renew" in s_lower and not clauses.renewal:
                clauses.renewal = sentence
            elif ("penalty" in s_lower or "liable" in s_lower) and not clauses.penalty:
                clauses.penalty = sentence
            elif "confidential" in s_lower and not clauses.confidentiality:
                clauses.confidentiality = sentence
                
        return clauses
