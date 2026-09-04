import React, { useState } from 'react';
import { 
  Shield, 
  ArrowRight, 
  ShieldAlert, 
  Play, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Bug, 
  Sparkles,
  Terminal,
  Activity,
  ArrowUpRight,
  Cpu,
  FileCheck,
  Eye
} from 'lucide-react';

export default function LandingPage({ onOpenConsole, onOpenNewScan }) {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (e) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // Minimal smooth scroll-driven animation calculations for the hero
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 320));
  const heroOpacity = Math.max(0, 1 - scrollProgress * 1.25);
  const heroTranslateY = -(scrollY * 0.32);
  const heroScale = 1 - scrollProgress * 0.04;
  const heroBlur = scrollProgress * 2.5;

  // Distinct smooth scroll animations for 3 below-the-fold sections
  const s1Progress = Math.min(1, Math.max(0, (scrollY - 100) / 240));
  const s1Style = {
    opacity: 0.15 + s1Progress * 0.85,
    transform: `translate3d(0, ${(1 - s1Progress) * 32}px, 0)`,
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform'
  };

  const s2Progress = Math.min(1, Math.max(0, (scrollY - 440) / 240));
  const s2Style = {
    opacity: 0.15 + s2Progress * 0.85,
    transform: `translate3d(0, ${(1 - s2Progress) * 32}px, 0)`,
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform'
  };

  const s3Progress = Math.min(1, Math.max(0, (scrollY - 780) / 240));
  const s3Style = {
    opacity: 0.15 + s3Progress * 0.85,
    transform: `translate3d(0, ${(1 - s3Progress) * 32}px, 0)`,
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform'
  };

  return (
    <div 
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-[#070707] text-[#ffffff] font-sans selection:bg-[#70dcd3] selection:text-[#070707] relative scroll-smooth"
    >
      
      {/* Background Atmosphere: Subtle nocturnal gradient glow */}
      <div className="relative isolate max-w-7xl mx-auto">
        
        {/* Subtle Phosphor Mint Top Radiance */}
        <div className="absolute inset-x-0 -top-36 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none" aria-hidden="true">
          <div className="relative left-1/2 aspect-[1155/580] w-[60rem] -translate-x-1/2 bg-gradient-to-b from-[#70dcd3]/15 via-[#0092e4]/10 to-transparent opacity-60" />
        </div>

        {/* HERO SECTION: Fills initial viewport so user ONLY sees headline & buttons upon entry */}
        <section className="min-h-[calc(100vh-56px)] flex flex-col justify-center items-center text-center relative px-6 py-12">
          
          <div 
            style={{
              opacity: heroOpacity,
              transform: `translate3d(0, ${heroTranslateY}px, 0) scale(${heroScale})`,
              filter: heroBlur > 0.2 ? `blur(${heroBlur}px)` : 'none',
              willChange: 'transform, opacity, filter'
            }}
            className="text-center max-w-6xl mx-auto space-y-8"
          >
            
            {/* Eyebrow Label Pill (Clean typographic chip: no dot, no emoji, Ash text with wide tracking) */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9f9fa0]">
                DETERMINISTIC SECURITY GATE FOR AI AGENTS
              </span>
            </div>

            {/* Headline Hierarchy: Primary title with subordinate tagline (bolder & larger) */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] 2xl:text-[74px] font-display font-medium tracking-[0.01em] text-white leading-[1.08]">
                <span className="block sm:whitespace-nowrap">Security testing for AI agents</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[44px] 2xl:text-[46px] font-display font-medium tracking-[0.015em] text-[#70dcd3] leading-snug">
                <span className="block sm:whitespace-nowrap">before they reach production.</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#c8cad0] leading-relaxed max-w-2xl mx-auto font-normal font-sans">
              AgentVeto continuously simulates adversarial attacks against autonomous tools. If an untrusted prompt coercively hijacks your agent, the build is vetoed in under 1 millisecond.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={onOpenConsole}
                className="px-8 py-3.5 btn-harness-white text-sm flex items-center space-x-2 cursor-pointer shadow-lg"
              >
                <span>Open Security Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenNewScan}
                className="px-8 py-3.5 btn-harness-ghost text-sm flex items-center space-x-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#70dcd3] fill-[#70dcd3]" />
                <span>Run Sample Scan</span>
              </button>
            </div>

          </div>

        </section>

        {/* BELOW THE FOLD CONTENT: Dedicated Threat Matrix & Architecture Sections */}
        <div className="px-6 lg:px-8 space-y-32 pb-32 max-w-6xl mx-auto">
          
          {/* ======================================================== */}
          {/* SECTION 1: DEDICATED THREAT DEFENSE MATRIX              */}
          {/* ======================================================== */}
          <section style={s1Style} className="pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* Left Column: Editorial Anchor (Left-aligned, Authoritative) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04]">
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9f9fa0]">
                    THREAT DEFENSE MATRIX
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-medium text-white tracking-[0.01em] leading-[1.12]">
                    Simulate every attack path before code ships.
                  </h2>
                  <p className="text-base text-[#9f9fa0] font-sans leading-relaxed">
                    AgentVeto acts as an immutable pre-production gate, subjecting autonomous agents to adversarial stress tests across four critical vulnerability classes.
                  </p>
                </div>

                {/* Telemetry Spec Panel */}
                <div className="p-5 rounded-2xl bg-[#0b0c0e] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                    <span className="text-[#9f9fa0] font-mono text-[11px] uppercase tracking-wider">Evaluation Mode</span>
                    <span className="text-[#ffffff] font-mono text-[11px]">Deterministic Invariants</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                    <span className="text-[#9f9fa0] font-mono text-[11px] uppercase tracking-wider">Gate Latency</span>
                    <span className="text-[#70dcd3] font-mono text-[11px] font-medium">&lt; 0.8ms Veto Window</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9f9fa0] font-mono text-[11px] uppercase tracking-wider">False Positive Rate</span>
                    <span className="text-[#ffffff] font-mono text-[11px]">0.00% Zero-Hallucination</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 4 Curated Threat Defense Cards (2x2 Grid) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                
                {/* Threat 1 */}
                <div className="carbon-card p-6 sm:p-7 space-y-4 hover:border-[#70dcd3]/30 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0] group-hover:text-white transition-colors">
                      Prompt Injection
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Context Hijacking
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9f9fa0] font-sans leading-relaxed">
                      Neutralizes coercive system prompt overrides concealed within retrieved documents, user chats, or third-party web content.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#70dcd3] font-medium">Vetoed at Ingress</span>
                    <span className="text-[11px] font-mono text-[#9f9fa0]">0.4ms</span>
                  </div>
                </div>

                {/* Threat 2 */}
                <div className="carbon-card p-6 sm:p-7 space-y-4 hover:border-[#70dcd3]/30 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0] group-hover:text-white transition-colors">
                      Tool Hijacking
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Autonomous Mutation
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9f9fa0] font-sans leading-relaxed">
                      Intercepts unauthorized function calls, database write attempts, and spoofed parameter payloads before execution.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#70dcd3] font-medium">Schema Enforced</span>
                    <span className="text-[11px] font-mono text-[#9f9fa0]">0.6ms</span>
                  </div>
                </div>

                {/* Threat 3 */}
                <div className="carbon-card p-6 sm:p-7 space-y-4 hover:border-[#70dcd3]/30 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0] group-hover:text-white transition-colors">
                      Privilege Escalation
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Goal & Scope Drift
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9f9fa0] font-sans leading-relaxed">
                      Prevents autonomous agents from exceeding assigned permission boundaries, calling administrative routes, or deviating from verified task scopes.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#70dcd3] font-medium">Scope Strictly Bounded</span>
                    <span className="text-[11px] font-mono text-[#9f9fa0]">0.5ms</span>
                  </div>
                </div>

                {/* Threat 4 */}
                <div className="carbon-card p-6 sm:p-7 space-y-4 hover:border-[#70dcd3]/30 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0] group-hover:text-white transition-colors">
                      Data Exfiltration
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Memory & Secret Leaks
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9f9fa0] font-sans leading-relaxed">
                      Scans outbound payloads and agent state to catch leaked API tokens, customer credentials, and database contents.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#70dcd3] font-medium">Egress Intercepted</span>
                    <span className="text-[11px] font-mono text-[#9f9fa0]">0.7ms</span>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 2: DETERMINISTIC POLICY GATE & TOOL SANDBOX     */}
          {/* ======================================================== */}
          <section style={s2Style} className="space-y-10">
            <div className="space-y-3">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9f9fa0]">
                  DETERMINISTIC GATE
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-medium text-white tracking-[0.01em] leading-tight">
                Evaluated in under 1 millisecond.
              </h2>
              <p className="text-base text-[#9f9fa0] font-sans max-w-2xl">
                Deterministic boolean verification replaces slow, unpredictable LLM judges with mathematical invariants.
              </p>
            </div>

            {/* 2 Clean Focused Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Speed & Exactness */}
              <div className="carbon-card p-8 space-y-6 hover:border-white/20 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-5xl font-display font-light text-white">&lt; 0.8ms</div>
                  <div className="text-sm font-medium text-[#f5f5f7]">Sub-millisecond gate execution</div>
                  <p className="text-xs text-[#9f9fa0] font-sans">
                    Zero hallucinations. Identical reproducible verdicts on every test run.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b0c0e] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                    <span className="text-[#9f9fa0]">LLM-as-a-Judge</span>
                    <span className="font-mono text-[#9f9fa0] text-[11px]">~3,200ms • Flaky</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-white font-medium">AgentVeto Gate</span>
                    <span className="font-mono text-[#70dcd3] text-[11px] font-medium">&lt; 0.8ms • 100% Deterministic</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Safe Sandbox */}
              <div className="carbon-card p-8 space-y-6 hover:border-white/20 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-5xl font-display font-light text-white">0 Risk</div>
                  <div className="text-sm font-medium text-[#f5f5f7]">Safe tool sandboxing</div>
                  <p className="text-xs text-[#9f9fa0] font-sans">
                    Intercept database mutations, API calls, and payments without touching live systems.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b0c0e] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#f5f5f7]">Database Writes</span>
                    <span className="font-mono text-[11px] text-[#9f9fa0]">Read-Only Sandbox</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#f5f5f7]">Payment Execution</span>
                    <span className="font-mono text-[11px] text-[#70dcd3]">Safely Intercepted</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#f5f5f7]">External APIs</span>
                    <span className="font-mono text-[11px] text-[#9f9fa0]">Simulated Dispatch</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 3: PERMANENT CI/CD SHIELD & METRICS + CTA       */}
          {/* ======================================================== */}
          <section style={s3Style} className="space-y-12">
            <div className="space-y-3">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9f9fa0]">
                  CONTINUOUS PROTECTION
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-medium text-white tracking-[0.01em] leading-tight">
                Zero regressions. Every commit.
              </h2>
              <p className="text-base text-[#9f9fa0] font-sans max-w-2xl">
                Every caught exploit compiles into an immutable CI/CD regression test.
              </p>
            </div>

            {/* 3 Stat Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="carbon-card p-6 text-center space-y-1.5 hover:border-white/20 transition-colors">
                <div className="text-4xl font-display font-light text-white">&lt; 1ms</div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0]">Gate Latency</div>
              </div>

              <div className="carbon-card p-6 text-center space-y-1.5 hover:border-white/20 transition-colors">
                <div className="text-4xl font-display font-light text-white">0%</div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0]">Hallucinations</div>
              </div>

              <div className="carbon-card p-6 text-center space-y-1.5 hover:border-white/20 transition-colors">
                <div className="text-4xl font-display font-light text-white">100%</div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#9f9fa0]">CI/CD Determinism</div>
              </div>
            </div>

            {/* Closing CTA */}
            <div className="carbon-card p-8 sm:p-10 text-center space-y-5 hover:border-white/20 transition-all duration-300">
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-display font-medium text-white tracking-wide">
                  Start testing your agents.
                </h3>
                <p className="text-sm text-[#9f9fa0] font-sans">
                  Open the Security Console or launch a sample scan to inspect live telemetry.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
                <button
                  onClick={onOpenConsole}
                  className="px-8 py-3.5 btn-harness-white text-sm flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  <span>Open Security Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenNewScan}
                  className="px-8 py-3.5 btn-harness-ghost text-sm flex items-center space-x-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#70dcd3] fill-[#70dcd3]" />
                  <span>Run Sample Scan</span>
                </button>
              </div>
            </div>

          </section>

        </div>

      </div>

    </div>
  );
}
