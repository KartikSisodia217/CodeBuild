import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  MinusCircle,
  Plus,
  ChevronRight,
  Info
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ runs, metrics, onSelectRun, onOpenNewScan }) {
  const total = runs.length;
  const vetoed = runs.filter(r => r.expected_verdict === 'CRITICAL_VETO' || r.expected_verdict === 'VETO' || r.metadata?.verdict === 'VETO').length;
  const passed = runs.filter(r => r.expected_verdict === 'PASS' || r.metadata?.verdict === 'PASS').length;
  const notAgentic = runs.filter(r => r.metadata?.verdict === 'NOT_AGENTIC' || r.expected_verdict === 'NOT_AGENTIC').length;
  const notRun = runs.filter(r => r.metadata?.verdict === 'EXECUTION_UNAVAILABLE' || r.expected_verdict === 'EXECUTION_UNAVAILABLE').length;
  const other = notAgentic + notRun;

  return (
    <div className="flex-1 overflow-y-auto bg-av-bg text-av-textPrimary p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-av-textPrimary">
              Security Overview
            </h1>
            <p className="text-sm text-av-textSecondary mt-1.5 leading-relaxed max-w-md">
              Monitor and evaluate autonomous agent behavior for tool misuse and indirect prompt injection.
            </p>
          </div>

          <button
            onClick={onOpenNewScan}
            className="btn-primary space-x-2 h-8 px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>

        {/* Compact Security Posture Summary */}
        <div className="flex items-center space-x-8 pb-8 border-b border-av-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-av-textMuted mb-1">Scans</div>
            <div className="text-xl font-semibold text-av-textPrimary">{total}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-av-textMuted mb-1">Pass</div>
            <div className="text-xl font-semibold text-av-pass">{passed}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-av-textMuted mb-1">Veto</div>
            <div className="text-xl font-semibold text-av-veto">{vetoed}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-av-textMuted mb-1">Other</div>
            <div className="text-xl font-semibold text-av-textSecondary">{other}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main List: Recent Scans */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-av-textSecondary tracking-tight">Recent Scans</h2>

            {runs.length === 0 ? (
              <div className="rounded-lg border border-av-borderLight bg-av-surface p-8 text-center">
                <div className="text-sm font-semibold text-av-textPrimary mb-1">No scans yet</div>
                <div className="text-xs text-av-textSecondary mb-4">Run your first AgentVeto evaluation to see whether an AI agent can be manipulated into unsafe tool behavior.</div>
                <button onClick={onOpenNewScan} className="btn-secondary">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> New Scan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {runs.slice(0, 5).map((r) => {
                  const verdict = r.metadata?.verdict || r.expected_verdict;
                  const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';
                  const isPass = verdict === 'PASS';
                  const isNotAgentic = verdict === 'NOT_AGENTIC';
                  const isNotRun = verdict === 'EXECUTION_UNAVAILABLE' || verdict === 'SCAN NOT RUN';
                  const isUnsupported = verdict === 'UNSUPPORTED';
                  
                  let statusColor = "text-av-textSecondary";
                  let statusLabel = verdict;

                  if (isVeto) {
                    statusColor = "text-av-veto";
                    statusLabel = "VETO";
                  } else if (isPass) {
                    statusColor = "text-av-pass";
                    statusLabel = "PASS";
                  } else if (isNotAgentic) {
                    statusColor = "text-av-textSecondary";
                    statusLabel = "NOT AGENTIC";
                  } else if (isNotRun) {
                    statusColor = "text-av-textMuted";
                    statusLabel = "SCAN NOT RUN";
                  } else if (isUnsupported) {
                    statusColor = "text-av-warn";
                    statusLabel = "UNSUPPORTED";
                  }

                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelectRun(r.id)}
                      className="group flex flex-col p-4 rounded-lg bg-av-surface hover:bg-av-surfaceHover border border-av-borderLight cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-av-textPrimary">
                            {r.metadata?.name || r.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-av-textMuted group-hover:text-av-textPrimary transition-colors" />
                      </div>
                      
                      <div className="mt-1 text-xs text-av-textSecondary">
                        {r.agent_name || 'Agent Project'} · deterministic fixture
                      </div>

                      <div className="mt-3 flex items-center space-x-3 text-[11px] font-medium">
                        <span className={statusColor}>
                          {statusLabel}
                        </span>
                        <span className="text-av-borderLight">•</span>
                        <span className="text-av-textMuted">
                          {r.timestamp || 'Just now'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side Panel: Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-av-textSecondary tracking-tight">Security Activity</h2>
            
            {runs.length === 0 ? (
              <div className="text-xs text-av-textMuted">No recent activity.</div>
            ) : (
              <div className="space-y-4">
                {runs.slice(0, 4).map((r, i) => {
                  const verdict = r.metadata?.verdict || r.expected_verdict;
                  const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';
                  
                  return (
                    <div key={`act-${i}`} className="text-xs">
                      <div className="text-av-textMuted mb-0.5">{r.timestamp ? r.timestamp.split(' ')[1] : 'Just now'}</div>
                      <div className="font-semibold text-av-textPrimary">{r.metadata?.name || r.name}</div>
                      <div className="text-av-textSecondary mt-0.5 leading-snug">
                        {verdict} · {isVeto ? 'Indirect prompt injection detected' : 'No policy violation detected'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
