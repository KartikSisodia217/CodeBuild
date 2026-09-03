"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface HealthScoreCardProps {
  healthData: any;
}

export default function HealthScoreCard({ healthData }: HealthScoreCardProps) {
  if (!healthData) return null;

  const score = healthData.overall_score || 0;
  const status = healthData.health_status || "UNKNOWN";
  
  // Determine colors based on status
  let statusColor = "text-emerald-400";
  let bgGlow = "shadow-[0_0_30px_rgba(52,211,153,0.15)]";
  let ringColor = "text-emerald-400";
  let Icon = ShieldCheck;

  if (status === "WARNING") {
    statusColor = "text-amber-400";
    bgGlow = "shadow-[0_0_30px_rgba(251,191,36,0.15)]";
    ringColor = "text-amber-400";
    Icon = AlertTriangle;
  } else if (status === "CRITICAL") {
    statusColor = "text-rose-400";
    bgGlow = "shadow-[0_0_30px_rgba(244,63,94,0.15)]";
    ringColor = "text-rose-400";
    Icon = AlertTriangle;
  }

  // Radial progress calc
  const circumference = 2 * Math.PI * 36; 
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/[0.08] bg-[#0c0e17]/80 p-5 backdrop-blur-xl ${bgGlow} transition-all`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-300">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">Financial Health</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.08] bg-black/40 text-[10px] font-bold tracking-wider ${statusColor}`}>
          <Icon className="w-3 h-3" />
          {status}
        </div>
      </div>

      <div className="flex items-center justify-center mb-6 relative">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" className="text-white/[0.05]" strokeWidth="8" stroke="currentColor" fill="none" />
            <motion.circle 
              cx="40" cy="40" r="36" 
              className={ringColor} 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="none" 
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white tracking-tighter">{score.toFixed(0)}</span>
            <span className="text-[10px] text-zinc-500 font-medium">/ 100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Burn Rate</p>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-white">
              ₹{healthData.metrics?.burn_rate?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}/mo
            </span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Runway</p>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">
              {healthData.metrics?.runway_days > 900 ? "Stable" : `${healthData.metrics?.runway_days || 0} days`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {healthData.factors?.map((factor: any, i: number) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${factor.impact > 0 ? "bg-emerald-400" : factor.impact < 0 ? "bg-rose-400" : "bg-zinc-400"}`} />
            <span className="text-zinc-400 leading-relaxed">{factor.description}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
