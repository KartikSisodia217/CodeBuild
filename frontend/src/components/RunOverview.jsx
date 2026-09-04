import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  MinusCircle,
  ArrowRight, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import clsx from 'clsx';

export default function RunOverview({ data, onSwitchTab }) {
  if (!data) return null;

  const evaluation = data.evaluation || {};
  const meta = data.metadata || {};
  
  const verdict = meta.verdict || data.verdict || data.status;
  const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';
  const isPass = verdict === 'PASS';
  const isNotAgentic = verdict === 'NOT_AGENTIC';
  const isNotSupported = verdict === 'UNSUPPORTED';
  const isNotRun = verdict === 'EXECUTION_UNAVAILABLE' || verdict === 'SCAN NOT RUN' || verdict === 'EXECUTION_FAILED';
  
  const injectionSource = evaluation.injection_source_span_id || data.threat_model?.injection_point || 'None observed';
  const highRiskSink = evaluation.violating_tool || (evaluation.details?.high_risk_sink_reached ? data.threat_model?.high_risk_sink : 'None reached');

  // Determine Title, Description, and Colors
  let title = "SECURITY SCAN";
  let description = "";
  let icon = <AlertTriangle className="w-6 h-6" />;
  let bannerClass = "bg-av-surface border-av-border text-av-textPrimary";
  let iconBgClass = "bg-av-bg text-av-textSecondary border-av-border";

  if (isVeto) {
    title = "VETO";
    description = "Security violation detected. AgentVeto found a threat path that caused the agent to attempt an unauthorized action.";
    icon = <ShieldAlert className="w-8 h-8 text-av-veto" />;
    bannerClass = "bg-av-vetoBg border-av-veto/30 text-av-veto";
    iconBgClass = "bg-[#1F1315] text-av-veto border-av-veto/30";
  } else if (isPass) {
    title = "PASS";
    description = "No tested attack succeeded. AgentVeto tested the configured attack paths and did not observe a policy violation.";
    icon = <ShieldCheck className="w-8 h-8 text-av-pass" />;
    bannerClass = "bg-av-passBg border-av-pass/30 text-av-pass";
    iconBgClass = "bg-[#101F18] text-av-pass border-av-pass/30";
  } else if (isNotAgentic) {
    title = "NOT AN AGENT";
    description = "This project does not appear to contain an autonomous tool-using agent that AgentVeto can evaluate.";
    icon = <MinusCircle className="w-8 h-8 text-av-textSecondary" />;
    bannerClass = "bg-av-surface border-av-border text-av-textPrimary";
    iconBgClass = "bg-av-bg text-av-textSecondary border-av-borderLight";
  } else if (isNotSupported) {
    title = "NOT SUPPORTED";
    description = "We detected an AI agent, but its framework is not currently supported by AgentVeto.";
    icon = <AlertTriangle className="w-8 h-8 text-av-warn" />;
    bannerClass = "bg-av-warnBg border-av-warn/30 text-av-warn";
    iconBgClass = "bg-[#1E1911] text-av-warn border-av-warn/30";
  } else if (isNotRun) {
    title = "SCAN NOT RUN";
    description = "AgentVeto detected a compatible agent, but could not safely execute it in the current environment.";
    icon = <MinusCircle className="w-8 h-8 text-av-textMuted" />;
    bannerClass = "bg-av-surface border-av-border text-av-textPrimary";
    iconBgClass = "bg-av-bg text-av-textMuted border-av-borderLight";
  } else {
    // Default fallback
    title = verdict;
    description = evaluation.reason || "Analysis completed.";
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Result Banner */}
      <div className={clsx("p-6 rounded-xl border", bannerClass)}>
        <div className="flex items-start space-x-5">
          <div className={clsx("w-14 h-14 rounded-xl flex items-center justify-center border shrink-0", iconBgClass)}>
            {icon}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight mb-1 text-av-textPrimary">
              {title}
            </h1>
            <p className="text-sm font-medium leading-relaxed max-w-2xl text-av-textSecondary">
              {description}
            </p>
            
            {/* Action buttons if applicable */}
            {(isVeto || isPass) && (
              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={() => onSwitchTab('evidence')}
                  className="btn-secondary space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View evidence</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(isNotAgentic || isNotSupported || isNotRun) ? (
        <div className="p-5 rounded-xl border border-av-border bg-av-surface shadow-subtle">
          <h3 className="text-sm font-medium text-av-textPrimary mb-4">Detection Details</h3>
          <div className="text-sm text-av-textSecondary space-y-2">
            <p><strong>Detected framework:</strong> {meta.integration_type || meta.language || 'Unknown'}</p>
            <p>No security scan was performed.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Condensed Summary for PASS/VETO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-av-textPrimary">Summary</h3>
              <div className="space-y-3">
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Threat</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{evaluation.threat_category || meta.threat_category || 'Agent Goal Hijacking'}</span>
                </div>
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Source</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{injectionSource}</span>
                </div>
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Target</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{highRiskSink}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-av-textSecondary">Impact</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{evaluation.rule_name || 'Unauthorized external action'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-av-textPrimary">Execution Details</h3>
              <div className="space-y-3">
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Tests performed</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">Adaptive Adversarial Testing</span>
                </div>
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Attack attempts</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{meta.attack_attempts ?? data.threat_model?.attempts?.length ?? '—'}</span>
                </div>
                <div className="flex flex-col border-b border-av-border pb-2">
                  <span className="text-xs text-av-textSecondary">Tool calls</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{data.trajectory?.spans?.length ?? meta.tool_calls ?? '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-av-textSecondary">Execution time</span>
                  <span className="text-sm text-av-textPrimary font-medium mt-1">{meta.duration || '—'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Expandable Technical Details */}
          <details className="mt-8 border border-av-border bg-av-surface rounded-xl shadow-subtle overflow-hidden group">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-av-textPrimary hover:bg-av-surfaceHover transition-colors flex items-center justify-between">
              Technical Details
              <span className="text-av-textMuted group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-5 border-t border-av-border space-y-4 bg-av-bg">
              <div>
                <h4 className="text-[10px] font-semibold text-av-textSecondary uppercase tracking-wider mb-2">Execution Metadata</h4>
                <pre className="p-3 bg-av-surface rounded-lg text-xs text-av-textSecondary overflow-x-auto border border-av-borderLight">
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </>
      )}

    </div>
  );
}
