from typing import Dict, Any, List, Type
from pydantic import BaseModel
import logging

from backend.ai.agents.base import BaseAgent
from backend.ai.agents.gst import GSTAgent

# Import financial_toolkit to execute its tool registration calls
import backend.ai.tools.financial_toolkit

# Import all agents
from backend.ai.agents.ledger import LedgerAgent
from backend.ai.agents.financial import FinancialAgent
from backend.ai.agents.accounts_receivable import AccountsReceivableAgent
from backend.ai.agents.accounts_payable import AccountsPayableAgent
from backend.ai.agents.expense_intelligence import ExpenseIntelligenceAgent
from backend.ai.agents.invoice_specialist import InvoiceSpecialistAgent
from backend.ai.agents.audit import AuditAgent
from backend.ai.agents.fraud import FraudDetectionAgent
from backend.ai.agents.risk import RiskAssessmentAgent
from backend.ai.agents.tax import TaxAgent
from backend.ai.agents.compliance import ComplianceAgent
from backend.ai.agents.legal import LegalAgent
from backend.ai.agents.cfo import CFOAgent
from backend.ai.agents.forecasting import ForecastingAgent
from backend.ai.agents.document import DocumentAgent
from backend.ai.agents.general import GeneralAgent

logger = logging.getLogger(__name__)

class AgentMetadata(BaseModel):
    internal_name: str
    display_name: str
    department: str
    depends_on: List[str] = []
    responsibilities: List[str]
    capabilities: List[str]
    supported_intents: List[str]
    supported_tools: List[str]
    color_class: str
    agent_instance: BaseAgent

    class Config:
        arbitrary_types_allowed = True

