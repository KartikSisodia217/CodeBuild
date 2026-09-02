import React from 'react';
import { 
  Crosshair, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import clsx from 'clsx';

export default function AttackAnalysis({ attackData }) {
  if (!attackData) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No adversarial simulation records available for this baseline run.
      </div>
    );
  }

  const attempts = attackData.attempts || [];

  return (
    <div className="space-y-6">
      
      {/* Objective Card */}
      <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase">
          <Crosshair className="w-4 h-4" />
          <span>Adversarial Engine Simulation Objective</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {attackData.objective}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Target Threat</span>
            <div className="text-xs font-bold text-white font-mono mt-0.5">{attackData.threat_category}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Injection Point</span>
            <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">{attackData.injection_point}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Target Sink</span>
            <div className="text-xs font-bold text-red-400 font-mono mt-0.5">{attackData.high_risk_sink}</div>
          </div>
        </div>
      </div>

      {/* Adaptive Attempts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
          Adaptive Adversarial Trajectory ({attempts.length} Attempts)
        </h3>

        {attempts.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#121824] border border-slate-800 text-center text-xs text-slate-400 font-mono">
            Baseline nominal flow: 0 adversarial injections executed.
          </div>
        ) : (
          attempts.map((att) => {
            const isInfluenced = att.status === 'influenced';

            return (
              <div 
                key={att.attempt_number}
                className={clsx(
                  "p-5 rounded-2xl border transition-all space-y-4 shadow-lg",
                  isInfluenced 
                    ? "bg-gradient-to-r from-red-950/20 via-[#121824] to-[#121824] border-red-500/40" 
                    : "bg-[#121824] border-slate-800/80"
                )}
              >
                {/* Attempt Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      ATTEMPT {att.attempt_number}
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {att.strategy}
                    </span>
                  </div>

                  <div className={clsx(
                    "px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase flex items-center space-x-1.5 border",
                    isInfluenced 
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse" 
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  )}>
                    {isInfluenced ? <span>⚠️ Agent influenced</span> : <span>❌ Refused</span>}
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Mutation Type</span>
                    <div className="text-xs font-mono text-slate-300 mt-0.5">{att.mutation}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Observed Agent Behavior</span>
                    <div className="text-xs text-slate-300 mt-0.5">{att.agent_behavior}</div>
                  </div>
                </div>

                {/* Sanitized Injected Payload (No internal CoT) */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Injected Synthetic Response Payload</span>
                  <div className="mt-1 p-3 rounded-xl bg-[#06080e] border border-slate-800/80 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
                    {att.payload}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* WHY DID THE ATTACK MUTATE? */}
      {attempts.length > 1 && (
        <div className="p-5 rounded-2xl bg-[#0E131F] border border-indigo-500/30 space-y-2 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-indigo-400 uppercase">
            <RotateCw className="w-4 h-4" />
            <span>Why Did the Attack Mutate?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {attackData.adaptation_rationale || 
             "Previous trajectory contained agent refusal indicators. The Adversarial Engine autonomously mutated from a direct imperative instruction to an indirect regulatory compliance wrapper to bypass the model's safety pre-prompt."}
          </p>
        </div>
      )}

    </div>
  );
}
