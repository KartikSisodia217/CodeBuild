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
    <div className="flex-1 overflow-y-auto bg-[#0B0F17] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
              <History className="w-3.5 h-3.5" />
              <span>CI/CD ADJUDICATION AUDIT LOG</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Security Run History</h1>
            <p className="text-sm text-slate-400 mt-1">
              Historical record of all autonomous adversarial simulations and build gating decisions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            {runs.length} Records Found
          </span>
        </div>

        {/* History Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#121824] overflow-hidden shadow-2xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0E131F] text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 pl-6">Run ID</th>
                <th className="p-4">Target Agent</th>
                <th className="p-4">Adjudication Result</th>
                <th className="p-4">Threat Classification</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#121824]">
              {runs.map((r) => {
                const isVeto = r.expected_verdict === 'CRITICAL_VETO';
                const isPass = r.expected_verdict === 'PASS';

                return (
                  <tr 
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 pl-6 font-bold text-indigo-400">{r.run_number}</td>
                    <td className="p-4 font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {r.agent_name}
                      <span className="block text-[10px] text-slate-500 font-normal">{r.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 border",
                        isVeto ? "bg-red-500/10 text-red-400 border-red-500/30" :
                        isPass ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      )}>
                        <span>{isVeto ? '🔴 VETO' : isPass ? '🟢 PASS' : '🟡 WARN'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                        {r.threat_category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{r.duration}</td>
                    <td className="p-4 text-slate-500">{r.timestamp}</td>
                    <td className="p-4 pr-6 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white transition-all text-[11px] font-semibold flex items-center space-x-1 ml-auto">
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
