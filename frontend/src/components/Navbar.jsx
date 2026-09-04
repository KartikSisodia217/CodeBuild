import React from 'react';
import { Shield, Plus, History, LayoutDashboard, FileText, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar({ currentView, setCurrentView, onOpenNewScan, activeRunId }) {
  return (
    <header className="h-12 border-b border-av-border bg-av-surface px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Brand */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <Shield className="w-5 h-5 text-av-textPrimary transition-colors" />
          <span className="text-sm font-semibold tracking-tight text-av-textPrimary">
            AgentVeto
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center space-x-1 border-l border-av-border pl-6 h-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'dashboard'
                ? "bg-av-surfaceElevated text-av-textPrimary"
                : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover"
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('details')}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'details'
                ? "bg-av-surfaceElevated text-av-textPrimary"
                : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scan Details</span>
            {activeRunId && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-av-border text-av-textSecondary font-mono font-medium">
                {activeRunId}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors",
              currentView === 'history'
                ? "bg-av-surfaceElevated text-av-textPrimary"
                : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Scans</span>
          </button>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-[11px] font-medium text-av-textSecondary">
          <Activity className="w-3.5 h-3.5 text-av-textMuted" />
          <span>System Active</span>
        </div>

      {/* Right Action: Clean CTA Button (GATE ACTIVE badge removed) */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onOpenNewScan}
          className="btn-primary space-x-1.5 h-7 text-xs px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </button>
      </div>
      </div>
    </header>
  );
}
