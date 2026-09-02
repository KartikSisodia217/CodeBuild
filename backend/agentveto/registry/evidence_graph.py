"""
Evidence Registry (DAG Generation)
Owner: Nishit (Policy & Evidence Engineer)

Transforms OpenInference execution spans and evaluation verdicts into interactive React Flow DAGs.
- Computes node layout coordinates (hierarchical/linear DAG flow).
- Categorizes node types: UserPromptNode, LLMReasoningNode, ToolSourceNode (Yellow/Amber), ToolSinkNode (Red/Veto), ToolSafeNode (Green).
- Constructs animated directional edges showing data and control flow, highlighting tainted edges in red.
"""

from typing import Optional, List, Dict, Any
from agentveto.contracts.schemas import (
    TrajectoryData,
    EvaluationResult,
    EvaluationStatus,
    EvidenceDAG,
    EvidenceDAGNode,
    EvidenceDAGEdge,
    DAGNodeData,
    SpanKind,
)
from agentveto.evaluator.policy_engine import evaluate_trace


class EvidenceGraphBuilder:
    def __init__(self):
        pass

    def generate_dag(
        self,
        trace: TrajectoryData,
        eval_result: Optional[EvaluationResult] = None
    ) -> EvidenceDAG:
        """
        Converts OpenInference trajectory spans into a React Flow compatible Evidence DAG.
        """
        if eval_result is None:
            eval_result = evaluate_trace(trace)

        nodes: List[EvidenceDAGNode] = []
        edges: List[EvidenceDAGEdge] = []

        root_node_id = "node_user_prompt"
        nodes.append(
            EvidenceDAGNode(
                id=root_node_id,
                type="user_prompt",
                data=DAGNodeData(
                    label="User Prompt",
                    kind=SpanKind.AGENT,
                    name=f"Agent: {trace.agent_name}",
                    status="INIT",
                    inputs=trace.user_prompt,
                    span_id=root_node_id,
                    details={"system_prompt": trace.system_prompt or "Standard Agent System Prompt"}
                ),
                position={"x": 50.0, "y": 180.0}
            )
        )

        prev_node_id = root_node_id
        x_offset = 400.0
        y_center = 180.0
        
        taint_active = False
        veto_count = 1 if eval_result.status == EvaluationStatus.CRITICAL_VETO else 0
        warning_count = 1 if eval_result.status == EvaluationStatus.WARN else 0

        for i, span in enumerate(trace.spans):
            node_id = f"node_{span.span_id}"
            is_injection = span.span_id == eval_result.injection_source_span_id or span.is_injection_source
            is_sink = span.span_id == eval_result.violating_span_id or span.is_unauthorized_sink
            
            if is_injection:
                taint_active = True

            if is_sink:
                node_type = "veto_sink"
            elif is_injection:
                node_type = "injection_source"
            elif span.kind == SpanKind.LLM:
                node_type = "llm_reasoning"
            elif span.kind == SpanKind.TOOL:
                node_type = "tool_execution"
            else:
                node_type = "agent_step"

            label = span.name or (span.tool_name if span.tool_name else f"{span.kind.value} Step")
            status_text = "VETOED" if is_sink else ("TAINTED / INJECTION" if is_injection else span.status_code)

            threat_cat_str = None
            if span.threat_category:
                threat_cat_str = span.threat_category.value if hasattr(span.threat_category, "value") else str(span.threat_category)
            elif is_sink and eval_result.threat_category:
                threat_cat_str = eval_result.threat_category.value if hasattr(eval_result.threat_category, "value") else str(eval_result.threat_category)

            node_data = DAGNodeData(
                label=label,
                kind=span.kind,
                name=span.tool_name or span.name,
                status=status_text,
                is_injection_source=is_injection,
                is_unauthorized_sink=is_sink,
                is_vetoed=is_sink,
                inputs=span.tool_parameters if span.tool_parameters else (span.llm_prompt or span.input_value),
                outputs=span.output_value or span.llm_response,
                threat_category=threat_cat_str,
                span_id=span.span_id,
                details={
                    "start_time": span.start_time,
                    "end_time": span.end_time,
                    "attributes": span.attributes,
                    "is_tainted": taint_active
                }
            )

            y_pos = y_center
            if span.kind == SpanKind.LLM:
                y_pos = y_center - 60.0
            elif span.kind == SpanKind.TOOL:
                y_pos = y_center + 60.0

            nodes.append(
                EvidenceDAGNode(
                    id=node_id,
                    type=node_type,
                    data=node_data,
                    position={"x": x_offset, "y": y_pos}
                )
            )

            edge_id = f"edge_{prev_node_id}_{node_id}"
            is_tainted_edge = taint_active and (is_injection or is_sink or span.kind == SpanKind.LLM)
            
            edge_style = {
                "stroke": "#EF4444" if is_tainted_edge else "#3B82F6",
                "strokeWidth": 2.5 if is_tainted_edge else 1.8,
                "strokeDasharray": "5,5" if is_tainted_edge else None
            }

            edges.append(
                EvidenceDAGEdge(
                    id=edge_id,
                    source=prev_node_id,
                    target=node_id,
                    animated=is_tainted_edge,
                    style=edge_style,
                    label="Tainted Control Flow" if (is_tainted_edge and is_sink) else None
                )
            )

            prev_node_id = node_id
            x_offset += 380.0

        summary_text = (
            f"Trajectory evaluated: {len(trace.spans)} spans processed. "
            f"Verdict: {eval_result.status.value if hasattr(eval_result.status, 'value') else eval_result.status}. "
            f"Reason: {eval_result.reason}"
        )

        return EvidenceDAG(
            run_id=trace.run_id,
            agent_name=trace.agent_name,
            nodes=nodes,
            edges=edges,
            evaluation=eval_result,
            summary=summary_text,
            veto_count=veto_count,
            warning_count=warning_count
        )


_dag_builder = EvidenceGraphBuilder()

def generate_dag(trace: TrajectoryData, eval_result: Optional[EvaluationResult] = None) -> EvidenceDAG:
    """Convenience function matching Member 4 interface spec."""
    return _dag_builder.generate_dag(trace, eval_result)
