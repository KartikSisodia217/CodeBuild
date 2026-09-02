import React from 'react';
import { Shield, Plus, History, LayoutDashboard, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar({ currentView, setCurrentView, onOpenNewScan, activeRunId }) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0B0F17] px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Brand */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="text-sm font-bold tracking-wider text-white">Agent<span className="text-indigo-400">Veto</span></span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 text-slate-400 rounded border border-slate-700">GATE</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Continuous Adversarial Security</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center space-x-1 border-l border-slate-800 pl-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'dashboard'
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('details')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'details'
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Run Details</span>
            {activeRunId && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                {activeRunId}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'history'
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Run History</span>
          </button>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 border-r border-slate-800 pr-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>GATE ACTIVE</span>
        </div>

        <button
          onClick={onOpenNewScan}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Security Scan</span>
        </button>
      </div>

    </header>
  );
}
