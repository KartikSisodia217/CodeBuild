import React from 'react';
import { 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';

export default function RunHistory({ runs, onSelectRun }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#070707] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between pb-6 border-b border-[#22222a]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#a2a4a9] mb-1">
              <History className="w-3.5 h-3.5 text-[#70dcd3]" />
              <span className="tracking-[0.094em] uppercase">CI/CD ADJUDICATION AUDIT LOG</span>
            </div>
            <h1 className="text-2xl font-display font-light tracking-[0.056em] text-white">Security Run History</h1>
            <p className="text-sm text-[#aeaeb7] mt-1 font-normal">
              Historical record of all autonomous adversarial simulations and build gating decisions.
            </p>
          </div>
          <span className="text-xs font-mono text-[#a2a4a9] bg-[#0d0e12] border border-[#22222a] px-3.5 py-1.5 rounded-full">
            {runs.length} Records Found
          </span>
        </div>

        {/* History Table */}
        <div className="bg-[#0d0e12] border border-[#d9dae5]/16 rounded-[20px] overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141418] text-[#a2a4a9] uppercase text-[11px] border-b border-[#22222a]">
              <tr>
                <th className="p-4 pl-6 tracking-[0.094em]">Run ID</th>
                <th className="p-4 tracking-[0.094em]">Target Agent</th>
                <th className="p-4 tracking-[0.094em]">Adjudication Result</th>
                <th className="p-4 tracking-[0.094em]">Threat Classification</th>
                <th className="p-4 tracking-[0.094em]">Duration</th>
                <th className="p-4 tracking-[0.094em]">Timestamp</th>
                <th className="p-4 pr-6 text-right tracking-[0.094em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222a] bg-[#0d0e12]">
              {runs.map((r) => {
                const isVeto = r.expected_verdict === 'CRITICAL_VETO';
                const isPass = r.expected_verdict === 'PASS';

                return (
                  <tr 
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="hover:bg-[#141418]/60 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 pl-6 font-medium text-[#70dcd3]">{r.run_number}</td>
                    <td className="p-4 font-medium text-white group-hover:text-[#70dcd3] transition-colors">
                      {r.agent_name}
                      <span className="block text-[10px] text-[#a2a4a9] font-normal">{r.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider inline-flex items-center space-x-1.5 border",
                        isVeto ? "border-[#f43f5e] text-[#f43f5e]" :
                        isPass ? "border-[#70dcd3] text-[#70dcd3]" :
                        "border-[#aeaeb7] text-[#aeaeb7]"
                      )}>
                        <span>{isVeto ? '🔴 VETO' : isPass ? '🟢 PASS' : '🟡 WARN'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-[#aeaeb7]">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#141418] text-[#aeaeb7] border border-[#22222a]">
                        {r.threat_category}
                      </span>
                    </td>
                    <td className="p-4 text-[#aeaeb7]">{r.duration}</td>
                    <td className="p-4 text-[#60606c]">{r.timestamp}</td>
                    <td className="p-4 pr-6 text-right">
                      <button className="px-3.5 py-1.5 rounded-full border border-white/20 text-[11px] font-normal text-white flex items-center space-x-1 ml-auto group-hover:bg-white group-hover:text-[#070707] transition-all cursor-pointer">
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
