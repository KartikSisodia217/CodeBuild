"use client";

import Link from "next/link";
import { useParallax } from "@/hooks/useParallax";

const AGENTS = [
  { name: "Classifier", dot: "bg-emerald-400", status: "Active" },
  { name: "Ledger Agent", dot: "bg-blue-400", status: "Working" },
  { name: "Report Agent", dot: "bg-violet-400", status: "Processing" },
  { name: "CFO Agent", dot: "bg-amber-400", status: "Standby" },
];


export default function Hero() {
  const bgGlowParallax = useParallax<HTMLDivElement>({ speed: 0.15 });
  const cardParallax = useParallax<HTMLDivElement>({ speed: -0.04 });

  return (
    <section className="relative min-h-screen text-zinc-300 flex flex-col items-center justify-center px-6 pt-32 pb-32 overflow-hidden antialiased">


      {/* H1 with linear layout typography upgrade */}
      <h1
        className="text-center text-5xl md:text-[72px] font-bold tracking-tight leading-[1.1] mb-6 mt-10 max-w-[850px] text-white"
        style={{ animation: "fade-up 0.55s ease both", animationDelay: "0.1s" }}
      >
        Your Finance Team.
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-600">
          Reimagined.
        </span>
      </h1>

      {/* Subtext */}
      <p
        className="text-center text-zinc-400 text-base md:text-lg leading-relaxed max-w-[500px] mb-10 font-normal"
        style={{ animation: "fade-up 0.55s ease both", animationDelay: "0.2s" }}
      >
        A multi-agent AI system that mirrors a real accounting firm.
        Upload your data and watch your AI department work.
      </p>

      {/* Primary CTA Upgrade */}
      <div
        className="flex items-center gap-4 mb-24"
        style={{ animation: "fade-up 0.55s ease both", animationDelay: "0.3s" }}
      >
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden"
        >
          Start for free
        </Link>
      </div>
    </section>
  );
}