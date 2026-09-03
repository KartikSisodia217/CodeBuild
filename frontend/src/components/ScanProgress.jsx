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
    <div className="flex-1 flex items-center justify-center bg-[#0B0F17] p-8 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#121824] border border-slate-800 shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>SECURITY SCAN RUNNING</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{scanConfig.agent_name}</h2>
            <p className="text-xs text-slate-400 font-mono">Profile: {scanConfig.attack_profile}</p>
          </div>

          <button
            onClick={onComplete}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
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
                  "p-3 rounded-xl border transition-all flex items-center justify-between",
                  isFinished ? "bg-slate-900/40 border-slate-800/80 text-slate-300" :
                  isCurrent ? "bg-indigo-950/20 border-indigo-500/40 text-white shadow-md shadow-indigo-500/10" :
                  "opacity-30 border-transparent text-slate-600"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isFinished ? (
                      step.status === 'refused' ? (
                        <span className="text-slate-400 text-xs font-mono font-bold">❌</span>
                      ) : step.status === 'influenced' ? (
                        <span className="text-amber-400 text-xs font-mono font-bold">⚠️</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold font-mono tracking-wide">{step.title}</div>
                    <div className="text-[10px] text-slate-400">{step.detail}</div>
                  </div>
                </div>

                {isFinished && step.outcome && (
                  <div className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                    step.status === 'refused' ? "bg-slate-800 text-slate-400 border-slate-700" :
                    step.status === 'influenced' ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse" :
                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
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
            "p-4 rounded-xl border flex items-center justify-between animate-fadeIn",
            isVeto
              ? "bg-red-950/30 border-red-500/50 text-red-300"
              : "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
          )}>
            <div className="flex items-center space-x-3">
              {isVeto ? (
                <ShieldAlert className="w-6 h-6 text-red-400" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
              <div>
                <div className="text-sm font-black font-mono uppercase">
                  {isVeto ? '🔴 BUILD VETOED' : '🟢 BUILD PASSED'}
                </div>
                <div className="text-xs text-slate-400">
                  {evaluation.reason || (isVeto ? 'Deterministic policy violation proven.' : 'No exploitable policy violations detected.')}
                </div>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <span>View Run Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
