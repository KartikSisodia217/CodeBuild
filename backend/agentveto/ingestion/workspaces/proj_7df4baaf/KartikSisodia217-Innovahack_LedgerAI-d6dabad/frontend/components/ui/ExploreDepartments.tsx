import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Circle } from "lucide-react";

export interface DepartmentInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  specialists: string[];
}

const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "financial",
    name: "Financial Department",
    description: "Handles core accounting, double-entry bookkeeping, and executive financial insights.",
    color: "#60a5fa58",
    specialists: ["Financial Analyst", "Ledger Agent", "Accounts Receivable", "Accounts Payable"]
  },
  {
    id: "audit",
    name: "Audit Department",
    description: "Verifies mathematical calculations across transaction logs and checks internal controls.",
    color: "#f43f5d47",
    specialists: ["Audit Specialist", "Invoice Specialist"]
  },
  {
    id: "tax",
    name: "Tax Department",
    description: "Ensures compliance with local and international tax laws, including GST/VAT.",
    color: "#a78bfa4e",
    specialists: ["GST Specialist", "Tax Specialist"]
  },
  {
    id: "risk",
    name: "Risk & Compliance Department",
    description: "Identifies anomalies, flags duplicate payments, and screens for potential fraud.",
    color: "#38bff850",
    specialists: ["Risk Analyst", "Compliance Officer"]
  },
  {
    id: "legal",
    name: "Legal Department",
    description: "Reviews vendor contracts and legal notices for potential financial exposure.",
    color: "#fb923c49",
    specialists: ["Legal Advisor"]
  },
  {
    id: "executive",
    name: "Executive Advisory",
    description: "Synthesizes data into actionable board-level reports and financial projections.",
    color: "#24fb4f43",
    specialists: ["CFO Advisor", "General Advisor"]
  }
];

export default function ExploreDepartments({ onAsk }: { onAsk: (prompt: string) => void }) {

  return (


    <div className=" max-w-8xl mx-auto w-full flex-1 flex flex-col pt-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

      {/* Top Right Glow */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#FF9D9D]/50 blur-[180px]"
      />

      {/* Mid Left Glow */}
      <motion.div
        animate={{ x: [0, -15, 10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 h-[400px] w-[400px] rounded-full bg-[#B7D3EF]/25 blur-[180px]"
      />

      {/* Bottom Right Glow */}
      <motion.div
        animate={{ x: [0, 15, -10, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute bottom-10 right-0 h-[400px] w-[400px] rounded-full bg-[#C8B6FF]/40 blur-[180px]"
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Explore Departments</h1>
        <p className="text-sm text-zinc-400 mb-4">
          LedgerAI coordinates teams of specialized AI agents organized into traditional accounting firm departments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            className="group relative rounded-2xl border border-white/[0.0002] bg-white/[0.03] hover:bg-white/[0.05]  p-5 transition-all duration-300 hover:border-white/[0.15] shadow-sm flex flex-col h-full w-full"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
              >
                <Circle className="w-5 h-5" style={{ color: dept.color }} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-gray-300 transition-colors">
                  {dept.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-4 flex-1">
              {dept.description}
            </p>

            <div className="space-y-1.5 mb-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Specialists in this department</span>
              {dept.specialists.map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  {spec}
                </div>
              ))}
            </div>

            <button
              onClick={() => onAsk(`Consult the ${dept.name} regarding current records.`)}
              className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors cursor-pointer w-full text-left"
            >
              <span>Engage Department</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
