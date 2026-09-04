import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  Activity, 
  Crosshair,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

export default function ScanProgress({ scanConfig, scanResult, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const attempts = scanResult?.attack_analysis?.attempts || [];
  const evaluation = scanResult?.evaluation || {};
  const isVeto = evaluation.status === 'CRITICAL_VETO';

  const steps = [
    { title: "Controlled fixture initialized", detail: scanResult?.metadata?.fixture_disclosure || `${scanConfig.agent_name} configured` },
    { title: "Tool schemas modeled", detail: "Source and restricted sink capabilities analyzed deterministically" },
    ...attempts.map((attempt) => ({
      title: `Adversarial simulation: attempt ${attempt.attempt_number}`,
      detail: attempt.strategy || 'Bounded payload mutation',
      outcome: attempt.result,
      status: attempt.status,
    })),
    { title: "High-risk sink evaluation", detail: evaluation.details?.high_risk_sink_reached ? "Restricted sink attempt observed in the synthetic sandbox" : "No restricted sink attempt observed" },
    { title: "State evaluation", detail: evaluation.details?.unauthorized_state_change ? "Unauthorized synthetic state change recorded" : "No unauthorized synthetic state changes recorded" },
    { title: "Deterministic policy adjudication", detail: evaluation.reason || "Policy invariants evaluated" }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(completeTimer);
    }
  }, [currentStep]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#070707] p-8 select-none">
      <div className="w-full max-w-2xl rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#22222a]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#70dcd3] mb-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#70dcd3]" />
              <span className="tracking-[0.094em] uppercase">SECURITY SCAN RUNNING</span>
            </div>
            <h2 className="text-xl font-display font-light text-white tracking-[0.056em]">{scanConfig.agent_name}</h2>
            <p className="text-xs text-[#aeaeb7] font-mono mt-0.5">Profile: {scanConfig.attack_profile}</p>
          </div>

          <button
            onClick={onComplete}
            className="btn-harness-ghost px-4 py-1.5 text-xs cursor-pointer"
          >
            Skip to Result →
          </button>
        </div>

        {/* Progression Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isFinished = currentStep > idx;
            const isCurrent = currentStep === idx;
            const isPending = currentStep < idx;

            return (
              <div 
                key={idx}
                className={clsx(
                  "p-3.5 rounded-xl border transition-all flex items-center justify-between",
                  isFinished ? "bg-[#141418] border-[#22222a] text-[#aeaeb7]" :
                  isCurrent ? "bg-[#141418] border-[#70dcd3]/40 text-white" :
                  "opacity-30 border-transparent text-[#60606c]"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isFinished ? (
                      step.status === 'refused' ? (
                        <span className="text-[#a2a4a9] text-xs font-mono">❌</span>
                      ) : step.status === 'influenced' ? (
                        <span className="text-[#f43f5e] text-xs font-mono">⚠️</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#70dcd3]" />
                      )
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#70dcd3] animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#2e3038]" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-mono font-medium tracking-wide text-white">{step.title}</div>
                    <div className="text-[10px] text-[#a2a4a9]">{step.detail}</div>
                  </div>
                </div>

                {isFinished && step.outcome && (
                  <div className={clsx(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border",
                    step.status === 'refused' ? "border-[#2e3038] text-[#a2a4a9]" :
                    step.status === 'influenced' ? "border-[#f43f5e] text-[#f43f5e]" :
                    "border-[#70dcd3] text-[#70dcd3]"
                  )}>
                    {step.outcome}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Decision Banner when finished */}
        {currentStep >= steps.length && (
          <div className={clsx(
            "p-5 rounded-2xl border flex items-center justify-between animate-fadeIn bg-[#141418]",
            isVeto
              ? "border-[#f43f5e]/40 text-white"
              : "border-[#70dcd3]/40 text-white"
          )}>
            <div className="flex items-center space-x-3">
              {isVeto ? (
                <ShieldAlert className="w-6 h-6 text-[#f43f5e]" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-[#70dcd3]" />
              )}
              <div>
                <div className="text-sm font-medium font-mono uppercase tracking-[0.056em]">
                  {isVeto ? '🔴 BUILD VETOED' : '🟢 BUILD PASSED'}
                </div>
                <div className="text-xs text-[#aeaeb7] mt-0.5 font-normal">
                  {evaluation.reason || (isVeto ? 'Deterministic policy violation proven.' : 'No exploitable policy violations detected.')}
                </div>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View Run Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#070707]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
