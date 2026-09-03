import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Crosshair, 
  Layers, 
  Clock, 
  Zap, 
  Database, 
  Lock,
  Flame,
  Terminal,
  FileCode2,
  Bug
} from 'lucide-react';
import clsx from 'clsx';

export default function RunOverview({ data, onSwitchTab }) {
  if (!data) return null;

  const evaluation = data.evaluation || {};
  const meta = data.metadata || {};
  const isVeto = evaluation.status === 'CRITICAL_VETO';
  const isPass = evaluation.status === 'PASS';

  const injectionSource = evaluation.injection_source_span_id || data.attack_analysis?.injection_point || 'read_tickets()';
  const highRiskSink = evaluation.violating_tool || data.attack_analysis?.high_risk_sink || 'execute_refund()';

  return (
    <div className="space-y-6">
      
      {/* Hero Decision Banner */}
      <div className={clsx(
        "p-6 rounded-2xl border flex items-center justify-between shadow-xl relative overflow-hidden",
        isVeto 
          ? "bg-gradient-to-r from-red-950/30 via-[#130B0F] to-[#130B0F] border-red-500/40 glow-red" 
          : isPass 
          ? "bg-gradient-to-r from-emerald-950/30 via-[#091512] to-[#091512] border-emerald-500/40 glow-emerald"
          : "bg-gradient-to-r from-amber-950/30 via-[#161208] to-[#161208] border-amber-500/40 glow-amber"
      )}>
        {/* Animated Cyber Scan Beam */}
        <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan-beam pointer-events-none" />

        <div className="flex items-center space-x-5">
          <div className={clsx(
            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg shrink-0",
            isVeto ? "bg-red-500/15 border-red-500/35 text-red-400" :
            isPass ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400" :
            "bg-amber-500/15 border-amber-500/35 text-amber-400"
          )}>
            {isVeto ? <ShieldAlert className="w-7 h-7 animate-pulse" /> :
             isPass ? <ShieldCheck className="w-7 h-7" /> :
             <AlertTriangle className="w-7 h-7" />}
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-white uppercase">
                {isVeto ? '🔴 BUILD VETOED' : isPass ? '🟢 BUILD PASSED' : '🟡 POLICY WARNING'}
              </h1>
              <span className={clsx(
                "px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border",
                isVeto ? "bg-red-500/15 text-red-300 border-red-500/30" :
                isPass ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                "bg-amber-500/15 text-amber-300 border-amber-500/30"
              )}>
                {evaluation.status}
              </span>
            </div>
            
            <p className="text-sm font-medium text-slate-300 mt-1">
              {evaluation.reason || (isVeto 
                ? 'Critical security violation detected: Agent was influenced by untrusted input to invoke restricted sinks.' 
                : 'No exploitable policy violations detected. Execution safe.')}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onSwitchTab('attack')}
            className="px-4 py-2 rounded-xl bg-[#1F293D] hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center space-x-2 transition-all font-sans"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>VIEW ATTACK</span>
          </button>
          <button
            onClick={() => onSwitchTab('evidence')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all font-sans"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>VIEW EVIDENCE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Execution Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Target Agent</div>
          <div className="text-sm font-bold text-white truncate mt-1">{meta.agent_name || data.trace?.agent_name}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Run ID</div>
          <div className="text-sm font-bold text-indigo-400 font-mono truncate mt-1">{meta.run_number || data.scenario_id}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Duration</div>
          <div className="text-sm font-bold text-white font-mono mt-1">{meta.duration || '4.82s'}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Attack Attempts</div>
          <div className="text-sm font-bold text-amber-400 font-mono mt-1">{meta.attack_attempts ?? (data.attack_analysis?.attempts?.length || 3)}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Tool Calls</div>
          <div className="text-sm font-bold text-white font-mono mt-1">{data.trace?.spans?.length || meta.tool_calls || 5}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1F293D]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">State Changes</div>
          <div className={clsx("text-sm font-bold font-mono mt-1", isVeto ? "text-red-400" : "text-slate-400")}>
            {data.state_diff?.diff_keys?.length || (isVeto ? 1 : 0)}
          </div>
        </div>
      </div>

      {/* Threat & Exploit Causal Chain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Threat Classification */}
        <div className="p-5 rounded-xl bg-[#0E131F] border border-[#1F293D] space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 uppercase border-b border-[#1F293D] pb-3">
            <Flame className="w-4 h-4 text-red-400" />
            <span>Threat Taxonomy</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">OWASP Threat Classification</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {evaluation.threat_category || meta.threat_category || 'ASI01 — Agent Goal Hijacking'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Attack Vector</div>
              <div className="text-sm font-semibold text-indigo-300 mt-0.5">
                Indirect Prompt Injection (Context-Poisoned Tool Response)
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Policy Rule Triggered</div>
              <div className="text-xs font-mono text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-500/20 mt-1">
                {evaluation.rule_name || 'RESTRICTED_SINK_RULE (execute_refund)'}
              </div>
            </div>
          </div>
        </div>

        {/* Source to Sink Causal Vector */}
        <div className="p-5 rounded-xl bg-[#0E131F] border border-[#1F293D] space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 uppercase border-b border-[#1F293D] pb-3">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>Exploitation Path (Source → Sink)</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#080D17] border border-[#1F293D] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Injection Source</div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">{injectionSource}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                UNTRUSTED DATA
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs font-mono text-slate-500">↓ Tainted Control Flow ↓</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080D17] border border-[#1F293D] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-red-400 uppercase font-semibold">High-Risk Sink</div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">{highRiskSink}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                BLOCKED BY VETO
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
