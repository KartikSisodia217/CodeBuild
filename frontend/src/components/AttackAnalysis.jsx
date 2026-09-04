import React from 'react';
import { 
  Crosshair, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert
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
      <div className="p-6 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#a2a4a9] uppercase tracking-[0.094em]">
          <Crosshair className="w-4 h-4 text-[#70dcd3]" />
          <span>Adversarial Engine Simulation Objective</span>
        </div>
        <p className="text-sm text-[#ffffff] leading-relaxed font-normal">
          {attackData.objective}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#141418] border border-[#22222a]">
            <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Target Threat</span>
            <div className="text-xs font-medium text-white font-mono mt-1">{attackData.threat_category}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#141418] border border-[#22222a]">
            <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Injection Point</span>
            <div className="text-xs font-medium text-[#70dcd3] font-mono mt-1">{attackData.injection_point}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#141418] border border-[#22222a]">
            <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Target Sink</span>
            <div className="text-xs font-medium text-[#f43f5e] font-mono mt-1">{attackData.high_risk_sink}</div>
          </div>
        </div>
      </div>

      {/* Adaptive Attempts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-medium text-[#a2a4a9] uppercase tracking-[0.094em]">
          Adaptive Adversarial Trajectory ({attempts.length} Attempts)
        </h3>

        {attempts.length === 0 ? (
          <div className="p-6 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 text-center text-xs text-[#aeaeb7] font-mono">
            Baseline nominal flow: 0 adversarial injections executed.
          </div>
        ) : (
          attempts.map((att) => {
            const isInfluenced = att.status === 'influenced';

            return (
              <div 
                key={att.attempt_number}
                className={clsx(
                  "p-6 rounded-[20px] bg-[#0d0e12] border transition-all space-y-4",
                  isInfluenced 
                    ? "border-[#f43f5e]/40" 
                    : "border-[#d9dae5]/16"
                )}
              >
                {/* Attempt Header */}
                <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#141418] text-[#70dcd3] border border-[#22222a]">
                      ATTEMPT {att.attempt_number}
                    </span>
                    <span className="text-xs font-medium text-white tracking-wide">
                      {att.strategy}
                    </span>
                  </div>

                  <div className={clsx(
                    "px-3 py-0.5 rounded-full text-xs font-mono font-medium uppercase border",
                    isInfluenced 
                      ? "border-[#f43f5e] text-[#f43f5e]" 
                      : "border-[#60606c] text-[#a2a4a9]"
                  )}>
                    {isInfluenced ? <span>⚠️ Agent influenced</span> : <span>❌ Refused</span>}
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Mutation Type</span>
                    <div className="text-xs font-mono text-[#aeaeb7] mt-1">{att.mutation}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Observed Agent Behavior</span>
                    <div className="text-xs text-[#aeaeb7] mt-1">{att.agent_behavior}</div>
                  </div>
                </div>

                {/* Sanitized Injected Payload */}
                <div>
                  <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Injected Synthetic Response Payload</span>
                  <div className="mt-1.5 p-4 rounded-xl bg-[#141418] border border-[#22222a] font-mono text-xs text-[#70dcd3] leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
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
        <div className="p-6 rounded-[20px] bg-[#0d0e12] border border-[#70dcd3]/30 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#70dcd3] uppercase tracking-[0.094em]">
            <RotateCw className="w-4 h-4" />
            <span>Why Did the Attack Mutate?</span>
          </div>
          <p className="text-xs text-[#aeaeb7] leading-relaxed font-normal">
            {attackData.adaptation_rationale || 
             "Previous trajectory contained agent refusal indicators. The Adversarial Engine autonomously mutated from a direct imperative instruction to an indirect regulatory compliance wrapper to bypass the model's safety pre-prompt."}
          </p>
        </div>
      )}

    </div>
  );
}
