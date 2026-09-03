import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  X,
  Scale
} from 'lucide-react';
import clsx from 'clsx';
import TraceGraph from './TraceGraph';

export default function EvidenceView({ dag, evaluation, stateDiff }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [evidenceSubtab, setEvidenceSubtab] = useState('dag'); // 'dag', 'state_diff', 'policy_gate'

  const isVeto = evaluation?.status === 'CRITICAL_VETO' || evaluation?.verdict === 'VETO';
  const policyDetails = evaluation?.details || {};
  const injectionDetected = Boolean(policyDetails.injection_detected);
  const behaviorInfluenced = Boolean(policyDetails.agent_behavior_influenced);
  const sinkReached = Boolean(policyDetails.high_risk_sink_reached);
  const unauthorizedMutation = Boolean(policyDetails.unauthorized_state_change);

  // Format state keys
  const beforeState = stateDiff?.before || {};
  const afterState = stateDiff?.after || {};
  const diffKeys = stateDiff?.diff_keys || [];
  const allKeys = Array.from(new Set([...Object.keys(beforeState), ...Object.keys(afterState)]));

  return (
    <div className="flex flex-col h-full space-y-4 max-w-6xl">
      
      {/* Subnav Toggle */}
      <div className="flex items-center justify-between border-b border-av-border pb-3">
        <div className="flex bg-av-bg p-1 rounded-md border border-av-border space-x-1">
          <button
            onClick={() => setEvidenceSubtab('dag')}
            className={clsx(
              "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
              evidenceSubtab === 'dag' ? "bg-av-surfaceElevated text-av-textPrimary border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Evidence DAG</span>
          </button>

          <button
            onClick={() => setEvidenceSubtab('state_diff')}
            className={clsx(
              "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
              evidenceSubtab === 'state_diff' ? "bg-av-surfaceElevated text-av-textPrimary border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. State Invariants</span>
            {diffKeys.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-av-vetoBg text-av-veto font-bold border border-av-veto/30">
                {diffKeys.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setEvidenceSubtab('policy_gate')}
            className={clsx(
              "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
              evidenceSubtab === 'policy_gate' ? "bg-av-surfaceElevated text-av-textPrimary border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. Policy Gate</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EVIDENCE DAG */}
      {evidenceSubtab === 'dag' && (
        <div className="flex-1 relative rounded-xl border border-av-border overflow-hidden bg-av-bg shadow-subtle min-h-[500px]">
          <TraceGraph 
            dag={dag} 
            evaluation={evaluation} 
            onNodeClick={(node) => setSelectedNode(node)}
          />

          {/* Slide-out Inspector Drawer */}
          {selectedNode && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-av-surface border-l border-av-border shadow-modal z-30 flex flex-col">
              <div className="p-4 border-b border-av-border flex items-center justify-between bg-av-surfaceElevated">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-av-textSecondary" />
                  <h3 className="text-xs font-semibold uppercase text-av-textPrimary tracking-wider">
                    Node Inspector
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded text-av-textMuted hover:bg-av-surfaceHover hover:text-av-textPrimary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-av-textMuted uppercase tracking-wider mb-1 font-semibold">Node ID</div>
                  <div className="font-medium text-av-textPrimary">{selectedNode.id}</div>
                </div>

                <div>
                  <div className="text-[10px] text-av-textMuted uppercase tracking-wider mb-1 font-semibold">Classification</div>
                  <div className="font-medium text-av-textPrimary capitalize">
                    {selectedNode.type?.replace('_', ' ')}
                  </div>
                </div>

                {selectedNode.data?.tool_name && (
                  <div>
                    <div className="text-[10px] text-av-textMuted uppercase tracking-wider mb-1 font-semibold">Intercepted Tool</div>
                    <div className="font-medium text-av-info bg-av-infoBg px-2 py-1 inline-block rounded border border-av-info/30">
                      {selectedNode.data.tool_name}()
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-av-textMuted uppercase tracking-wider mb-1 font-semibold">Payload / Data</div>
                  <div className="p-3 rounded-lg bg-av-bg border border-av-borderLight text-av-textSecondary whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {typeof selectedNode.data?.content === 'object' 
                      ? JSON.stringify(selectedNode.data.content, null, 2) 
                      : (selectedNode.data?.content || selectedNode.data?.inputs || 'No input content.')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-av-textMuted uppercase tracking-wider mb-1 font-semibold">Verdict</div>
                  <div className={clsx(
                    "p-3 rounded-lg border flex items-center space-x-2.5",
                    selectedNode.data?.status === 'VETOED' ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-[#101F18] border-av-pass/30 text-av-pass"
                  )}>
                    {selectedNode.data?.status === 'VETOED' ? <ShieldAlert className="w-5 h-5 text-av-veto shrink-0" /> : <ShieldCheck className="w-5 h-5 text-av-pass shrink-0" />}
                    <div>
                      <div className="font-semibold text-sm font-sans">
                        {selectedNode.data?.status === 'VETOED' ? 'Execution Vetoed' : 'Nominal Execution'}
                      </div>
                      <div className="text-xs mt-0.5 opacity-80 font-sans">
                        {selectedNode.data?.status === 'VETOED' 
                          ? 'Blocked via policy before state commit.' 
                          : 'Action passed security constraints.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: STATE DIFF */}
      {evidenceSubtab === 'state_diff' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-av-surface border border-av-border shadow-subtle space-y-6">
            
            <div className="flex items-center justify-between border-b border-av-border pb-4">
              <div>
                <h3 className="text-sm font-semibold text-av-textPrimary tracking-tight">
                  State Mutation
                </h3>
                <p className="text-xs text-av-textSecondary mt-1">
                  Comparing agent initial sandbox state vs. attempted terminal mutation.
                </p>
              </div>

              <div className={clsx(
                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 border",
                stateDiff?.state_mutated ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-[#101F18] border-av-pass/30 text-av-pass"
              )}>
                {stateDiff?.state_mutated ? 'UNAUTHORIZED MUTATION' : 'INVARIANTS PRESERVED'}
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="overflow-x-auto rounded-lg border border-av-borderLight">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-av-surfaceElevated text-av-textSecondary text-[10px] uppercase border-b border-av-borderLight font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">State Field</th>
                    <th className="px-4 py-3">Before (Sandbox Initial)</th>
                    <th className="px-2 py-3"></th>
                    <th className="px-4 py-3">After (Attempted Mutation)</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-av-borderLight bg-av-surface">
                  {allKeys.map(k => {
                    const beforeVal = beforeState[k];
                    const afterVal = afterState[k];
                    const hasChanged = diffKeys.includes(k) || diffKeys.some(dk => dk.startsWith(`${k}.`)) || JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

                    return (
                      <tr key={k} className={hasChanged ? "bg-[#2A1114]" : ""}>
                        <td className="px-4 py-3 font-medium text-av-textPrimary">{k}</td>
                        <td className="px-4 py-3 text-av-textSecondary">{typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal ?? 'undefined')}</td>
                        <td className="px-2 py-3 text-av-borderLight">→</td>
                        <td className={clsx("px-4 py-3", hasChanged ? "text-av-veto font-semibold" : "text-av-textSecondary")}>
                          {typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal ?? 'undefined')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {hasChanged ? (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2A1114] text-av-veto border border-av-veto/30">
                              MUTATED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-av-textMuted font-medium">
                              UNCHANGED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Unauthorized Changes list */}
            {stateDiff?.unauthorized_changes?.length > 0 && (
              <div className="p-4 rounded-lg bg-[#2A1114] border border-av-veto/30 space-y-2">
                <div className="text-xs font-semibold text-av-veto flex items-center space-x-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unauthorized State Invariant Violations ({stateDiff.unauthorized_changes.length}):</span>
                </div>
                <ul className="space-y-1 pl-6 list-disc text-xs text-av-veto font-mono">
                  {stateDiff.unauthorized_changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: POLICY EVALUATION */}
      {evidenceSubtab === 'policy_gate' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-av-surface border border-av-border shadow-subtle space-y-6">
            
            <div className="border-b border-av-border pb-4">
              <h3 className="text-sm font-semibold text-av-textPrimary tracking-tight">
                Policy Gate Details
              </h3>
              <p className="text-xs text-av-textSecondary mt-1">
                Evaluation computed via deterministic boolean rules.
              </p>
            </div>

            {/* Invariant Checklist */}
            <div className="space-y-3">
              <div className={clsx(
                "p-4 rounded-lg border flex items-center justify-between",
                injectionDetected ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-av-bg border-av-borderLight text-av-textSecondary"
              )}>
                <div className="flex items-center space-x-3">
                  {injectionDetected ? <CheckCircle2 className="w-5 h-5 text-av-veto" /> : <div className="w-5 h-5 rounded-full border border-av-border" />}
                  <div>
                    <div className="text-sm font-semibold">1. Adversarial Injection Detected</div>
                    <div className={clsx("text-xs mt-0.5", injectionDetected ? "text-av-veto/80" : "text-av-textMuted")}>Untrusted source tool response contained prompt injection</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold">{injectionDetected ? 'TRUE' : 'FALSE'}</span>
              </div>

              <div className={clsx(
                "p-4 rounded-lg border flex items-center justify-between",
                behaviorInfluenced ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-av-bg border-av-borderLight text-av-textSecondary"
              )}>
                <div className="flex items-center space-x-3">
                  {behaviorInfluenced ? <CheckCircle2 className="w-5 h-5 text-av-veto" /> : <div className="w-5 h-5 rounded-full border border-av-border" />}
                  <div>
                    <div className="text-sm font-semibold">2. Agent Goal Hijacked</div>
                    <div className={clsx("text-xs mt-0.5", behaviorInfluenced ? "text-av-veto/80" : "text-av-textMuted")}>Agent chain of thought pivoted to attacker payload</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold">{behaviorInfluenced ? 'TRUE' : 'FALSE'}</span>
              </div>

              <div className={clsx(
                "p-4 rounded-lg border flex items-center justify-between",
                sinkReached ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-av-bg border-av-borderLight text-av-textSecondary"
              )}>
                <div className="flex items-center space-x-3">
                  {sinkReached ? <CheckCircle2 className="w-5 h-5 text-av-veto" /> : <div className="w-5 h-5 rounded-full border border-av-border" />}
                  <div>
                    <div className="text-sm font-semibold">3. High-Risk Sink Reached</div>
                    <div className={clsx("text-xs mt-0.5", sinkReached ? "text-av-veto/80" : "text-av-textMuted")}>Agent attempted invocation of {evaluation?.violating_tool || 'restricted tool'} without authorization</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold">{sinkReached ? 'TRUE' : 'FALSE'}</span>
              </div>

              <div className={clsx(
                "p-4 rounded-lg border flex items-center justify-between",
                unauthorizedMutation ? "bg-[#2A1114] border-av-veto/30 text-av-veto" : "bg-av-bg border-av-borderLight text-av-textSecondary"
              )}>
                <div className="flex items-center space-x-3">
                  {unauthorizedMutation ? <CheckCircle2 className="w-5 h-5 text-av-veto" /> : <div className="w-5 h-5 rounded-full border border-av-border" />}
                  <div>
                    <div className="text-sm font-semibold">4. Unauthorized State Mutation</div>
                    <div className={clsx("text-xs mt-0.5", unauthorizedMutation ? "text-av-veto/80" : "text-av-textMuted")}>Sandbox recorded unauthorized state alteration</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold">{unauthorizedMutation ? 'TRUE' : 'FALSE'}</span>
              </div>
            </div>

            {/* Final Decision Box */}
            <div className={clsx(
              "p-5 rounded-lg border flex items-center justify-between",
              isVeto ? "bg-[#2A1114] border-av-veto/30" : "bg-[#101F18] border-av-pass/30"
            )}>
              <div>
                <span className="text-[10px] font-semibold text-av-textSecondary uppercase tracking-wider">Final Decision</span>
                <div className={clsx("text-lg font-bold mt-0.5", isVeto ? "text-av-veto" : "text-av-pass")}>
                  {isVeto ? 'VETO' : 'PASS'}
                </div>
                <div className="text-sm text-av-textSecondary mt-1">
                  {evaluation?.reason || 'No policy decision available.'}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
