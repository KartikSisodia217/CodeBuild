"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Calculator,
  FileText,
  ShieldAlert,
  Scale,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Agent {
  icon: LucideIcon;
  name: string;
  description: string;
  iconColor: string;
  borderClass: string;
  bgClass: string;
}

const AGENTS: Agent[] = [
  {
    icon: Briefcase,
    name: "Executive Office",
    description:
      "Strategic planning, executive decision support, business insights, and final response synthesis.",
    iconColor: "text-blue-400",
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/10",
  },
  {
    icon: Calculator,
    name: "Accounting & Finance",
    description:
      "Financial statements, bookkeeping, cash flow, profitability analysis, budgeting, and reporting.",
    iconColor: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
  },
  {
    icon: FileText,
    name: "Tax & Compliance",
    description:
      "Tax planning, regulatory compliance, payroll tax, sales tax, audit readiness, and filing guidance.",
    iconColor: "text-amber-400",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/10",
  },
  {
    icon: ShieldAlert,
    name: "Risk & Audit",
    description:
      "Internal controls, fraud detection, operational risk, audit analysis, and governance.",
    iconColor: "text-red-400",
    borderClass: "border-red-500/30",
    bgClass: "bg-red-500/10",
  },
  {
    icon: Scale,
    name: "Legal & Corporate",
    description:
      "Business regulations, contracts, corporate governance, employment considerations, and legal risk.",
    iconColor: "text-purple-400",
    borderClass: "border-purple-500/30",
    bgClass: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    name: "Operations & Advisory",
    description:
      "Business strategy, process optimization, operational efficiency, growth planning, and financial recommendations.",
    iconColor: "text-violet-400",
    borderClass: "border-violet-500/30",
    bgClass: "bg-violet-500/10",
  },
];

export default function AgentGrid() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => {
    setActive((prev) => (prev + 1) % AGENTS.length);
  };

  const prev = () => {
    setActive((prev) => (prev - 1 + AGENTS.length) % AGENTS.length);
  };

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      next();
    }, 4500);

    return () => clearInterval(timer);
  }, [active, paused]);

  const agent = AGENTS[active];
  const Icon = agent.icon;

  return (
    <section id="features" className="py-32 px-6">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-4">
          THE TEAM
        </p>

        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-5">
          Meet your AI specialists
        </h2>

        <p className="text-zinc-500 max-w-xl mx-auto">
          16 specialists across 6 autonomous departments.
        </p>
      </div>

      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left Arrow */}

        <button
          onClick={prev}
          className="absolute left-0 z-20 h-12 w-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-white/10 hover:scale-110 transition-all duration-300"
        >
          <ChevronLeft className="mx-auto h-5 w-5 text-white" />
        </button>

        {/* Main Card */}

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{
              opacity: 0,
              x: 80,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: -80,
              scale: 0.95,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className={`w-full max-w-2xl rounded-3xl border ${agent.borderClass}
      bg-white/[0.03]
      p-10
      shadow-[0_20px_80px_rgba(0,0,0,0.45)]`}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${agent.bgClass}
        flex items-center justify-center mb-8`}
            >
              <Icon
                className={`w-7 h-7 ${agent.iconColor}`}
                strokeWidth={1.6}
              />
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">
              {agent.name}
            </h3>

            <p className="text-zinc-400 text-lg leading-8">
              {agent.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Right Arrow */}

        <button
          onClick={next}
          className="absolute right-0 z-20 h-12 w-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-white/10 hover:scale-110 transition-all duration-300"
        >
          <ChevronRight className="mx-auto h-5 w-5 text-white" />
        </button>
      </div>

      {/* Dots */}

      <div className="mt-10 flex justify-center gap-3">
        {AGENTS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`rounded-full transition-all duration-300 ${active === index
              ? "w-10 h-2 bg-white"
              : "w-2 h-2 bg-zinc-600 hover:bg-zinc-400"
              }`}
          />
        ))}
      </div>
    </section>
  );
}