import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  ChevronRight,
  Bot,
  Radio,
  Lock,
  Database,
  Terminal,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ runs, metrics, onSelectRun }) {
  const total = runs.length || metrics.total_evaluations || 18;
  const vetoed = runs.filter(r => r.expected_verdict === 'CRITICAL_VETO').length || metrics.veto_count || 12;
  const passed = runs.filter(r => r.expected_verdict === 'PASS').length || metrics.pass_count || 5;

  return (
    <div className="flex-1 overflow-y-auto bg-[#070707] text-[#ffffff] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header (Harness Mission Control Style) */}
        <div className="flex items-center justify-between pb-6 border-b border-[#22222a]">
          <div>
            <div className="eyebrow-tech mb-1 text-[#70dcd3]">
              MISSION CONTROL • CI/CD SECURITY GATE
            </div>
            <h1 className="text-3xl font-display font-light tracking-[0.05em] text-white">
              Security Console
            </h1>
            <p className="text-sm text-[#aeaeb7] mt-1 font-sans">
              Active deterministic gate and continuous adversarial simulation feed.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-[#c8cad0] bg-[#0d0e12] border border-[#22222a] px-4 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#70dcd3] animate-pulse" />
            <span className="tracking-wider text-[11px] uppercase text-[#70dcd3] font-medium">Gate Active</span>
          </div>
        </div>

        {/* 3 Metric Cards (Carbon Plate with light Fog border, 1 Phosphor Mint Accent Card) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Total Scans */}
          <div className="p-6 carbon-card">
            <div className="flex items-center justify-between text-[#aeaeb7] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#a2a4a9]">Total Simulations</span>
              <Layers className="w-4 h-4 text-[#70dcd3]" />
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

          {/* Card 3: Compliant Runs (Phosphor Mint Accent Card - Harness Signature Highlight) */}
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

        {/* Recent Runs Section (Activity Feed Style from Harness) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-light tracking-wide text-white">Recent Security Runs</h2>
              <p className="text-xs text-[#aeaeb7]">Click any run to inspect the adaptive attack, trace, evidence DAG, and state diff.</p>
            </div>
          </div>

          <div className="carbon-card overflow-hidden">
            <div className="divide-y divide-[#22222a]">
              {runs.map((r) => {
                const isVeto = r.expected_verdict === 'CRITICAL_VETO';
                const isPass = r.expected_verdict === 'PASS';

                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRun(r.id)}
                    className="p-5 hover:bg-[#141418] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Status Dot (8px circle like Harness activity row) */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#141418] border border-[#22222a] shrink-0">
                        <span className={clsx(
                          "w-2.5 h-2.5 rounded-full",
                          isVeto ? "bg-[#F43F5E]" :
                          isPass ? "bg-[#70dcd3]" :
                          "bg-[#FBBF24]"
                        )} />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-[#70dcd3]">{r.run_number}</span>
                          <span className="text-[#60606c]">•</span>
                          <span className="text-sm font-medium text-white group-hover:text-[#70dcd3] transition-colors">{r.agent_name}</span>
                          <span className="text-xs text-[#aeaeb7] font-mono">({r.name})</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs text-[#aeaeb7] mt-1">
                          <span className={clsx(
                            "badge-pill border",
                            isVeto ? "border-[#F43F5E]/40 text-[#F43F5E] bg-[#F43F5E]/5" :
                            isPass ? "border-[#70dcd3]/40 text-[#70dcd3] bg-[#70dcd3]/5" :
                            "border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/5"
                          )}>
                            {r.threat_category}
                          </span>
                          <span className="font-mono text-[11px] text-[#c8cad0]">{r.attack_attempts ? `${r.attack_attempts} attack attempts` : 'Baseline check'}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-[#a2a4a9]">{r.duration}</span>
                          <span>•</span>
                          <span className="text-[#60606c] text-[11px]">{r.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Outlined Pill Badge (800px radius) & Arrow */}
                    <div className="flex items-center space-x-4">
                      <div className={clsx(
                        "badge-pill border",
                        isVeto ? "border-[#F43F5E] text-[#F43F5E]" :
                        isPass ? "border-[#70dcd3] text-[#70dcd3]" :
                        "border-[#FBBF24] text-[#FBBF24]"
                      )}>
                        <span>{isVeto ? '🔴 VETOED' : isPass ? '🟢 PASSED' : '🟡 WARNED'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#60606c] group-hover:text-white transition-colors" />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
