import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Bot,
  Radio,
  Database,
  Lock,
  ChevronRight,
  Plus
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ runs = [], metrics, onSelectRun, onOpenNewScan }) {
  const total = metrics?.total_evaluations || runs.length || 18;
  const vetoed = metrics?.veto_count || runs.filter(r => r.expected_verdict === 'CRITICAL_VETO' || r.expected_verdict === 'VETO' || r.metadata?.verdict === 'VETO').length || 12;
  const passed = metrics?.pass_count || runs.filter(r => r.expected_verdict === 'PASS' || r.metadata?.verdict === 'PASS').length || 5;

  return (
    <div className="flex-1 overflow-y-auto bg-[#070707] text-[#ffffff] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header (Mission Control Style) */}
        <div className="flex items-center justify-between pb-6 border-b border-[#22222a]">
          <div>
            <div className="eyebrow-tech mb-1 text-[#70dcd3]">
              MISSION CONTROL • CI/CD SECURITY GATE
            </div>
            <h1 className="text-3xl font-display font-light tracking-[0.056em] text-white">
              AgentVeto Dashboard
            </h1>
            <p className="text-xs text-[#aeaeb7] mt-1 font-normal font-sans">
              Deterministic pre-production verification for autonomous agent tool invocations and state changes.
            </p>
          </div>

          <button
            onClick={onOpenNewScan}
            className="px-5 py-2.5 btn-harness-white text-xs flex items-center space-x-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Security Scan</span>
          </button>
        </div>

        {/* 3 Metric Plates (Carbon Plates) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Total Evaluations */}
          <div className="p-6 carbon-card">
            <div className="flex items-center justify-between text-[#a2a4a9] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em]">Total Simulations</span>
              <span className="text-xs font-mono text-[#70dcd3]">100% Deterministic</span>
            </div>
            <div className="text-4xl font-display font-light tracking-wide text-white">{total}</div>
            <div className="text-xs text-[#aeaeb7] mt-1 font-sans">Autonomous agent evaluations executed</div>
          </div>

          {/* Card 2: Exploits Blocked (Vetoed) */}
          <div className="p-6 carbon-card border-[#F43F5E]/30">
            <div className="flex items-center justify-between text-[#F43F5E] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#F43F5E]">Builds Vetoed</span>
              <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />
            </div>
            <div className="text-4xl font-display font-light tracking-wide text-[#F43F5E]">{vetoed}</div>
            <div className="text-xs text-[#aeaeb7] mt-1 font-sans">Critical policy violations halted</div>
          </div>

          {/* Card 3: Compliant Runs */}
          <div className="p-6 phosphor-card">
            <div className="flex items-center justify-between text-[#70dcd3] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#70dcd3]">Builds Passed</span>
              <ShieldCheck className="w-4 h-4 text-[#70dcd3]" />
            </div>
            <div className="text-4xl font-display font-light tracking-wide text-white">{passed}</div>
            <div className="text-xs text-[#a6e5f2] mt-1 font-sans">Compliant agents verified safe</div>
          </div>

        </div>

        {/* Pipeline Strip (Carbon Plate with Obsidian Nodes) */}
        <div className="p-6 carbon-card flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3 text-[#ffffff]">
            <div className="w-9 h-9 rounded-full bg-[#141418] border border-[#22222a] flex items-center justify-center text-[#70dcd3]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white text-xs font-medium font-sans">Target Agent</div>
              <div className="text-[10px] text-[#aeaeb7]">LangGraph / Python Tools</div>
            </div>
          </div>

          <div className="text-[#2e3038] hidden md:block font-bold">→</div>

          <div className="flex items-center space-x-3 text-[#ffffff]">
            <div className="w-9 h-9 rounded-full bg-[#141418] border border-[#22222a] flex items-center justify-center text-[#0092e4]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white text-xs font-medium font-sans">@intercept Adapter</div>
              <div className="text-[10px] text-[#aeaeb7]">AST Schema Reflection</div>
            </div>
          </div>

          <div className="text-[#2e3038] hidden md:block font-bold">→</div>

          <div className="flex items-center space-x-3 text-[#ffffff]">
            <div className="w-9 h-9 rounded-full bg-[#141418] border border-[#22222a] flex items-center justify-center text-[#75ae4c]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white text-xs font-medium font-sans">Synthetic Sandbox</div>
              <div className="text-[10px] text-[#aeaeb7]">Zero-Mutation StateDiff</div>
            </div>
          </div>

          <div className="text-[#2e3038] hidden md:block font-bold">→</div>

          <div className="flex items-center space-x-3 text-[#ffffff]">
            <div className="w-9 h-9 rounded-full bg-[#F43F5E]/10 border border-[#F43F5E]/30 flex items-center justify-center text-[#F43F5E]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[#F43F5E] text-xs font-medium font-sans">Deterministic Veto</div>
              <div className="text-[10px] text-[#aeaeb7]">Exit Code 1 on Violation</div>
            </div>
          </div>
        </div>

        {/* Recent Runs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-light tracking-wide text-white">Recent Security Runs</h2>
              <p className="text-xs text-[#aeaeb7]">Click any run to inspect the adaptive attack, trace, evidence DAG, and state diff.</p>
            </div>
          </div>

          <div className="carbon-card overflow-hidden">
            {runs.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="text-sm font-medium text-white">No scans recorded yet</div>
                <p className="text-xs text-[#aeaeb7]">Run your first AgentVeto security evaluation to inspect agent vulnerabilities.</p>
                <button onClick={onOpenNewScan} className="btn-harness-ghost px-4 py-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Security Scan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#22222a]">
                {runs.map((r) => {
                  const runId = r.id || r.run_id;
                  const verdict = r.metadata?.verdict || r.expected_verdict || r.verdict;
                  const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';
                  const isPass = verdict === 'PASS';
                  const isNotAgentic = verdict === 'NOT_AGENTIC';
                  const isNotRun = verdict === 'EXECUTION_UNAVAILABLE' || verdict === 'SCAN NOT RUN';

                  return (
                    <div
                      key={runId}
                      onClick={() => onSelectRun(runId)}
                      className="p-5 hover:bg-[#141418] cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Status Dot */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#141418] border border-[#22222a] shrink-0">
                          <span className={clsx(
                            "w-2.5 h-2.5 rounded-full",
                            isVeto ? "bg-[#F43F5E]" :
                            isPass ? "bg-[#70dcd3]" :
                            isNotAgentic || isNotRun ? "bg-[#60606c]" :
                            "bg-[#FBBF24]"
                          )} />
                        </div>

                        {/* Info */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-[#70dcd3]">{r.metadata?.run_number || r.run_number || '#AV-LIVE'}</span>
                            <span className="text-[#60606c]">•</span>
                            <span className="text-sm font-medium text-white group-hover:text-[#70dcd3] transition-colors">
                              {r.metadata?.agent_name || r.agent_name || 'Agent'}
                            </span>
                            <span className="text-xs text-[#aeaeb7] font-mono">({r.metadata?.name || r.name || runId})</span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-xs text-[#aeaeb7] mt-1">
                            <span className={clsx(
                              "badge-pill border",
                              isVeto ? "border-[#F43F5E]/40 text-[#F43F5E] bg-[#F43F5E]/5" :
                              isPass ? "border-[#70dcd3]/40 text-[#70dcd3] bg-[#70dcd3]/5" :
                              "border-[#a2a4a9]/40 text-[#a2a4a9] bg-[#a2a4a9]/5"
                            )}>
                              {r.threat_category || r.metadata?.threat_category || 'OWASP ASI Check'}
                            </span>
                            <span className="font-mono text-[11px] text-[#c8cad0]">
                              {r.attack_attempts ? `${r.attack_attempts} attack attempts` : 'Baseline check'}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-[#a2a4a9]">{r.duration || '< 1s'}</span>
                            <span>•</span>
                            <span className="text-[#60606c] text-[11px]">{r.timestamp || 'Live'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Outlined Pill Badge & Arrow */}
                      <div className="flex items-center space-x-4">
                        <div className={clsx(
                          "badge-pill border",
                          isVeto ? "border-[#F43F5E] text-[#F43F5E]" :
                          isPass ? "border-[#70dcd3] text-[#70dcd3]" :
                          isNotAgentic ? "border-[#60606c] text-[#a2a4a9]" :
                          "border-[#FBBF24] text-[#FBBF24]"
                        )}>
                          <span>
                            {isVeto ? '🔴 VETOED' : 
                             isPass ? '🟢 PASSED' : 
                             isNotAgentic ? '⚪ NOT AGENTIC' : 
                             isNotRun ? '⚪ NOT RUN' : '🟡 WARNED'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#60606c] group-hover:text-white transition-colors" />
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
