import React from 'react';
import { 
  Shield, 
  Bot, 
  Database, 
  Lock, 
  Zap, 
  Bug, 
  Radio, 
  Sparkles,
  Crosshair,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';

export default function AgentHologram({ onStartScan }) {
  return (
    <div className="relative w-full rounded-2xl bg-[#0E131F] border border-[#1F293D] p-6 overflow-hidden shadow-xl space-y-6">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F293D10_1px,transparent_1px),linear-gradient(to_bottom,#1F293D10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP: Fixed Security Status Indicator Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1F293D]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Interception Architecture Topology
          </span>
        </div>

        {/* Clean Status Badges */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono">
            <Bug className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold">OWASP-ASI01 Active</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-mono">
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold">&lt; 1ms Boolean Gate</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold">Isolated Sandbox</span>
          </div>
        </div>
      </div>

      {/* CENTER: 3 Connected Architecture Nodes */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-around py-4 gap-6">
        
        {/* Node 1: Target Autonomous AI Agent */}
        <div className="flex flex-col items-center group">
          <div className="relative">
            <div className="relative w-24 h-24 rounded-2xl bg-[#080D17] border border-blue-500/40 flex flex-col items-center justify-center p-2 shadow-lg group-hover:border-blue-400 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
                <Bot className="w-6 h-6 text-blue-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-[10px] font-bold font-mono text-white tracking-wider">TARGET AGENT</div>
              <div className="text-[8px] font-mono text-blue-400">CustomerSupport</div>
            </div>

            {/* Live Indicator Beacon */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-semibold text-slate-200">Autonomous Runner</span>
            <div className="text-[10px] font-mono text-slate-500">Tools: read_tickets, refund</div>
          </div>
        </div>

        {/* Connector 1: Telemetry Stream */}
        <div className="flex flex-col items-center justify-center w-36">
          <div className="flex items-center space-x-1 font-mono text-[10px] text-indigo-400 mb-1.5 font-semibold">
            <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>@intercept STREAM</span>
          </div>
          <div className="w-full h-1 bg-[#1F293D] rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent w-16 animate-scan-beam" />
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">OpenInference Spans</span>
        </div>

        {/* Node 2: AgentVeto Central Policy Gate */}
        <div className="flex flex-col items-center group">
          <div className="relative">
            <div className="relative w-28 h-28 rounded-full bg-[#090D17] border-2 border-indigo-500/60 flex flex-col items-center justify-center p-3 shadow-lg group-hover:border-indigo-400 transition-colors">
              {/* Radar Ring */}
              <div className="absolute inset-1 rounded-full border border-indigo-500/20 animate-radar pointer-events-none" />
              
              <Shield className="w-8 h-8 text-indigo-400 mb-0.5 group-hover:scale-105 transition-transform" />
              <div className="text-[11px] font-bold font-mono text-slate-200 tracking-wider">
                Agent<span className="font-extrabold text-white">Veto</span>
              </div>
              <div className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-wider">CI/CD GATE</div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-bold text-indigo-300">Deterministic Policy Gate</span>
            <div className="text-[10px] font-mono text-slate-500">Boolean Invariant Check (&lt; 1ms)</div>
          </div>
        </div>

        {/* Connector 2: Sink Interception */}
        <div className="flex flex-col items-center justify-center w-36">
          <div className="flex items-center space-x-1 font-mono text-[10px] text-red-400 mb-1.5 font-semibold">
            <Lock className="w-3 h-3 text-red-400" />
            <span>UNAUTHORIZED SINK</span>
          </div>
          <div className="w-full h-1 bg-[#1F293D] rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent w-16 animate-scan-beam" />
          </div>
          <span className="text-[9px] font-mono text-red-400 font-bold mt-1.5">🔴 CRITICAL_VETO</span>
        </div>

        {/* Node 3: Synthetic State Sandbox */}
        <div className="flex flex-col items-center group">
          <div className="relative">
            <div className="relative w-24 h-24 rounded-2xl bg-[#080D17] border border-purple-500/40 flex flex-col items-center justify-center p-2 shadow-lg group-hover:border-purple-400 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-1">
                <Database className="w-6 h-6 text-purple-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-[10px] font-bold font-mono text-white tracking-wider">SANDBOX DB</div>
              <div className="text-[8px] font-mono text-purple-400">StateDiff Tracker</div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-semibold text-slate-200">Isolated State Tree</span>
            <div className="text-[10px] font-mono text-slate-500">FastAPI + Pre/Post Diff</div>
          </div>
        </div>

      </div>

      {/* BOTTOM: Callout with Button */}
      <div className="pt-4 border-t border-[#1F293D] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Continuous Adversarial Simulation Engine ready for live agent evaluation.</span>
        </div>

        <button
          onClick={onStartScan}
          className="relative group px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold font-mono rounded-xl flex items-center space-x-2.5 shadow-lg shadow-indigo-600/25 transition-all shrink-0"
        >
          <Crosshair className="w-4 h-4 text-indigo-200 group-hover:rotate-90 transition-transform duration-300" />
          <span className="tracking-wide uppercase font-bold">Launch Live Agent Attack</span>
        </button>
      </div>

    </div>
  );
}
