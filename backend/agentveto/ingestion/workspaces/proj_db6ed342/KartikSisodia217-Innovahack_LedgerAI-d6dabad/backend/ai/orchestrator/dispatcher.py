import asyncio
import time
import uuid
import traceback
from typing import Dict, Any, List
from backend.ai.agents.registry import AgentRegistry
from backend.ai.schemas.execution import (
    ExecutionReport, ExecutionContext, AgentExecutionResult, ExecutionStatus, ToolReport
)
from backend.observability.logger import StructuredLogger

logger = StructuredLogger("AgentDispatcher")

class AgentDispatcher:
    def __init__(self):
        pass
        
    def _sort_by_dag(self, required_specialists: List[str]) -> List[str]:
        # Simple topological sort based on AgentMetadata.depends_on
        sorted_specs = []
        visited = set()
        
        def visit(spec: str):
            if spec in visited:
                return
            try:
                meta = AgentRegistry.get_metadata(spec)
                if not meta:
                    return
                for dep in meta.depends_on:
                    if dep in required_specialists:
                        visit(dep)
                visited.add(spec)
                sorted_specs.append(spec)
            except ValueError:
                pass

        for spec in required_specialists:
            visit(spec.lower())
            
        return sorted_specs

    async def _execute_with_retry(self, meta, context: ExecutionContext, max_retries=1) -> AgentExecutionResult:
        agent_name = meta.internal_name
        agent_instance = meta.agent_instance
        
        for attempt in range(max_retries + 1):
            try:
                logger.debug(f"Agent_Start", agent=agent_name, attempt=attempt+1)
                result = await agent_instance.execute(context)
                logger.info(f"Agent_Finish", agent=agent_name, status=result.status.value, duration_ms=result.execution_time_ms)
                return result
            except Exception as e:
                logger.error(f"Agent_Failure", agent=agent_name, error=str(e), attempt=attempt+1)
                if attempt < max_retries:
                    await asyncio.sleep(0.2) # 200ms exponential backoff
                else:
                    return AgentExecutionResult(
                        agent_name=meta.display_name,
                        status=ExecutionStatus.FAILED,
                        error_type=type(e).__name__,
                        error_message=str(e),
                        execution_time_ms=0.0
                    )

    async def dispatch(self, query: str, context_data: str, required_specialists: List[str], execution_mode: str = "execution", debug: bool = False) -> ExecutionReport:
        request_id = str(uuid.uuid4())
        trace_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.trace(request_id, trace_id, "Dispatch_Start", intent="classified", mode=execution_mode, selected=required_specialists)
        
        sorted_specialists = self._sort_by_dag(required_specialists)
        
        # Initialize ExecutionReport
        report = ExecutionReport(
            request_id=request_id,
            execution_trace_id=trace_id,
            intent="dynamic",
            execution_mode=execution_mode,
            selected_specialists=sorted_specialists,
            execution_graph={}
        )
        
        from backend.observability.health import RuntimeHealth
        
        # Initial ExecutionContext
        exec_context = ExecutionContext(
            request_id=request_id,
            execution_trace_id=trace_id,
            query=query,
            context_data=context_data,
            execution_mode=execution_mode,
            debug=debug,
            previous_findings={},
            runtime_health=RuntimeHealth.get_health()
        )
        
        for spec in sorted_specialists:
            try:
                meta = AgentRegistry.get_metadata(spec)
                if not meta:
                    continue
                
                # Update dependencies list for context
                exec_context.dependencies = meta.depends_on
                exec_context.available_tools = meta.supported_tools
                
                if execution_mode == "planning":
                    # Skip actual execution in planning mode
                    res = AgentExecutionResult(
                        agent_name=meta.display_name,
                        status=ExecutionStatus.SKIPPED,
                        skip_reason="Planning mode active. Execution bypassed."
                    )
                    report.execution_graph[meta.internal_name] = res
                    continue
                
                result = await self._execute_with_retry(meta, exec_context)
                report.execution_graph[meta.internal_name] = result
                
                if result.status == ExecutionStatus.COMPLETED and result.findings:
                    exec_context.previous_findings[meta.internal_name] = result
                    
                if result.status == ExecutionStatus.FAILED:
                    report.errors.append(f"{meta.display_name} failed: {result.error_message}")
                    
            except Exception as e:
                logger.error("Dispatcher_Error", error=str(e), trace=traceback.format_exc())
                
        report.total_time_ms = (time.time() - start_time) * 1000
        logger.trace(request_id, trace_id, "Dispatch_Complete", total_time_ms=report.total_time_ms)
        
        return report
