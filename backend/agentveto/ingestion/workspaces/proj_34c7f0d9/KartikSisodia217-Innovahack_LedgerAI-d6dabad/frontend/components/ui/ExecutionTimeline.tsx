import React, { useState, useEffect } from "react";
import { Bot, CheckCircle } from "lucide-react";

export type ExecState = "pending" | "running" | "complete";

export interface DeptState {
  name: string;
  state: ExecState;
  activity?: string;
}

export function ExecutionTimeline({ 
  isTyping, 
  abortController, 
  prompt 
}: { 
  isTyping: boolean; 
  abortController: AbortController | null;
  prompt: string;
}) {
  const [departments, setDepartments] = useState<DeptState[]>([]);
  const [globalStep, setGlobalStep] = useState(0);

  useEffect(() => {
    if (!isTyping) {
      setGlobalStep(0);
      setDepartments([]);
      return;
    }

    const lowerPrompt = prompt.toLowerCase();
    let timeline: any[] = [];
    
    if (lowerPrompt.includes("invoice")) {
      setDepartments([
        { name: "Financial Department", state: "pending" },
        { name: "Audit Department", state: "pending" },
        { name: "Risk Department", state: "pending" },
        { name: "Executive Advisory", state: "pending" }
      ]);
      timeline = [
        { step: 1, delay: 500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "running", activity: "Reading invoices..." } : x)) },
        { step: 2, delay: 2000, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "complete" } : i === 1 ? { ...x, state: "running", activity: "Matching purchase orders..." } : x)) },
        { step: 3, delay: 3500, action: () => setDepartments(d => d.map((x, i) => i === 1 ? { ...x, state: "complete" } : i === 2 ? { ...x, state: "running", activity: "Checking duplicate payments..." } : x)) },
        { step: 4, delay: 5000, action: () => setDepartments(d => d.map((x, i) => i === 2 ? { ...x, state: "complete" } : i === 3 ? { ...x, state: "running", activity: "Synthesizing findings..." } : x)) },
        { step: 5, delay: 7000, action: () => setDepartments(d => d.map((x, i) => i === 3 ? { ...x, state: "complete", activity: "Preparing report..." } : x)) },
      ];
    } else if (lowerPrompt.includes("gst") || lowerPrompt.includes("tax")) {
      setDepartments([
        { name: "Tax Department", state: "pending" },
        { name: "Audit Department", state: "pending" },
        { name: "Executive Advisory", state: "pending" }
      ]);
      timeline = [
        { step: 1, delay: 500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "running", activity: "Reviewing GST documentation..." } : x)) },
        { step: 2, delay: 2500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "complete" } : i === 1 ? { ...x, state: "running", activity: "Checking compliance..." } : x)) },
        { step: 3, delay: 4500, action: () => setDepartments(d => d.map((x, i) => i === 1 ? { ...x, state: "complete" } : i === 2 ? { ...x, state: "running", activity: "Preparing tax summary..." } : x)) },
      ];
    } else if (lowerPrompt.includes("bank") || lowerPrompt.includes("statement")) {
      setDepartments([
        { name: "Financial Department", state: "pending" },
        { name: "Audit Department", state: "pending" },
        { name: "Executive Advisory", state: "pending" }
      ]);
      timeline = [
        { step: 1, delay: 500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "running", activity: "Extracting transactions..." } : x)) },
        { step: 2, delay: 2500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "complete" } : i === 1 ? { ...x, state: "running", activity: "Reconciling balances..." } : x)) },
        { step: 3, delay: 4500, action: () => setDepartments(d => d.map((x, i) => i === 1 ? { ...x, state: "complete" } : i === 2 ? { ...x, state: "running", activity: "Synthesizing statement analysis..." } : x)) },
      ];
    } else {
      setDepartments([
        { name: "Financial Department", state: "pending" },
        { name: "Audit Department", state: "pending" },
        { name: "Tax Department", state: "pending" },
        { name: "Risk Department", state: "pending" },
        { name: "Executive Advisory", state: "pending" },
      ]);
      timeline = [
        { step: 1, delay: 500, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "running", activity: "Reviewing financial statements..." } : x)) },
        { step: 2, delay: 2000, action: () => setDepartments(d => d.map((x, i) => i === 0 ? { ...x, state: "complete" } : i === 1 ? { ...x, state: "running", activity: "Evaluating liquidity..." } : x)) },
        { step: 3, delay: 3500, action: () => setDepartments(d => d.map((x, i) => i === 1 ? { ...x, state: "complete" } : i === 2 ? { ...x, state: "running", activity: "Calculating financial ratios..." } : x)) },
        { step: 4, delay: 4500, action: () => setDepartments(d => d.map((x, i) => i === 2 ? { ...x, state: "complete" } : i === 3 ? { ...x, state: "running", activity: "Checking anomalies..." } : x)) },
        { step: 5, delay: 5500, action: () => setDepartments(d => d.map((x, i) => i === 3 ? { ...x, state: "complete" } : i === 4 ? { ...x, state: "running", activity: "Synthesizing findings..." } : x)) },
        { step: 6, delay: 7500, action: () => setDepartments(d => d.map((x, i) => i === 4 ? { ...x, state: "complete", activity: "Preparing Board Report..." } : x)) },
      ];
    }

    const startTime = Date.now();
    let currentStepIndex = -1;

    const intervalId = setInterval(() => {
      if (abortController?.signal.aborted) {
        clearInterval(intervalId);
        return;
      }
      
      const elapsed = Date.now() - startTime;
      
      let nextStepIndex = -1;
      for (let i = 0; i < timeline.length; i++) {
        if (elapsed >= timeline[i].delay) {
          nextStepIndex = i;
        }
      }

      if (nextStepIndex > currentStepIndex) {
        for (let i = currentStepIndex + 1; i <= nextStepIndex; i++) {
          setGlobalStep(timeline[i].step);
          timeline[i].action();
        }
        currentStepIndex = nextStepIndex;
      }

      if (currentStepIndex >= timeline.length - 1) {
        clearInterval(intervalId);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [isTyping, abortController, prompt]);

  if (!isTyping) return null;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0c0e17]/90 px-5 py-5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-4 border-b border-white/[0.04] pb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">LedgerAI Accounting Firm</h3>
          <p className="text-[11px] text-zinc-400">
            {globalStep === 0 && "Preparing Engagement..."}
            {globalStep > 0 && globalStep < 6 && "Assigning Specialists & Reviewing Records..."}
            {globalStep >= 6 && "Lead Partner is finalizing the executive report..."}
          </p>
        </div>
      </div>

      <div className="space-y-3 transition-all duration-300 ease-in-out">
        {departments.map((dept, idx) => {
          const isRunning = dept.state === 'running';
          const isPending = dept.state === 'pending';
          const isComplete = dept.state === 'complete';
          
          return (
            <div 
              key={idx} 
              className={`flex flex-col gap-1 rounded-lg transition-all duration-300 ease-in-out overflow-hidden
                ${isRunning ? 'bg-indigo-500/5 p-2 border border-indigo-500/20' : 'p-0.5 border border-transparent'}
              `}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium transition-colors duration-300 ${isPending ? 'text-zinc-600' : isRunning ? 'text-indigo-400' : 'text-zinc-400'}`}>
                  {dept.name}
                </span>
                <span className="flex-shrink-0 ml-4">
                  {isPending && <span className="text-zinc-600 font-mono text-[10px]">○</span>}
                  {isRunning && <span className="text-indigo-400 font-mono text-[11px] inline-block animate-spin">⟳</span>}
                  {isComplete && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in duration-300" />}
                </span>
              </div>
              
              {isRunning && dept.activity && (
                <div className="pl-3 border-l border-indigo-500/30 ml-1 py-0.5 mt-1 animate-in slide-in-from-top-1 fade-in duration-300">
                  <p className="text-[10px] text-indigo-300/80 truncate">• {dept.activity}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
