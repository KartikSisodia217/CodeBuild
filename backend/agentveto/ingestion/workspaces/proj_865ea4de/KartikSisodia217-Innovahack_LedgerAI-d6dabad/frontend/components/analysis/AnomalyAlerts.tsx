"use client";

import { motion } from "framer-motion";
import { AlertOctagon, ShieldAlert, AlertCircle, Info } from "lucide-react";

interface AnomalyAlertsProps {
  suspiciousTransactions: any[];
}

export default function AnomalyAlerts({ suspiciousTransactions }: AnomalyAlertsProps) {
  if (!suspiciousTransactions || suspiciousTransactions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c0e17]/80 p-5 backdrop-blur-xl h-full"
    >
      <div className="flex items-center gap-2 text-zinc-300 mb-6">
        <ShieldAlert className="w-5 h-5 text-rose-400" />
        <h3 className="text-sm font-semibold tracking-wide uppercase">Anomaly Alerts</h3>
        <span className="ml-auto bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
          {suspiciousTransactions.length} Flags
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {suspiciousTransactions.map((alert: any, i: number) => {
          let Icon = Info;
          let colorClass = "text-zinc-400";
          let bgClass = "bg-zinc-500/10 border-zinc-500/20";
          
          if (alert.severity === "HIGH") {
            Icon = AlertOctagon;
            colorClass = "text-rose-400";
            bgClass = "bg-rose-500/10 border-rose-500/30";
          } else if (alert.severity === "MEDIUM") {
            Icon = AlertCircle;
            colorClass = "text-amber-400";
            bgClass = "bg-amber-500/10 border-amber-500/30";
          }

          return (
            <div key={i} className={`p-3 rounded-xl border ${bgClass} transition-colors`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                <div className="flex-1 space-y-1">
                  <p className={`text-[11px] font-medium leading-relaxed ${colorClass}`}>
                    {alert.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded">
                      {alert.transaction?.date}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                      {alert.transaction?.description}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-white ml-auto">
                      ₹{alert.transaction?.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
