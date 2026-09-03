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
      <div className="p-8 text-center text-av-textMuted font-mono text-xs">
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
      content: evaluation.reason || "Policy invariant violated"
    });
    timelineEvents.push({
      id: "evt_gate",
      time: "02.15s",
      kind: "GATE",
      name: "DETERMINISTIC VETO",
      content: "Build halted. CI/CD exit code 1 triggered."
    });
  }

  const toggleExpand = (id) => {
    setExpandedSpanId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between pb-2 border-b border-av-border">
        <div>
          <h3 className="text-sm font-semibold text-av-textPrimary">
            Execution Timeline
          </h3>
        </div>
        <span className="text-xs font-mono text-av-textMuted">
          {timelineEvents.length} Events
        </span>
      </div>

      <div className="rounded-xl bg-av-surface border border-av-border divide-y divide-av-borderLight shadow-subtle overflow-hidden">
        {timelineEvents.map((evt) => {
          const isExpanded = expandedSpanId === evt.id;
          const isVetoGate = evt.kind === 'GATE';
          const isAttack = evt.kind === 'ATTACK';
          const isSink = evt.isSink;
          const isPolicy = evt.kind === 'POLICY';

          return (
            <div key={evt.id} className="transition-colors group">
              
              {/* Timeline Header Row */}
              <div 
                onClick={() => toggleExpand(evt.id)}
                className={clsx(
                  "p-3 flex items-center justify-between cursor-pointer hover:bg-av-surfaceHover select-none transition-colors",
                  isVetoGate || isPolicy ? "bg-av-vetoBg" : isAttack ? "bg-av-warnBg" : ""
                )}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-av-textMuted w-12 text-right">
                    {evt.time}
                  </span>

                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-semibold border",
                    isVetoGate || isPolicy ? "bg-[#2A1114] text-av-veto border-av-veto/30" :
                    isAttack ? "bg-[#251A0D] text-av-warn border-av-warn/30" :
                    evt.kind === 'TOOL' ? (isSink ? "bg-[#2A1114] text-av-veto border-av-veto/30" : "bg-av-bg text-av-textSecondary border-av-borderLight") :
                    evt.kind === 'LLM' ? "bg-av-bg text-av-textPrimary border-av-borderLight" :
                    "bg-av-bg text-av-textMuted border-transparent"
                  )}>
                    {evt.kind}
                  </span>

                  <span className={clsx(
                    "text-sm font-medium",
                    isVetoGate || isPolicy || isSink ? "text-av-veto" : isAttack ? "text-av-warn" : "text-av-textPrimary"
                  )}>
                    {evt.name}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {evt.classification && (
                    <span className={clsx(
                      "text-[10px] font-mono font-medium px-2 py-0.5 rounded border hidden sm:inline-block uppercase",
                      evt.classification === 'DATA SINK' ? "bg-[#2A1114] text-av-veto border-av-veto/30" : "bg-av-bg text-av-textMuted border-av-border"
                    )}>
                      {evt.classification}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-av-textMuted" /> : <ChevronRight className="w-4 h-4 text-av-borderLight group-hover:text-av-textMuted" />}
                </div>
              </div>

              {/* Detailed Card View when expanded */}
              {isExpanded && (
                <div className="p-4 bg-av-bg border-t border-av-borderLight space-y-3 font-mono text-xs text-av-textSecondary">
                  
                  {/* Tool Specific Details */}
                  {evt.kind === 'TOOL' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Risk Level</span>
                        <div className={clsx("font-medium mt-0.5 text-xs", evt.risk === 'HIGH' ? "text-av-veto" : "text-av-textPrimary")}>{evt.risk}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Intercepted</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.intercepted}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Executed on Target</span>
                        <div className={clsx("font-medium mt-0.5 text-xs", evt.executed.includes('BLOCKED') ? "text-av-veto" : "text-av-textPrimary")}>{evt.executed}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Sandbox</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.sandbox}</div>
                      </div>
                    </div>
                  )}

                  {/* Injection Specific Details */}
                  {evt.kind === 'ATTACK' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Source Tool</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.source}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Type</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.type}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Threat Code</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.threat}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-av-textMuted uppercase font-semibold">Agent Influenced</span>
                        <div className="font-medium mt-0.5 text-xs text-av-textPrimary">{evt.agentInfluenced}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-av-textMuted uppercase font-semibold">Payload / Event Data</span>
                    <pre className="mt-1 p-3 rounded bg-av-surface border border-av-borderLight text-av-textPrimary overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
                      {typeof evt.content === 'object' ? JSON.stringify(evt.content, null, 2) : String(evt.content)}
                    </pre>
                  </div>

                  {evt.response && (
                    <div>
                      <span className="text-[10px] text-av-textMuted uppercase font-semibold">Intercepted Output</span>
                      <pre className="mt-1 p-3 rounded bg-av-surface border border-av-borderLight text-av-textPrimary overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
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
