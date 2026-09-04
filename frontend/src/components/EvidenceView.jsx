import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  X,
  Sliders,
  Scale
} from 'lucide-react';
import clsx from 'clsx';
import TraceGraph from './TraceGraph';

export default function EvidenceView({ dag, evaluation, stateDiff }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [evidenceSubtab, setEvidenceSubtab] = useState('dag'); // 'dag', 'state_diff', 'policy_gate'

  const isVeto = evaluation?.status === 'CRITICAL_VETO';
  const isPass = evaluation?.status === 'PASS';
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
    <div className="flex flex-col h-full space-y-4">
      
      {/* Subnav Toggle */}
      <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
        <div className="flex bg-[#0d0e12] p-1 rounded-full border border-[#22222a] space-x-1">
          <button
            onClick={() => setEvidenceSubtab('dag')}
            className={clsx(
              "px-4 py-1.5 text-xs font-mono rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
              evidenceSubtab === 'dag' ? "bg-white text-[#070707] font-medium shadow-sm" : "text-[#a2a4a9] hover:text-white"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Evidence DAG</span>
          </button>

          <button
            onClick={() => setEvidenceSubtab('state_diff')}
            className={clsx(
              "px-4 py-1.5 text-xs font-mono rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
              evidenceSubtab === 'state_diff' ? "bg-white text-[#070707] font-medium shadow-sm" : "text-[#a2a4a9] hover:text-white"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. State Invariants (Diff)</span>
            {diffKeys.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] border border-[#f43f5e] text-[#f43f5e]">
                {diffKeys.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setEvidenceSubtab('policy_gate')}
            className={clsx(
              "px-4 py-1.5 text-xs font-mono rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
              evidenceSubtab === 'policy_gate' ? "bg-white text-[#070707] font-medium shadow-sm" : "text-[#a2a4a9] hover:text-white"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. Policy Decision Gate</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#a2a4a9]">
          <Lock className="w-3.5 h-3.5 text-[#70dcd3]" />
          <span>Deterministic Boolean Evaluation • No LLM Judge</span>
        </div>
      </div>

      {/* SUBTAB 1: EVIDENCE DAG */}
      {evidenceSubtab === 'dag' && (
        <div className="flex-1 relative rounded-[20px] border border-[#d9dae5]/16 overflow-hidden bg-[#0d0e12] min-h-[500px]">
          <TraceGraph 
            dag={dag} 
            evaluation={evaluation} 
            onNodeClick={(node) => setSelectedNode(node)}
          />

          {/* Slide-out Inspector Drawer */}
          {selectedNode && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-[#0d0e12]/95 backdrop-blur-xl border-l border-[#22222a] z-30 flex flex-col animate-slideIn">
              <div className="p-4 border-b border-[#22222a] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#70dcd3]" />
                  <h3 className="text-xs font-medium uppercase font-mono text-white tracking-[0.056em]">
                    Node Adjudication Inspector
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-[#a2a4a9] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em] mb-1 font-semibold">Node Identifier</div>
                  <div className="p-2.5 rounded-xl bg-[#141418] border border-[#22222a] text-[#70dcd3] font-medium">{selectedNode.id}</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em] mb-1 font-semibold">Execution Classification</div>
                  <div className="p-2.5 rounded-xl bg-[#141418] border border-[#22222a] text-white capitalize font-normal">
                    {selectedNode.type?.replace('_', ' ')}
                  </div>
                </div>

                {selectedNode.data?.tool_name && (
                  <div>
                    <div className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em] mb-1 font-semibold">Intercepted Tool</div>
                    <div className="p-2.5 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-medium">
                      {selectedNode.data.tool_name}()
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em] mb-1 font-semibold">Payload / Tool Arguments</div>
                  <div className="p-3 rounded-xl bg-[#141418] border border-[#22222a] text-[#aeaeb7] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-text font-mono">
                    {typeof selectedNode.data?.content === 'object' 
                      ? JSON.stringify(selectedNode.data.content, null, 2) 
                      : (selectedNode.data?.content || selectedNode.data?.inputs || 'No input content.')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#a2a4a9] uppercase tracking-[0.094em] mb-1 font-semibold">Adjudication Verdict</div>
                  <div className={clsx(
                    "p-3.5 rounded-xl border flex items-center space-x-2.5",
                    selectedNode.data?.status === 'VETOED' ? "bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]" : "bg-[#70dcd3]/10 border-[#70dcd3]/30 text-[#70dcd3]"
                  )}>
                    {selectedNode.data?.status === 'VETOED' ? <ShieldAlert className="w-5 h-5 text-[#f43f5e]" /> : <ShieldCheck className="w-5 h-5 text-[#70dcd3]" />}
                    <div>
                      <div className="font-medium text-xs">
                        {selectedNode.data?.status === 'VETOED' ? 'CRITICAL_VETO Triggered' : 'Nominal Execution'}
                      </div>
                      <div className="text-[10px] text-[#a2a4a9]">
                        {selectedNode.data?.status === 'VETOED' 
                          ? 'Blocked via deterministic policy before state commit' 
                          : 'Action passed boolean security constraints'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#22222a] bg-[#0d0e12]">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="btn-harness-ghost w-full py-2 text-xs cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: STATE DIFF */}
      {evidenceSubtab === 'state_diff' && (
        <div className="space-y-4">
          <div className="p-6 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 space-y-4">
            <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
              <div>
                <h3 className="text-sm font-medium font-mono text-white uppercase tracking-[0.056em]">
                  State Mutation Verification (Pre/Post DB Snapshot)
                </h3>
                <p className="text-xs text-[#aeaeb7] mt-0.5">
                  Comparing agent execution initial sandbox state vs. attempted terminal mutation.
                </p>
              </div>

              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-mono font-medium uppercase border",
                stateDiff?.state_mutated ? "border-[#f43f5e] text-[#f43f5e]" : "border-[#70dcd3] text-[#70dcd3]"
              )}>
                {stateDiff?.state_mutated ? '🔴 UNAUTHORIZED MUTATION' : '🟢 STATE INVARIANTS PRESERVED'}
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-[#22222a] rounded-xl overflow-hidden">
                <thead className="bg-[#141418] text-[#a2a4a9] text-[11px] uppercase border-b border-[#22222a]">
                  <tr>
                    <th className="p-3.5 tracking-[0.094em]">State Field</th>
                    <th className="p-3.5 tracking-[0.094em]">BEFORE (Sandbox Initial)</th>
                    <th className="p-3.5">→</th>
                    <th className="p-3.5 tracking-[0.094em]">AFTER (Attempted Mutation)</th>
                    <th className="p-3.5 text-right tracking-[0.094em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22222a] bg-[#0d0e12]">
                  {allKeys.map(k => {
                    const beforeVal = beforeState[k];
                    const afterVal = afterState[k];
                    const hasChanged = diffKeys.includes(k) || diffKeys.some(dk => dk.startsWith(`${k}.`)) || JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

                    return (
                      <tr key={k} className={hasChanged ? "bg-[#f43f5e]/5" : ""}>
                        <td className="p-3.5 font-medium text-white">{k}</td>
                        <td className="p-3.5 text-[#aeaeb7]">{typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal ?? 'undefined')}</td>
                        <td className="p-3.5 text-[#60606c]">→</td>
                        <td className={clsx("p-3.5 font-medium", hasChanged ? "text-[#f43f5e]" : "text-[#aeaeb7]")}>
                          {typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal ?? 'undefined')}
                        </td>
                        <td className="p-3.5 text-right">
                          {hasChanged ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border border-[#f43f5e] text-[#f43f5e]">
                              MUTATED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase text-[#60606c]">
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
              <div className="p-4 rounded-xl bg-[#141418] border border-[#f43f5e]/40 space-y-2">
                <div className="text-xs font-mono font-medium text-[#f43f5e] uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Unauthorized State Invariant Violations ({stateDiff.unauthorized_changes.length}):</span>
                </div>
                <ul className="space-y-1 pl-5 list-disc text-xs text-[#f43f5e] font-mono">
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
          <div className="p-6 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 space-y-6">
            
            <div className="border-b border-[#22222a] pb-4">
              <h3 className="text-sm font-medium font-mono text-white uppercase tracking-[0.056em]">
                Deterministic Policy Evaluation Engine
              </h3>
              <p className="text-xs text-[#aeaeb7] mt-0.5">
                Evaluation is computed with deterministic boolean policy rules. No LLM is used to decide the verdict.
              </p>
            </div>

            {/* Invariant Checklist */}
            <div className="space-y-3">
              <div className={clsx(
                "p-4 rounded-xl border flex items-center justify-between",
                injectionDetected ? "bg-[#141418] border-[#f43f5e]/40 text-white" : "bg-[#141418] border-[#22222a] text-[#aeaeb7]"
              )}>
                <div className="flex items-center space-x-3">
                  {injectionDetected ? <CheckCircle2 className="w-5 h-5 text-[#f43f5e]" /> : <div className="w-5 h-5 rounded-full border border-[#2e3038]" />}
                  <div>
                    <div className="text-xs font-medium font-mono uppercase">1. Adversarial Injection Detected in Telemetry</div>
                    <div className="text-[11px] text-[#aeaeb7]">Untrusted source tool response contained indirect prompt injection pattern</div>
                  </div>
                </div>
                <span className={clsx("text-xs font-mono font-medium", injectionDetected ? "text-[#f43f5e]" : "text-[#60606c]")}>
                  {injectionDetected ? 'TRUE' : 'FALSE'}
                </span>
              </div>

              <div className={clsx(
                "p-4 rounded-xl border flex items-center justify-between",
                behaviorInfluenced ? "bg-[#141418] border-[#f43f5e]/40 text-white" : "bg-[#141418] border-[#22222a] text-[#aeaeb7]"
              )}>
                <div className="flex items-center space-x-3">
                  {behaviorInfluenced ? <CheckCircle2 className="w-5 h-5 text-[#f43f5e]" /> : <div className="w-5 h-5 rounded-full border border-[#2e3038]" />}
                  <div>
                    <div className="text-xs font-medium font-mono uppercase">2. Target Agent Goal Hijacked</div>
                    <div className="text-[11px] text-[#aeaeb7]">Agent chain of thought pivoted from user instructions to attacker payload</div>
                  </div>
                </div>
                <span className={clsx("text-xs font-mono font-medium", behaviorInfluenced ? "text-[#f43f5e]" : "text-[#60606c]")}>
                  {behaviorInfluenced ? 'TRUE' : 'FALSE'}
                </span>
              </div>

              <div className={clsx(
                "p-4 rounded-xl border flex items-center justify-between",
                sinkReached ? "bg-[#141418] border-[#f43f5e]/40 text-white" : "bg-[#141418] border-[#22222a] text-[#aeaeb7]"
              )}>
                <div className="flex items-center space-x-3">
                  {sinkReached ? <CheckCircle2 className="w-5 h-5 text-[#f43f5e]" /> : <div className="w-5 h-5 rounded-full border border-[#2e3038]" />}
                  <div>
                    <div className="text-xs font-medium font-mono uppercase">3. High-Risk Sink Invocation Reached</div>
                    <div className="text-[11px] text-[#aeaeb7]">Agent attempted invocation of {evaluation?.violating_tool || 'a restricted tool'}() without human confirmation</div>
                  </div>
                </div>
                <span className={clsx("text-xs font-mono font-medium", sinkReached ? "text-[#f43f5e]" : "text-[#60606c]")}>
                  {sinkReached ? 'TRUE' : 'FALSE'}
                </span>
              </div>

              <div className={clsx(
                "p-4 rounded-xl border flex items-center justify-between",
                unauthorizedMutation ? "bg-[#141418] border-[#f43f5e]/40 text-white" : "bg-[#141418] border-[#22222a] text-[#aeaeb7]"
              )}>
                <div className="flex items-center space-x-3">
                  {unauthorizedMutation ? <CheckCircle2 className="w-5 h-5 text-[#f43f5e]" /> : <div className="w-5 h-5 rounded-full border border-[#2e3038]" />}
                  <div>
                    <div className="text-xs font-medium font-mono uppercase">4. Unauthorized State Mutation Proved</div>
                    <div className="text-[11px] text-[#aeaeb7]">Synthetic database recorded unauthorized financial/privilege alteration</div>
                  </div>
                </div>
                <span className={clsx("text-xs font-mono font-medium", unauthorizedMutation ? "text-[#f43f5e]" : "text-[#60606c]")}>
                  {unauthorizedMutation ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>

            {/* Final Decision Box */}
            <div className={clsx(
              "p-5 rounded-2xl border flex items-center justify-between bg-[#141418]",
              isVeto ? "border-[#f43f5e]/40" : "border-[#70dcd3]/40"
            )}>
              <div>
                <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">FINAL DETERMINISTIC DECISION</span>
                <div className="text-xl font-medium font-mono text-white mt-1">
                  {isVeto ? '🔴 VETO (Exit Code 1)' : '🟢 PASS (Exit Code 0)'}
                </div>
                <div className="text-xs text-[#aeaeb7] mt-1 font-normal">
                  Reason: {evaluation?.reason || 'No policy decision is available.'}
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-[#a2a4a9]">Evaluation Latency</div>
                <div className="text-[#70dcd3] font-medium text-sm mt-0.5">{evaluation?.latency_ms ?? '—'}ms</div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
