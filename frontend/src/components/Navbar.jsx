import React from 'react';
import { Shield, Plus, History, LayoutDashboard, FileText, Home } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar({ currentView, setCurrentView, onOpenNewScan }) {
  return (
    <header className="h-14 border-b border-[#23252a] bg-[#08090a]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 select-none z-40 relative">
      
      {/* Brand on Left (Matching AUROS alignment) */}
      <div 
        onClick={() => setCurrentView('landing')}
        className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
      >
        <div className="w-6 h-6 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-white group-hover:border-[#70dcd3]/50 transition-colors">
          <Shield className="w-3.5 h-3.5 text-[#70dcd3]" />
        </div>
        <div className="flex items-center">
          <span className="text-[15px] font-sans font-medium tracking-[-0.015em] text-white">
            Agent<span className="text-[#70dcd3]">Veto</span>
          </span>
        </div>
      </div>

      {/* Centered Navigation Buttons (Matching AUROS reference alignment) */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => setCurrentView('landing')}
          className={clsx(
            "px-3 py-1.5 rounded-[6px] text-[13px] font-sans transition-colors cursor-pointer",
            currentView === 'landing'
              ? "bg-white/[0.08] text-white font-medium"
              : "text-[#8a8f98] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={clsx(
            "px-3 py-1.5 rounded-[6px] text-[13px] font-sans transition-colors cursor-pointer",
            currentView === 'dashboard'
              ? "bg-white/[0.08] text-white font-medium"
              : "text-[#8a8f98] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Console</span>
        </button>

        <button
          onClick={() => setCurrentView('details')}
          className={clsx(
            "px-3 py-1.5 rounded-[6px] text-[13px] font-sans transition-colors cursor-pointer",
            currentView === 'details'
              ? "bg-white/[0.08] text-white font-medium"
              : "text-[#8a8f98] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Run Details</span>
        </button>

        <button
          onClick={() => setCurrentView('history')}
          className={clsx(
            "px-3 py-1.5 rounded-[6px] text-[13px] font-sans transition-colors cursor-pointer",
            currentView === 'history'
              ? "bg-white/[0.08] text-white font-medium"
              : "text-[#8a8f98] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>History</span>
        </button>
      </nav>

      {/* Right Action: Clean CTA Button (GATE ACTIVE badge removed) */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onOpenNewScan}
          className="px-4 py-1.5 bg-white hover:bg-[#e5e5e6] text-[#08090a] text-[13px] font-medium tracking-[-0.011em] rounded-full flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Security Scan</span>
          <span className="sm:hidden">New Scan</span>
        </button>
      </div>

    </header>
  );
}
