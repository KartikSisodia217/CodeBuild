from backend.ai.extractors.financial import FinancialData

class FinancialTools:
    @staticmethod
    def calculate_ratios(data: FinancialData) -> str:
        results = []
        if data.revenue > 0:
            profit_margin = ((data.revenue - data.costs) / data.revenue) * 100
            results.append(f"Profit Margin: {profit_margin:.2f}%")
            
        if data.current_liabilities > 0:
            current_ratio = data.current_assets / data.current_liabilities
            results.append(f"Current Ratio: {current_ratio:.2f}")
            
        if not results:
            return "Tool 'financial_calculator': Insufficient data to compute ratios."
            
        return f"Tool 'financial_calculator' results: " + ", ".join(results)
