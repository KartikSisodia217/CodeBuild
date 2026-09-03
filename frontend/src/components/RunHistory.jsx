import React from 'react';
import { 
  History, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MinusCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function RunHistory({ runs, onSelectRun }) {
  return (
    <div className="flex-1 overflow-y-auto bg-av-bg text-av-textPrimary p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between pb-6 border-b border-av-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-av-textPrimary">Scans</h1>
            <p className="text-sm text-av-textSecondary mt-1">
              Historical record of all security scans.
            </p>
          </div>
          <span className="text-xs font-semibold text-av-textSecondary bg-av-surface border border-av-borderLight px-3 py-1.5 rounded-md shadow-subtle uppercase tracking-wider">
            {runs.length} Records
          </span>
        </div>

        {/* History Table */}
        <div className="rounded-lg border border-av-border bg-av-surface overflow-hidden shadow-subtle">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-av-surfaceElevated text-av-textSecondary text-[10px] uppercase tracking-wider font-semibold border-b border-av-borderLight">
              <tr>
                <th className="px-5 py-3">Run ID</th>
                <th className="px-5 py-3">Target Project</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3">Threat Category</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-av-borderLight bg-av-surface">
              {runs.map((r) => {
                const verdict = r.metadata?.verdict || r.expected_verdict;
                const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';
                const isPass = verdict === 'PASS';
                const isNotAgentic = verdict === 'NOT_AGENTIC';
                const isNotRun = verdict === 'EXECUTION_UNAVAILABLE' || verdict === 'SCAN NOT RUN';
                const isUnsupported = verdict === 'UNSUPPORTED';
                
                let statusColor = "text-av-textSecondary bg-av-bg border-av-borderLight";
                let statusLabel = verdict;

                if (isVeto) {
                  statusColor = "text-av-veto bg-[#2A1114] border-av-veto/30";
                  statusLabel = "VETO";
                } else if (isPass) {
                  statusColor = "text-av-pass bg-[#101F18] border-av-pass/30";
                  statusLabel = "PASS";
                } else if (isNotAgentic) {
                  statusColor = "text-av-textSecondary bg-av-bg border-av-borderLight";
                  statusLabel = "NOT AGENTIC";
                } else if (isNotRun) {
                  statusColor = "text-av-textMuted bg-av-bg border-av-borderLight";
                  statusLabel = "SCAN NOT RUN";
                } else if (isUnsupported) {
                  statusColor = "text-av-warn bg-[#251A0D] border-av-warn/30";
                  statusLabel = "NOT SUPPORTED";
                }

                return (
                  <tr 
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="hover:bg-av-surfaceHover cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-av-textMuted text-xs">{r.run_number || r.id.substring(0,6)}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-av-textPrimary group-hover:text-white transition-colors text-sm">{r.agent_name || r.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 border",
                        statusColor
                      )}>
                        <span>{statusLabel}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-av-textSecondary">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-av-bg border border-av-borderLight font-mono font-semibold uppercase tracking-wider">
                        {r.threat_category || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-av-textMuted text-xs font-mono">{r.duration || '—'}</td>
                    <td className="px-5 py-4 text-av-textMuted text-xs font-mono">{r.timestamp || '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1 rounded text-av-borderLight group-hover:text-av-textSecondary transition-colors ml-auto">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
