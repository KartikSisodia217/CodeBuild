"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import AgentGrid from "@/components/landing/AgentGrid";
import GlassBox from "@/components/landing/GlassBox";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";
import IntroAnimation from "@/components/landing/IntroAnimation";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <IntroAnimation onFinish={() => setShowIntro(false)} />
      )}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-[#050507] relative-z-10"
      >
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="orb orb4" />
        <div className="orb orb5" />
        <div className="orb orb6" />
        <div className="orb orb7" />
        <div className="orb orb8" />
        <div className="orb orb9" />
        <div className="orb orb10" />

        {/* Top Right Lilac Glow */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute -top-52 -right-52 h-[700px] w-[700px] rounded-full bg-[#C8B6FF]/12 blur-[220px]"
        />

        {/* Bottom Left Cyan Glow */}
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute -bottom-52 -left-52 h-[600px] w-[600px] rounded-full bg-cyan-400/8 blur-[220px]"
        />

        {/* Soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55))]" />

        {/* Page Content */}
        <div className="relative z-10">
          <Navbar />
          <Hero />
          <AgentGrid />
          <GlassBox />
          <HowItWorks />
          <CTABanner />
          <Footer />
        </div>
      </motion.main>
    </>
  );
}