class Registry:
    def __init__(self):
        self._agents: Dict[str, AgentMetadata] = {}
        self._initialize_registry()

    def _initialize_registry(self):
        # Base Level: Document Intelligence
        self.register(AgentMetadata(
            internal_name="document", display_name="Document Intelligence", department="Cross-functional", depends_on=[],
            responsibilities=["Document summarization", "Content extraction"],
            capabilities=["OCR parsing"], supported_intents=["Document"], supported_tools=[],
            color_class="bg-indigo-400", agent_instance=DocumentAgent()
        ))

        # Level 1: Accounting (depends on Document)
        self.register(AgentMetadata(
            internal_name="ledger", display_name="Ledger Specialist", department="Accounting", depends_on=["document"],
            responsibilities=["Ledger reconciliation", "Journal verification", "Debit/Credit validation", "Balance verification"],
            capabilities=["Extract ledger entries", "Validate balances"], supported_intents=["Ledger"], supported_tools=["Balance Validator"],
            color_class="bg-blue-400", agent_instance=LedgerAgent()
        ))
        self.register(AgentMetadata(
            internal_name="financial", display_name="Financial Analyst", department="Accounting", depends_on=["document"],
            responsibilities=["Cash Flow", "Revenue Analysis", "Expense Analysis", "Profitability", "Liquidity", "Financial Health"],
            capabilities=["Calculate ratios", "Analyze trends"], supported_intents=["Financial"], supported_tools=["Ratio Calculator"],
            color_class="bg-teal-400", agent_instance=FinancialAgent()
        ))
        self.register(AgentMetadata(
            internal_name="accounts_receivable", display_name="Accounts Receivable Specialist", department="Accounting", depends_on=["document"],
            responsibilities=["Outstanding invoices", "Customer aging", "Incoming payments", "Collections"],
            capabilities=["Aging analysis"], supported_intents=["Accounts Receivable"], supported_tools=["Aging Analysis"],
            color_class="bg-blue-300", agent_instance=AccountsReceivableAgent()
        ))
        self.register(AgentMetadata(
            internal_name="accounts_payable", display_name="Accounts Payable Specialist", department="Accounting", depends_on=["document"],
            responsibilities=["Vendor liabilities", "Due invoices", "Payment schedules"],
            capabilities=["Liability tracking"], supported_intents=["Accounts Payable"], supported_tools=[],
            color_class="bg-blue-500", agent_instance=AccountsPayableAgent()
        ))
        self.register(AgentMetadata(
            internal_name="expense_intelligence", display_name="Expense Intelligence Specialist", department="Accounting", depends_on=["document"],
            responsibilities=["Merchant categorization", "Spending categories", "Subscription detection"],
            capabilities=["Expense categorization"], supported_intents=["Expense Intelligence"], supported_tools=["Variance Calculator"],
            color_class="bg-green-300", agent_instance=ExpenseIntelligenceAgent()
        ))
        self.register(AgentMetadata(
            internal_name="invoice", display_name="Invoice Specialist", department="Accounting", depends_on=["document"],
            responsibilities=["Invoice extraction", "Vendor matching", "Payment terms", "Duplicate detection"],
            capabilities=["Extract invoice data"], supported_intents=["Invoice"], supported_tools=["Duplicate Detection"],
            color_class="bg-indigo-300", agent_instance=InvoiceSpecialistAgent()
        ))

        # Level 2: Audit & Risk (depends on Accounting)
        self.register(AgentMetadata(
            internal_name="audit", display_name="Audit Specialist", department="Audit & Risk", depends_on=["ledger", "financial"],
            responsibilities=["Duplicate payments", "Missing entries", "Reconciliation", "Evidence verification"],
            capabilities=["Detect anomalies"], supported_intents=["Audit"], supported_tools=["Duplicate Detection", "Reconciliation Engine"],
            color_class="bg-red-400", agent_instance=AuditAgent()
        ))
        self.register(AgentMetadata(
            internal_name="fraud", display_name="Fraud Detection Specialist", department="Audit & Risk", depends_on=["ledger", "financial", "audit"],
            responsibilities=["Suspicious vendors", "Transaction anomalies", "Potential fraud indicators"],
            capabilities=["Detect fraud patterns"], supported_intents=["Fraud"], supported_tools=["Outlier Detection"],
            color_class="bg-red-600", agent_instance=FraudDetectionAgent()
        ))
        self.register(AgentMetadata(
            internal_name="risk", display_name="Risk Assessment Specialist", department="Audit & Risk", depends_on=["ledger", "financial"],
            responsibilities=["Liquidity Risk", "Credit Risk", "Vendor Concentration", "Financial Exposure"],
            capabilities=["Risk calculation"], supported_intents=["Risk"], supported_tools=["Financial KPI Engine"],
            color_class="bg-orange-500", agent_instance=RiskAssessmentAgent()
        ))

        # Level 3: Tax & Compliance (depends on Accounting and Audit)
        self.register(AgentMetadata(
            internal_name="tax", display_name="Tax Specialist", department="Tax & Compliance", depends_on=["ledger", "audit"],
            responsibilities=["GST", "Tax calculations", "ITC validation", "Tax implications"],
            capabilities=["Calculate tax"], supported_intents=["Tax"], supported_tools=["Calculator"],
            color_class="bg-green-500", agent_instance=TaxAgent()
        ))
        self.register(AgentMetadata(
            internal_name="compliance", display_name="Compliance Specialist", department="Tax & Compliance", depends_on=["ledger", "audit", "risk"],
            responsibilities=["Documentation review", "Regulatory observations", "Financial reporting compliance"],
            capabilities=["Validate policy"], supported_intents=["Compliance"], supported_tools=[],
            color_class="bg-purple-400", agent_instance=ComplianceAgent()
        ))

        # Level 4: Legal & Advisory (depends on everything prior)
        self.register(AgentMetadata(
            internal_name="legal", display_name="Legal Specialist", department="Legal & Advisory", depends_on=["compliance", "risk"],
            responsibilities=["Contract review", "Financial obligations", "Vendor agreements", "Legal observations"],
            capabilities=["Clause extraction"], supported_intents=["Legal"], supported_tools=[],
            color_class="bg-yellow-400", agent_instance=LegalAgent()
        ))
        self.register(AgentMetadata(
            internal_name="cfo", display_name="CFO Advisor", department="Legal & Advisory", depends_on=["financial", "risk", "tax", "forecasting"],
            responsibilities=["Strategic recommendations", "Cash optimization", "Cost reduction opportunities", "Financial planning"],
            capabilities=["Executive reporting"], supported_intents=["CFO"], supported_tools=["Financial KPI Engine"],
            color_class="bg-yellow-600", agent_instance=CFOAgent()
        ))
        self.register(AgentMetadata(
            internal_name="forecasting", display_name="Forecasting Specialist", department="Legal & Advisory", depends_on=["financial", "ledger"],
            responsibilities=["Cash flow forecasting", "Revenue forecasting", "Trend prediction"],
            capabilities=["Time-series forecasting"], supported_intents=["Forecasting"], supported_tools=["Trend Detection"],
            color_class="bg-teal-600", agent_instance=ForecastingAgent()
        ))

        # Lead Partner (depends on all executed specialists)
        self.register(AgentMetadata(
            internal_name="general", display_name="Lead Partner", department="Executive", depends_on=[],
            responsibilities=["Conversation orchestration", "General inquiries", "Synthesis"],
            capabilities=["Routing", "Conversation"], supported_intents=["Conversation"], supported_tools=[],
            color_class="bg-gray-400", agent_instance=GeneralAgent()
        ))

    def register(self, metadata: AgentMetadata):
        self._agents[metadata.internal_name] = metadata

    def get_agent(self, internal_name: str) -> BaseAgent:
        meta = self._agents.get(internal_name)
        if not meta:
            raise ValueError(f"Agent '{internal_name}' not found in registry.")
        return meta.agent_instance

    def get_metadata(self, internal_name: str) -> AgentMetadata:
        return self._agents.get(internal_name)

    def get_all_metadata(self) -> List[AgentMetadata]:
        return list(self._agents.values())

    def validate_all(self):
        """Called on startup to ensure all specialists are correctly registered, tools exist, and dependencies are valid."""
        import inspect
        from backend.ai.tools.registry import registry as tool_registry
        from backend.ai.schemas.execution import ExecutionContext, AgentExecutionResult
        
        for name, meta in self._agents.items():
            if not isinstance(meta.agent_instance, BaseAgent):
                raise RuntimeError(f"Agent {name} is not a valid BaseAgent instance.")
            if not hasattr(meta.agent_instance, 'execute'):
                raise RuntimeError(f"Agent {name} does not have an 'execute' method.")
            
            # Validate signature
            sig = inspect.signature(meta.agent_instance.execute)
            if 'context' not in sig.parameters:
                raise RuntimeError(f"Agent {name} execute method must take a 'context' parameter.")
            
            # Basic validation that supported tools is a list of strings
            if not isinstance(meta.supported_tools, list):
                raise RuntimeError(f"Agent {name} supported_tools must be a list.")
                
            for tool_name in meta.supported_tools:
                try:
                    tool_registry.get_tool(tool_name)
                except ValueError:
                    raise RuntimeError(f"Agent {name} references non-existent tool: {tool_name}")
                    
            for dep in meta.depends_on:
                if dep not in self._agents:
                    raise RuntimeError(f"Agent {name} depends on non-existent agent: {dep}")
                    
        logger.info(f"AgentRegistry: Successfully validated {len(self._agents)} agents.")

    def get_prompt_injection(self) -> str:
        """Returns a formatted string of all agents and their responsibilities for the Lead Partner prompt."""
        lines = ["Registered Specialists and Departments:"]
        
        # Group by department
        departments = {}
        for meta in self._agents.values():
            if meta.department not in departments:
                departments[meta.department] = []
            departments[meta.department].append(meta)
            
        for dept, agents in departments.items():
            lines.append(f"\n[{dept} Department]")
            for a in agents:
                lines.append(f"- {a.display_name} ({a.internal_name}):")
                lines.append(f"  Responsibilities: {', '.join(a.responsibilities)}")
                lines.append(f"  Capabilities: {', '.join(a.capabilities)}")
                
        return "\n".join(lines)

AgentRegistry = Registry()
