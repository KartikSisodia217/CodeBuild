"use client";

import { motion } from "framer-motion";
import { Store, TrendingUp, PieChart, Repeat, ArrowUpRight } from "lucide-react";

interface MerchantInsightsProps {
  merchantData: any;
}

export default function MerchantInsights({ merchantData }: MerchantInsightsProps) {
  if (!merchantData || !merchantData.top_merchants) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0c0e17]/80 p-5 backdrop-blur-xl transition-all h-full"
    >
      <div className="flex items-center gap-2 text-zinc-300 mb-6">
        <Store className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold tracking-wide uppercase">Merchant Intelligence</h3>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Top Vendors by Spend
          </p>
          <div className="space-y-3">
            {merchantData.top_merchants.slice(0, 4).map((m: any, i: number) => {
              const maxSpend = merchantData.top_merchants[0].total_spend;
              const pct = Math.max(5, (m.total_spend / maxSpend) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 truncate max-w-[150px]" title={m.name}>{m.name}</span>
                    <span className="text-white font-mono flex items-center gap-1">
                      ₹{m.total_spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.04]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <PieChart className="w-3 h-3" /> Category Breakdown
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(merchantData.category_breakdown)
              .sort(([, a]: any, [, b]: any) => b - a)
              .slice(0, 5)
              .map(([cat, amount]: any, i: number) => (
              <div key={i} className="px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
                <span className="text-[10px] text-zinc-400">{cat || "Unknown"}</span>
                <span className="text-[10px] font-semibold text-white">₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
