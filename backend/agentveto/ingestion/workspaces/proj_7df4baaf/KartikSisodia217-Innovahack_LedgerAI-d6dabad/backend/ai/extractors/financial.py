import re
from pydantic import BaseModel

class FinancialData(BaseModel):
    revenue: float = 0.0
    costs: float = 0.0
    current_assets: float = 0.0
    current_liabilities: float = 0.0

class FinancialExtractor:
    @staticmethod
    def extract(context: str) -> FinancialData:
        data = FinancialData()
        
        # Simple extraction heuristics
        rev_match = re.search(r'(?i)revenue\s*(?:is|of|:)?\s*\$?\s*([\d,.]+)', context)
        cost_match = re.search(r'(?i)(?:costs|expenses)\s*(?:are|of|:)?\s*\$?\s*([\d,.]+)', context)
        assets_match = re.search(r'(?i)current assets\s*(?:are|of|:)?\s*\$?\s*([\d,.]+)', context)
        liabilities_match = re.search(r'(?i)current liabilities\s*(?:are|of|:)?\s*\$?\s*([\d,.]+)', context)
        
        if rev_match: data.revenue = float(rev_match.group(1).replace(',', ''))
        if cost_match: data.costs = float(cost_match.group(1).replace(',', ''))
        if assets_match: data.current_assets = float(assets_match.group(1).replace(',', ''))
        if liabilities_match: data.current_liabilities = float(liabilities_match.group(1).replace(',', ''))
            
        return data
