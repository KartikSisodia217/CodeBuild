import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Clock
} from 'lucide-react';
import clsx from 'clsx';

export default function ExecutionTrace({ trace, evaluation }) {
  const [expandedSpanId, setExpandedSpanId] = useState(null);

  if (!trace || !trace.spans) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No execution trace recorded.
      </div>
    );
  }

  const spans = trace.spans || [];
  const timelineEvents = [];

  // Initial user event
  timelineEvents.push({
    id: "evt_init",
    time: "00.00s",
    kind: "AGENT",
    name: "Received user task",
    content: trace.user_prompt || "Execute customer ticket workflow",
    isTainted: false,
    isSink: false,
    isInjection: false
  });

  spans.forEach((span, i) => {
    const isInjection = span.is_injection_source || span.span_id === evaluation?.injection_source_span_id;
    const isSink = span.is_unauthorized_sink || span.span_id === evaluation?.violating_span_id;
    const timeOffset = (0.28 * (i + 1)).toFixed(2);

    if (span.kind === 'TOOL') {
      timelineEvents.push({
        id: span.span_id,
        time: `00.${timeOffset}s`,
        kind: "TOOL",
        name: `${span.tool_name || span.name}()`,
        content: span.tool_parameters || span.input_value || "Parameters recorded",
        response: span.output_value,
        isSink: isSink,
        isInjection: isInjection,
        isTainted: span.is_tainted,
        classification: isSink ? "DATA SINK" : (isInjection ? "DATA SOURCE" : "UTILITY TOOL"),
        risk: isSink ? "HIGH" : (isInjection ? "ELEVATED" : "LOW"),
        intercepted: "YES",
        executed: isSink ? "NO (BLOCKED)" : "YES (MOCKED)",
        sandbox: "Synthetic"
      });

      if (isInjection) {
        timelineEvents.push({
          id: `evt_inj_${span.span_id}`,
          time: `00.${(parseFloat(timeOffset) + 0.05).toFixed(2)}s`,
          kind: "ATTACK",
          name: "Payload injected into tool response",
          content: "Adversarial indirect prompt injection embedded into ticket content.",
          source: span.tool_name || span.name,
          type: "Indirect Prompt Injection",
          threat: span.threat_category || evaluation?.threat_category || "ASI01",
          agentInfluenced: "YES",
          isInjection: true
        });
      }
    } else if (span.kind === 'LLM') {
      timelineEvents.push({
        id: span.span_id,
        time: `00.${timeOffset}s`,
        kind: "LLM",
        name: "Agent processed tool response",
        content: span.llm_response || span.output_value || "Model parsed tool response & generated tool call plan",
        isTainted: span.is_tainted
      });
    } else {
      timelineEvents.push({
        id: span.span_id,
        time: `00.${timeOffset}s`,
        kind: span.kind || "STEP",
        name: span.name,
        content: span.output_value || span.attributes || "Nominal step"
      });
    }
  });

  // Final Gate Event if VETO
  if (evaluation?.status === 'CRITICAL_VETO' || evaluation?.verdict === 'VETO') {
    timelineEvents.push({
      id: "evt_sandbox",
      time: "02.02s",
      kind: "SANDBOX",
      name: "State mutation intercepted",
      content: "Unauthorized state delta recorded in isolated sandbox before commit."
    });
    timelineEvents.push({
      id: "evt_policy",
      time: "02.14s",
      kind: "POLICY",
      name: `${evaluation.threat_category || 'ASI01'} Invariant Violation`,
      content: evaluation.reason
    });
    timelineEvents.push({
      id: "evt_gate",
      time: "02.15s",
      kind: "GATE",
      name: "🔴 DETERMINISTIC VETO",
      content: "Build halted. CI/CD exit code 1 triggered."
    });
  }

  const toggleExpand = (id) => {
    setExpandedSpanId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#22222a]">
        <div>
          <h3 className="text-xs font-mono font-medium text-[#a2a4a9] uppercase tracking-[0.094em]">
            OpenInference Execution Trace & Telemetry Stream
          </h3>
          <p className="text-[11px] text-[#60606c] font-mono">Run ID: {trace.run_id}</p>
        </div>
        <span className="text-[11px] font-mono text-[#a2a4a9] bg-[#0d0e12] px-3 py-1 rounded-full border border-[#22222a]">
          {timelineEvents.length} Captured Events
        </span>
      </div>

      <div className="rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 divide-y divide-[#22222a] overflow-hidden">
        {timelineEvents.map((evt) => {
          const isExpanded = expandedSpanId === evt.id;
          const isVetoGate = evt.kind === 'GATE';
          const isAttack = evt.kind === 'ATTACK';
          const isSink = evt.isSink;

          return (
            <div key={evt.id} className="transition-colors">
              
              {/* Timeline Header Row */}
              <div 
                onClick={() => toggleExpand(evt.id)}
                className={clsx(
                  "p-4 flex items-center justify-between cursor-pointer hover:bg-[#141418]/60 select-none",
                  isVetoGate ? "bg-[#f43f5e]/10" : isAttack ? "bg-[#70dcd3]/5" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-[#a2a4a9] w-16">
                    {evt.time}
                  </span>

                  <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border",
                    evt.kind === 'GATE' ? "border-[#f43f5e] text-[#f43f5e]" :
                    evt.kind === 'POLICY' ? "border-[#f43f5e] text-[#f43f5e]" :
                    evt.kind === 'ATTACK' ? "border-[#70dcd3] text-[#70dcd3]" :
                    evt.kind === 'TOOL' ? (isSink ? "border-[#f43f5e] text-[#f43f5e]" : "border-[#70dcd3] text-[#70dcd3]") :
                    evt.kind === 'LLM' ? "border-[#a2a4a9] text-[#aeaeb7]" :
                    "border-[#2e3038] text-[#a2a4a9]"
                  )}>
                    {evt.kind}
                  </span>

                  <span className={clsx(
                    "text-xs font-mono tracking-wide font-medium",
                    isVetoGate ? "text-[#f43f5e]" : isAttack ? "text-[#70dcd3]" : isSink ? "text-[#f43f5e]" : "text-white"
                  )}>
                    {evt.name}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {evt.classification && (
                    <span className={clsx(
                      "text-[10px] font-mono px-2.5 py-0.5 rounded-full border",
                      evt.classification === 'DATA SINK' ? "border-[#f43f5e] text-[#f43f5e]" : "border-[#2e3038] text-[#a2a4a9]"
                    )}>
                      {evt.classification}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-[#a2a4a9]" /> : <ChevronRight className="w-4 h-4 text-[#60606c]" />}
                </div>
              </div>

              {/* Detailed Card View when expanded */}
              {isExpanded && (
                <div className="p-5 bg-[#141418] border-t border-[#22222a] space-y-3 font-mono text-xs">
                  
                  {/* Tool Specific Details */}
                  {evt.kind === 'TOOL' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Risk Level</span>
                        <div className={clsx("font-medium text-xs mt-0.5", evt.risk === 'HIGH' ? "text-[#f43f5e]" : "text-white")}>{evt.risk}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Intercepted</span>
                        <div className="font-medium text-xs text-[#70dcd3] mt-0.5">{evt.intercepted}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Executed on Target</span>
                        <div className={clsx("font-medium text-xs mt-0.5", evt.executed.includes('BLOCKED') ? "text-[#f43f5e]" : "text-white")}>{evt.executed}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Sandbox</span>
                        <div className="font-medium text-xs text-[#70dcd3] mt-0.5">{evt.sandbox}</div>
                      </div>
                    </div>
                  )}

                  {/* Injection Specific Details */}
                  {evt.kind === 'ATTACK' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Source Tool</span>
                        <div className="font-medium text-xs text-[#70dcd3] mt-0.5">{evt.source}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Type</span>
                        <div className="font-medium text-xs text-white mt-0.5">{evt.type}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Threat Code</span>
                        <div className="font-medium text-xs text-[#f43f5e] mt-0.5">{evt.threat}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0d0e12] border border-[#22222a]">
                        <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Agent Influenced</span>
                        <div className="font-medium text-xs text-[#70dcd3] mt-0.5">{evt.agentInfluenced}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Payload / Event Metadata</span>
                    <pre className="mt-1 p-3 rounded-xl bg-[#0d0e12] border border-[#22222a] text-[#aeaeb7] overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                      {typeof evt.content === 'object' ? JSON.stringify(evt.content, null, 2) : String(evt.content)}
                    </pre>
                  </div>

                  {evt.response && (
                    <div>
                      <span className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em]">Intercepted Output Value</span>
                      <pre className="mt-1 p-3 rounded-xl bg-[#0d0e12] border border-[#22222a] text-[#70dcd3] overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                        {typeof evt.response === 'object' ? JSON.stringify(evt.response, null, 2) : String(evt.response)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
