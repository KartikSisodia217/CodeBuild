"use client";

import { useEffect, useRef, useState } from "react";
import { useParallax } from "@/hooks/useParallax";

const MESSAGES = [
  { agent: "Classifier", color: "#34d399", text: "Ingesting bank statement… 1,204 rows parsed." },
  { agent: "Ledger Agent", color: "#60a5fa", text: "Opening entries created. Chart of accounts updated." },
  { agent: "Classifier", color: "#34d399", text: "Categorized: 89% auto, 11% flagged for review." },
  { agent: "CFO Agent", color: "#fbbf24", text: "What's our burn rate this quarter?" },
  { agent: "Report Agent", color: "#a78bfa", text: "Monthly burn: $142k. Down 8% from last month." },
  { agent: "CFO Agent", color: "#fbbf24", text: "Runway extended to 21 months at current rate." },
];

const PAUSE_TICKS = 3; // extra ticks after all messages before resetting

export default function GlassBox() {
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parallax hooks for background orb depth and card floating
  const bgOrbParallax = useParallax<HTMLDivElement>({ speed: 0.16 });
  const cardParallax = useParallax<HTMLDivElement>({ speed: -0.05 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          intervalRef.current = setInterval(() => {
            setVisibleCount((c) => {
              if (c >= MESSAGES.length + PAUSE_TICKS) return 0;
              return c + 1;
            });
          }, 1100);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const shownMessages = MESSAGES.slice(0, Math.min(visibleCount, MESSAGES.length));
  const showTyping = visibleCount > 0 && visibleCount < MESSAGES.length;

  return (
    <section id="glass-box" className="relative py-32 px-6 overflow-hidden" ref={sectionRef}>


      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-4">
              The Glass Box
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight mb-6">
              Watch your AI department{" "}
              <span className="text-zinc-500">work in real time.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              No black box. No mystery. Every decision your AI Finance
              Department makes is visible, explained, and auditable.
            </p>
            <ul className="space-y-4">
              {[
                "Full transparency — see every agent's reasoning",
                "Real-time collaboration between specialized agents",
                "Complete audit trail for every financial decision",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-zinc-400">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: animated panel with parallax float ── */}
          <div
            ref={cardParallax.ref}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm overflow-hidden transition-shadow duration-300"
            style={{
              ...cardParallax.style,
              boxShadow:
                "0 0 60px rgba(16,185,129,0.04), 0 24px 48px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-zinc-300">
                  Glass Box
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/25 bg-emerald-500/10">
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-zinc-600">
                Real-time agent collaboration
              </span>
            </div>

            {/* Message feed */}
            <div className="p-5 min-h-[300px] space-y-4 flex flex-col">
              {shownMessages.map((msg, i) => (
                <div
                  key={`${i}-${visibleCount <= MESSAGES.length ? "a" : "b"}`}
                  className="flex gap-3"
                  style={{ animation: "fade-up 0.4s ease both" }}
                >
                  <div
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: msg.color }}
                  />
                  <div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: msg.color }}
                    >
                      {msg.agent}
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {showTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-600"
                        style={{
                          animation:
                            "typing-bounce 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state hint */}
              {visibleCount === 0 && (
                <p className="text-xs text-zinc-700 mt-auto">
                  Scroll into view to watch agents collaborate…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
