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
      <div className="p-8 text-center text-av-textMuted font-mono text-sm">
        No attack records available for this baseline run.
      </div>
    );
  }

  const attempts = attackData.attempts || [];

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Objective Card */}
      <div className="p-5 rounded-xl bg-av-surface border border-av-border shadow-subtle space-y-3">
        <div className="flex items-center space-x-2 text-sm font-semibold text-av-textPrimary tracking-tight">
          <Crosshair className="w-4 h-4 text-av-textSecondary" />
          <span>Attack Objective</span>
        </div>
        <p className="text-sm text-av-textSecondary leading-relaxed">
          {attackData.objective}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-av-bg border border-av-borderLight">
            <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Target Threat</span>
            <div className="text-xs font-semibold text-av-textPrimary mt-1">{attackData.threat_category}</div>
          </div>
          <div className="p-3 rounded-lg bg-av-bg border border-av-borderLight">
            <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Injection Point</span>
            <div className="text-xs font-semibold text-av-textPrimary mt-1">{attackData.injection_point}</div>
          </div>
          <div className="p-3 rounded-lg bg-av-bg border border-av-borderLight">
            <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Target Sink</span>
            <div className="text-xs font-semibold text-av-textPrimary mt-1">{attackData.high_risk_sink}</div>
          </div>
        </div>
      </div>

      {/* Adaptive Attempts List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-av-textPrimary">
          Attack Trajectory ({attempts.length} Attempts)
        </h3>

        {attempts.length === 0 ? (
          <div className="p-6 rounded-xl bg-av-surface border border-av-border text-center text-sm text-av-textSecondary">
            Baseline nominal flow: 0 adversarial injections executed.
          </div>
        ) : (
          attempts.map((att) => {
            const isInfluenced = att.status === 'influenced';

            return (
              <div 
                key={att.attempt_number}
                className={clsx(
                  "p-5 rounded-xl border transition-all space-y-4 shadow-sm",
                  isInfluenced 
                    ? "bg-av-warnBg border-av-warn/30" 
                    : "bg-av-surface border-av-border"
                )}
              >
                {/* Attempt Header */}
                <div className="flex items-center justify-between border-b border-av-borderLight pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-av-bg text-av-textSecondary border border-av-borderLight uppercase">
                      Attempt {att.attempt_number}
                    </span>
                    <span className={clsx("text-sm font-semibold", isInfluenced ? "text-av-warn" : "text-av-textPrimary")}>
                      {att.strategy}
                    </span>
                  </div>

                  <div className={clsx(
                    "px-2.5 py-1 rounded text-[10px] font-semibold uppercase flex items-center space-x-1.5 border",
                    isInfluenced 
                      ? "bg-[#251A0D] text-av-warn border-av-warn/30" 
                      : "bg-av-bg text-av-textMuted border-av-borderLight"
                  )}>
                    {isInfluenced ? <span>Agent Influenced</span> : <span>Refused</span>}
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Mutation Type</span>
                    <div className="text-xs text-av-textPrimary mt-1">{att.mutation}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Observed Behavior</span>
                    <div className="text-xs text-av-textPrimary mt-1">{att.agent_behavior}</div>
                  </div>
                </div>

                {/* Sanitized Injected Payload */}
                <div>
                  <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Injected Payload</span>
                  <div className="mt-1.5 p-3 rounded-lg bg-av-bg border border-av-borderLight font-mono text-xs text-av-textSecondary overflow-x-auto whitespace-pre-wrap select-text">
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
        <div className="p-5 rounded-xl bg-av-infoBg border border-av-info/30 space-y-2">
          <div className="flex items-center space-x-2 text-sm font-semibold text-av-info">
            <RotateCw className="w-4 h-4" />
            <span>Adaptation Rationale</span>
          </div>
          <p className="text-sm text-av-info/80 leading-relaxed">
            {attackData.adaptation_rationale || 
             "Previous trajectory contained agent refusal indicators. The Adversarial Engine autonomously mutated the payload to bypass the model's safety instructions."}
          </p>
        </div>
      )}

    </div>
  );
}
