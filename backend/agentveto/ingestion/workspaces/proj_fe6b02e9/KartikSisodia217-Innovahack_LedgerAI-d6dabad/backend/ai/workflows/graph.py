from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END

from backend.ai.memory.blackboard import BlackboardState
from backend.ai.workflows.reducers import merge_blackboard_state
from backend.ai.workflows.routing import route_after_partner, route_after_audit
from backend.ai.workflows.checkpoint import checkpoint_manager

# Import Agents
from backend.ai.agents.partner import PartnerAgent
from backend.ai.agents.ledger import LedgerAgent
from backend.ai.agents.gst import GSTAgent
from backend.ai.agents.compliance import ComplianceAgent
from backend.ai.agents.audit import AuditAgent
from backend.ai.agents.financial import FinancialAgent

# LangGraph requires a State definition. 
# We use a wrapper TypedDict that relies on our Pydantic BlackboardState and Reducer.
class GraphState(TypedDict):
    blackboard: Annotated[BlackboardState, merge_blackboard_state]

class WorkflowOrchestrator:
    """Constructs and compiles the LangGraph state machine."""
    
    def __init__(self):
        self.builder = StateGraph(GraphState)
        
        # Instantiate Agents
        self.partner = PartnerAgent()
        self.accounting = LedgerAgent()
        self.gst = GSTAgent()
        self.compliance = ComplianceAgent()
        self.audit = AuditAgent()
        self.analyst = FinancialAgent()
        
    def _get_blackboard(self, state: GraphState) -> BlackboardState:
        """Helper to safely extract and cast the BlackboardState from the GraphState."""
        bb = state.get("blackboard")
        if isinstance(bb, dict):
            return BlackboardState(**bb)
        return bb

    def _wrap_agent(self, agent_instance):
        """Wraps an agent's async invoke method for LangGraph compatibility."""
        async def node_func(state: GraphState):
            bb = self._get_blackboard(state)
            updates = await agent_instance.invoke(bb)
            
            # If routing back to accounting, increment error count
            if agent_instance.agent_name == "audit" and not updates.get("audit_status", {}).approved:
                updates["error_count"] = bb.error_count + 1
                
            return {"blackboard": updates}
        return node_func

    def build(self) -> StateGraph:
        """Builds the nodes and edges of the DAG."""
        # Add Nodes
        self.builder.add_node("partner_agent", self._wrap_agent(self.partner))
        self.builder.add_node("accounting_agent", self._wrap_agent(self.accounting))
        self.builder.add_node("gst_agent", self._wrap_agent(self.gst))
        self.builder.add_node("compliance_agent", self._wrap_agent(self.compliance))
        self.builder.add_node("audit_agent", self._wrap_agent(self.audit))
        self.builder.add_node("financial_analyst_agent", self._wrap_agent(self.analyst))
        
        # Entry Point
        self.builder.set_entry_point("partner_agent")
        
        # Conditional Routing from Partner
        self.builder.add_conditional_edges(
            "partner_agent",
            lambda state: route_after_partner(self._get_blackboard(state)),
            {
                "accounting_agent": "accounting_agent",
                "end": END
            }
        )
        
        # Parallel Execution: Accounting -> GST & Compliance
        self.builder.add_edge("accounting_agent", "gst_agent")
        self.builder.add_edge("accounting_agent", "compliance_agent")
        
        # Convergence: GST & Compliance -> Audit
        self.builder.add_edge("gst_agent", "audit_agent")
        self.builder.add_edge("compliance_agent", "audit_agent")
        
        # Conditional Routing from Audit (Disagree-or-Commit & HITL)
        self.builder.add_conditional_edges(
            "audit_agent",
            lambda state: route_after_audit(self._get_blackboard(state)),
            {
                "hitl_interrupt": END, # Pause graph execution for HITL
                "financial_analyst_agent": "financial_analyst_agent",
                "accounting_agent": "accounting_agent", # Retry loop
                "end": END
            }
        )
        
        self.builder.add_edge("financial_analyst_agent", END)
        
        return self.builder

    async def compile(self):
        """Compiles the graph with the Postgres checkpointer."""
        graph = self.build()
        saver = await checkpoint_manager.get_saver()
        return graph.compile(checkpointer=saver)

async def run_workflow(raw_text: str, task_id: str):
    """
    Master entrypoint for the backend API to trigger the multi-agent AI execution.
    Initializes the state and streams execution via LangGraph.
    """
    from backend.observability.logger import logger
    logger.info(f"Initiating workflow for task: {task_id}")
    
    orchestrator = WorkflowOrchestrator()
    app = await orchestrator.compile()
    
    initial_state = {
        "blackboard": {
            "transaction_id": task_id,
            "raw_text": raw_text,
            "error_count": 0,
            "human_input_required": False
        }
    }
    
    config = {"configurable": {"thread_id": task_id}}
    
    # We invoke the graph. For SSE streaming, the API endpoint will use astream.
    # But for background processing, we just ainvoke.
    try:
        result = await app.ainvoke(initial_state, config=config)
        logger.info(f"Workflow completed for task: {task_id}")
        return result
    except Exception as e:
        logger.error(f"Workflow failed for task {task_id}: {str(e)}", exc_info=True)
        return None
