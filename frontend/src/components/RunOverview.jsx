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

  const injectionSource = evaluation.injection_source_span_id || data.attack_analysis?.injection_point || 'None observed';
  const highRiskSink = evaluation.violating_tool || (evaluation.details?.high_risk_sink_reached ? data.attack_analysis?.high_risk_sink : 'None reached');

  const isUnsupported = evaluation.status === 'UNSUPPORTED';
  const isNotAgentic = evaluation.status === 'NOT_AGENTIC';
  const isNotScanned = isUnsupported || isNotAgentic;

  return (
    <div className="space-y-6">
      
      {/* Hero Decision Banner */}
      <div className={clsx(
        "p-6 rounded-[20px] border flex items-center justify-between relative overflow-hidden bg-[#0d0e12]",
        isVeto 
          ? "border-[#f43f5e]/40" 
          : isPass 
          ? "border-[#70dcd3]/40"
          : isNotScanned
          ? "border-[#22222a]"
          : "border-[#d9dae5]/16"
      )}>
        <div className="flex items-center space-x-5">
          <div className={clsx(
            "w-12 h-12 rounded-full flex items-center justify-center border shrink-0",
            isVeto ? "bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]" :
            isPass ? "bg-[#70dcd3]/10 border-[#70dcd3]/30 text-[#70dcd3]" :
            isNotScanned ? "bg-white/5 border-[#22222a] text-[#aeaeb7]" :
            "bg-white/5 border-white/15 text-white"
          )}>
            {isVeto ? <ShieldAlert className="w-6 h-6 animate-pulse" /> :
             isPass ? <ShieldCheck className="w-6 h-6" /> :
             isNotScanned ? <AlertTriangle className="w-6 h-6" /> :
             <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-display font-light tracking-[0.056em] text-white uppercase">
                {isVeto ? '🔴 BUILD VETOED' : isPass ? '🟢 BUILD PASSED' : isNotScanned ? '⚪ SCAN NOT RUN' : '🟡 POLICY WARNING'}
              </h1>
              <span className={clsx(
                "px-3 py-0.5 rounded-full text-xs font-mono font-medium uppercase border",
                isVeto ? "border-[#f43f5e] text-[#f43f5e]" :
                isPass ? "border-[#70dcd3] text-[#70dcd3]" :
                isNotScanned ? "border-[#60606c] text-[#aeaeb7]" :
                "border-[#aeaeb7] text-white"
              )}>
                {evaluation.status}
              </span>
            </div>
            
            <p className="text-sm text-[#aeaeb7] mt-1 font-normal">
              {evaluation.reason || (isVeto 
                ? 'Critical security violation detected: Agent was influenced by untrusted input to invoke restricted sinks.' 
                : isUnsupported ? 'An agent may exist, but AgentVeto cannot currently instrument this runtime safely.'
                : isNotAgentic ? 'No agentic component detected.'
                : 'No exploitable policy violations detected. Execution safe.')}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons (Harness Hardware Pills) */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onSwitchTab('attack')}
            className="btn-harness-ghost px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#70dcd3]" />
            <span className="tracking-[0.056em] uppercase text-[11px]">VIEW ATTACK</span>
          </button>
          <button
            onClick={() => onSwitchTab('evidence')}
            className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#070707]" />
            <span className="tracking-[0.056em] uppercase text-[11px]">VIEW EVIDENCE</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#070707]" />
          </button>
        </div>
      </div>

      {meta.execution_mode === 'deterministic_fixture' && (
        <div className="rounded-full border border-[#22222a] bg-[#0d0e12] px-5 py-2.5 text-xs text-[#aeaeb7] flex items-center space-x-2">
          <span className="font-mono font-medium uppercase text-[#70dcd3] tracking-[0.094em]">Controlled fixture:</span>
          <span>{meta.fixture_disclosure || 'Evidence was generated in an isolated deterministic sandbox.'}</span>
        </div>
      )}

      {/* Primary Execution Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Target Agent</div>
          <div className="text-sm font-medium text-white truncate mt-1">{meta.agent_name || data.trace?.agent_name}</div>
        </div>

        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Run ID</div>
          <div className="text-sm font-medium text-[#70dcd3] font-mono truncate mt-1">{meta.run_number || data.scenario_id}</div>
        </div>

        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Duration</div>
          <div className="text-sm font-medium text-white font-mono mt-1">{meta.duration || '—'}</div>
        </div>

        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Attack Attempts</div>
          <div className="text-sm font-medium text-white font-mono mt-1">{meta.attack_attempts ?? data.attack_analysis?.attempts?.length ?? '—'}</div>
        </div>

        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Tool Calls</div>
          <div className="text-sm font-medium text-white font-mono mt-1">{data.trace?.spans?.length ?? meta.tool_calls ?? '—'}</div>
        </div>

        <div className="p-4 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px]">
          <div className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">State Changes</div>
          <div className={clsx("text-sm font-medium font-mono mt-1", isVeto ? "text-[#f43f5e]" : "text-[#70dcd3]")}>
            {data.state_diff?.diff_keys?.length || (isVeto ? 1 : 0)}
          </div>
        </div>
      </div>

      {/* Threat & Exploit Causal Chain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Threat Classification */}
        <div className="p-6 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px] space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#a2a4a9] uppercase tracking-[0.094em] border-b border-[#22222a] pb-3">
            <Flame className="w-4 h-4 text-[#f43f5e]" />
            <span>Threat Taxonomy & Standard Mapping</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">OWASP GenAI Standard:</span>
              <span className="font-mono font-medium text-white">{data.threat_category || 'OWASP-ASI01 (Agent Goal Hijacking)'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">CWE Mapping:</span>
              <span className="font-mono text-white">{data.cwe_mapping || 'CWE-77 (Command Injection)'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">Target Capability:</span>
              <span className="font-mono text-[#70dcd3] font-medium">{data.attack_analysis?.target_capability || 'Tool Invocation Chain'}</span>
            </div>
          </div>
        </div>

        {/* Exploit Causal Chain */}
        <div className="p-6 bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px] space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#a2a4a9] uppercase tracking-[0.094em] border-b border-[#22222a] pb-3">
            <Bug className="w-4 h-4 text-[#70dcd3]" />
            <span>Adjudication Causality</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">Tainted Input Source:</span>
              <span className="text-[#70dcd3] font-medium">{injectionSource}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">Violating Sink Tool:</span>
              <span className="text-[#f43f5e] font-medium">{highRiskSink}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#aeaeb7]">State Mutation Attempt:</span>
              <span className={isVeto ? "text-[#f43f5e] font-medium" : "text-[#70dcd3] font-medium"}>
                {isVeto ? "PROVED (Captured in Sandbox)" : "NONE OBSERVED"}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
