import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Circle
} from 'lucide-react';
import clsx from 'clsx';

export default function ScanProgress({ scanConfig, scanResult, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const attempts = scanResult?.threat_model?.attempts || [];
  const evaluation = scanResult?.evaluation || {};

  const steps = [
    { title: "Initializing environment", detail: scanResult?.metadata?.fixture_disclosure || `${scanConfig.agent_name} configured` },
    { title: "Modeling agent capabilities", detail: "Analyzing tools and state transitions" },
    ...attempts.map((attempt) => ({
      title: `Testing attack payload ${attempt.attempt_number}`,
      detail: attempt.strategy || 'Bounded payload mutation',
    })),
    { title: "Evaluating results", detail: evaluation.reason || "Checking policy invariants" }
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
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="flex-1 flex items-center justify-center bg-av-bg p-8 select-none">
      <div className="w-full max-w-lg bg-av-surface rounded-xl shadow-modal border border-av-border p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-av-border">
          <div>
            <h2 className="text-sm font-semibold text-av-textPrimary tracking-tight">Security Scan in Progress</h2>
            <p className="text-xs font-mono text-av-textSecondary mt-1">{scanConfig.agent_name}</p>
          </div>

          <button
            onClick={onComplete}
            className="text-xs font-medium text-av-textMuted hover:text-av-textPrimary transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* Progression Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isFinished = currentStep > idx;
            const isCurrent = currentStep === idx;
            const isPending = currentStep < idx;

            return (
              <div 
                key={idx}
                className={clsx(
                  "flex items-start space-x-3 transition-opacity",
                  isPending ? "opacity-30" : "opacity-100"
                )}
              >
                <div className="mt-0.5 w-4 h-4 flex items-center justify-center shrink-0">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-av-textMuted" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-av-textPrimary animate-spin-slow" />
                  ) : (
                    <Circle className="w-3 h-3 text-av-borderLight" />
                  )}
                </div>

                <div>
                  <div className={clsx("text-sm font-semibold", isCurrent ? "text-av-textPrimary" : "text-av-textSecondary")}>
                    {step.title}
                  </div>
                  {(isCurrent || isFinished) && step.detail && (
                    <div className="text-xs text-av-textMuted mt-1 font-mono">{step.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Decision Banner when finished */}
        {currentStep >= steps.length && (
          <div className="pt-4 border-t border-av-border flex justify-end">
            <button
              onClick={onComplete}
              className="btn-primary space-x-2"
            >
              <span>View Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
