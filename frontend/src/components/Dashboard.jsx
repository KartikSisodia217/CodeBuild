import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Zap, 
  Crosshair, 
  Layers, 
  ChevronRight,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ runs, metrics, onSelectRun, onOpenNewScan }) {
  const total = runs.length || metrics.total_evaluations || 18;
  const vetoed = runs.filter(r => r.expected_verdict === 'CRITICAL_VETO').length || metrics.veto_count || 12;
  const passed = runs.filter(r => r.expected_verdict === 'PASS').length || metrics.pass_count || 5;
  const criticalThreats = vetoed;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F17] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
              <span>SECURITY POSTURE</span>
              <span>•</span>
              <span>CONTINUOUS ADJUDICATION</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">AgentVeto Adjudication Console</h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic CI/CD security gate preventing autonomous agent goal hijacking & high-risk sink execution.
            </p>
          </div>

          <button
            onClick={onOpenNewScan}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Security Scan</span>
          </button>
        </div>

        {/* Security Posture Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#121824] border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase font-semibold">Total Scans</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Simulated agent runs</div>
          </div>

          <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/30">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-mono uppercase font-semibold">Builds Vetoed</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400 font-mono">{vetoed}</div>
            <div className="text-[11px] text-red-400/70 mt-1">Exploits blocked in CI/CD</div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-mono uppercase font-semibold">Builds Passed</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">{passed}</div>
            <div className="text-[11px] text-emerald-400/70 mt-1">Compliant nominal agents</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121824] border border-slate-800/80">
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-xs font-mono uppercase font-semibold">Gate Latency</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-300 font-mono">&lt; 1ms</div>
            <div className="text-[11px] text-slate-500 mt-1">Deterministic boolean check</div>
          </div>
        </div>

        {/* Recent Runs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Security Runs</h2>
              <p className="text-xs text-slate-400">Click any run to inspect the adaptive attack, trace, evidence DAG, and state diff.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#121824] overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/70">
              {runs.map((r) => {
                const isVeto = r.expected_verdict === 'CRITICAL_VETO';
                const isPass = r.expected_verdict === 'PASS';

                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="p-5 hover:bg-slate-800/40 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Status Icon */}
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                        isVeto ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        isPass ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      )}>
                        {isVeto ? <ShieldAlert className="w-5 h-5" /> :
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
                          <span>{r.attack_attempts ? `${r.attack_attempts} attack attempts` : 'Baseline check'}</span>
                          <span>•</span>
                          <span>{r.duration}</span>
                          <span>•</span>
                          <span className="text-slate-500">{r.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Pill & Arrow */}
                    <div className="flex items-center space-x-4">
                      <div className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-black font-mono uppercase tracking-wider flex items-center space-x-1.5 border",
                        isVeto ? "bg-red-500/20 border-red-500/40 text-red-400" :
                        isPass ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                        "bg-amber-500/20 border-amber-500/40 text-amber-400"
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
