import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Layers, 
  ChevronRight,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import AgentHologram from './AgentHologram';

export default function Dashboard({ runs, metrics, onSelectRun, onOpenNewScan }) {
  const total = runs.length || metrics.total_evaluations || 18;
  const vetoed = runs.filter(r => r.expected_verdict === 'CRITICAL_VETO').length || metrics.veto_count || 12;
  const passed = runs.filter(r => r.expected_verdict === 'PASS').length || metrics.pass_count || 5;

  return (
    <div className="flex-1 overflow-y-auto bg-[#090D14] text-[#E2E8F0] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1F293D]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 font-semibold tracking-wider mb-1.5 uppercase">
              <span>Security Posture</span>
              <span className="text-slate-600">•</span>
              <span>CI/CD Adjudication Gate</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Agent<span className="font-extrabold text-white">Veto</span> Adjudication Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic CI/CD security gate preventing autonomous agent goal hijacking & high-risk sink execution.
            </p>
          </div>

          <button
            onClick={onOpenNewScan}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>New Security Scan</span>
          </button>
        </div>

        {/* Floating AI Agent Architecture Hologram */}
        <AgentHologram onStartScan={onOpenNewScan} />

        {/* Security Posture Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0E131F] border border-[#1F293D] hover:border-slate-700 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Total Scans</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{total}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Simulated agent runs</div>
          </div>

          <div className="p-5 rounded-xl bg-red-950/15 border border-red-500/25 hover:border-red-500/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-red-400/90">Builds Vetoed</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-extrabold text-red-400 font-mono tracking-tight">{vetoed}</div>
            <div className="text-[11px] text-red-400/70 mt-1 font-mono">Exploits blocked in CI/CD</div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/15 border border-emerald-500/25 hover:border-emerald-500/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400/90">Builds Passed</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">{passed}</div>
            <div className="text-[11px] text-emerald-400/70 mt-1 font-mono">Compliant nominal agents</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0E131F] border border-[#1F293D] hover:border-indigo-500/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-indigo-400/90">Gate Latency</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-300 font-mono tracking-tight">&lt; 1ms</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Deterministic boolean check</div>
          </div>
        </div>

        {/* Recent Runs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Recent Security Runs</h2>
              <p className="text-xs text-slate-400">Click any run to inspect the adaptive attack, trace, evidence DAG, and state diff.</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#1F293D] bg-[#0E131F] overflow-hidden shadow-xl">
            <div className="divide-y divide-[#1F293D]/70">
              {runs.map((r) => {
                const isVeto = r.expected_verdict === 'CRITICAL_VETO';
                const isPass = r.expected_verdict === 'PASS';

                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="p-5 hover:bg-[#151B28] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Status Icon */}
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                        isVeto ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        isPass ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      )}>
                        {isVeto ? <ShieldAlert className="w-5 h-5 animate-pulse" /> :
                         isPass ? <ShieldCheck className="w-5 h-5" /> :
                         <AlertTriangle className="w-5 h-5" />}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-indigo-400">{r.run_number}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{r.agent_name}</span>
                          <span className="text-xs text-slate-500 font-mono">({r.name})</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                            isVeto ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            isPass ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                            {r.threat_category}
                          </span>
                          <span className="font-mono text-[11px]">{r.attack_attempts ? `${r.attack_attempts} attack attempts` : 'Baseline check'}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{r.duration}</span>
                          <span>•</span>
                          <span className="text-slate-500 text-[11px]">{r.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Pill & Arrow */}
                    <div className="flex items-center space-x-4">
                      <div className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-black font-mono uppercase tracking-wider flex items-center space-x-1.5 border",
                        isVeto ? "bg-red-500/15 border-red-500/40 text-red-400" :
                        isPass ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" :
                        "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      )}>
                        <span>{isVeto ? '🔴 VETOED' : isPass ? '🟢 PASSED' : '🟡 WARNED'}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
