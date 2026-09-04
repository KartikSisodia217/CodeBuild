"use client";

import { motion } from "framer-motion";
import { Layers, CalendarClock, Briefcase, Zap, Search, HelpCircle } from "lucide-react";

interface PatternDetectorProps {
  patterns: any[];
}

export default function PatternDetector({ patterns }: PatternDetectorProps) {
  if (!patterns || patterns.length === 0) return null;

  const getIcon = (type: string) => {
    switch(type) {
      case "salary": return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "subscription": return <CalendarClock className="w-4 h-4 text-purple-400" />;
      case "utility": return <Zap className="w-4 h-4 text-amber-400" />;
      default: return <Search className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c0e17]/80 p-5 backdrop-blur-xl h-full"
    >
      <div className="flex items-center gap-2 text-zinc-300 mb-6">
        <Layers className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold tracking-wide uppercase">Detected Patterns</h3>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {patterns.map((p: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                  {getIcon(p.type)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-[150px] capitalize">{p.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{p.frequency}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-400 bg-black/50 px-1.5 py-0.5 rounded border border-white/[0.05]">
                  Conf: {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
              {p.description}
            </p>
            {p.evidence && p.evidence.length > 0 && (
              <div className="pt-2 border-t border-white/[0.04] space-y-1">
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Evidence</p>
                {p.evidence.slice(0, 2).map((ev: string, idx: number) => (
                  <div key={idx} className="text-[10px] font-mono text-zinc-400 truncate bg-black/30 px-2 py-1 rounded">
                    {ev}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
