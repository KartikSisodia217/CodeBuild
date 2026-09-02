import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  Code, 
  Bug, 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  Clock,
  AlertTriangle
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

  // Generate clean OpenInference timeline events
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
  if (evaluation?.status === 'CRITICAL_VETO') {
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
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
            OpenInference Execution Trace & Telemetry Stream
          </h3>
          <p className="text-[11px] text-slate-500">Run ID: {trace.run_id}</p>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {timelineEvents.length} Captured Events
        </span>
      </div>

      <div className="rounded-2xl bg-[#121824] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-xl">
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
                  "p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none",
                  isVetoGate ? "bg-red-950/20" : isAttack ? "bg-amber-950/20" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-500 w-14">
                    {evt.time}
                  </span>

                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                    evt.kind === 'GATE' ? "bg-red-500/20 text-red-400 border-red-500/40" :
                    evt.kind === 'POLICY' ? "bg-red-500/10 text-red-300 border-red-500/30" :
                    evt.kind === 'ATTACK' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                    evt.kind === 'TOOL' ? (isSink ? "bg-red-500/10 text-red-300 border-red-500/30" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30") :
                    evt.kind === 'LLM' ? "bg-purple-500/10 text-purple-300 border-purple-500/30" :
                    "bg-slate-800 text-slate-300 border-slate-700"
                  )}>
                    {evt.kind}
                  </span>

                  <span className={clsx(
                    "text-xs font-bold font-mono tracking-wide",
                    isVetoGate ? "text-red-400" : isAttack ? "text-amber-300" : isSink ? "text-red-300" : "text-white"
                  )}>
                    {evt.name}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {evt.classification && (
                    <span className={clsx(
                      "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded",
                      evt.classification === 'DATA SINK' ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"
                    )}>
                      {evt.classification}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                </div>
              </div>

              {/* Detailed Card View when expanded */}
              {isExpanded && (
                <div className="p-4 bg-[#0B0F17] border-t border-slate-800/80 space-y-3 font-mono text-xs">
                  
                  {/* Tool Specific Details */}
                  {evt.kind === 'TOOL' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Risk Level</span>
                        <div className={clsx("font-bold text-xs", evt.risk === 'HIGH' ? "text-red-400" : "text-slate-300")}>{evt.risk}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Intercepted</span>
                        <div className="font-bold text-xs text-emerald-400">{evt.intercepted}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Executed on Target</span>
                        <div className={clsx("font-bold text-xs", evt.executed.includes('BLOCKED') ? "text-red-400 font-bold" : "text-slate-300")}>{evt.executed}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Sandbox</span>
                        <div className="font-bold text-xs text-indigo-300">{evt.sandbox}</div>
                      </div>
                    </div>
                  )}

                  {/* Injection Specific Details */}
                  {evt.kind === 'ATTACK' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Source Tool</span>
                        <div className="font-bold text-xs text-amber-400">{evt.source}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Type</span>
                        <div className="font-bold text-xs text-slate-300">{evt.type}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Threat Code</span>
                        <div className="font-bold text-xs text-red-400">{evt.threat}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">Agent Influenced</span>
                        <div className="font-bold text-xs text-amber-400">{evt.agentInfluenced}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Payload / Event Metadata</span>
                    <pre className="mt-1 p-2.5 rounded-lg bg-[#06080e] border border-slate-800 text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {typeof evt.content === 'object' ? JSON.stringify(evt.content, null, 2) : String(evt.content)}
                    </pre>
                  </div>

                  {evt.response && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Intercepted Output Value</span>
                      <pre className="mt-1 p-2.5 rounded-lg bg-[#06080e] border border-slate-800 text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
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
