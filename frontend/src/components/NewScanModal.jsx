import React, { useState } from 'react';
import { X, Play, Shield, Server, Crosshair, AlertCircle } from 'lucide-react';

export default function NewScanModal({ isOpen, onClose, onStartScan }) {
  const [selectedAgent, setSelectedAgent] = useState('Customer Support Agent');
  const [selectedProfile, setSelectedProfile] = useState('Adaptive Adversarial Testing');
  const [selectedEnv, setSelectedEnv] = useState('Synthetic Sandbox');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Map agent selection to supported backend scenario
    let scenarioId = 'zero_click_echoleak';
    if (selectedAgent === 'Research Agent') {
      scenarioId = 'data_exfiltration';
    } else if (selectedAgent === 'Database Ops Agent') {
      scenarioId = 'cascading_failure';
    } else if (selectedAgent === 'Compliant Support Assistant') {
      scenarioId = 'benign_support_flow';
    }

    onStartScan({
      agent_name: selectedAgent,
      attack_profile: selectedProfile,
      environment: selectedEnv,
      scenario_id: scenarioId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#121824] border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Start Security Scan
              </h2>
              <p className="text-xs text-slate-400">Configure continuous adversarial evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Target Agent Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
              <span>TARGET AGENT</span>
              <span className="text-[10px] text-indigo-400">Adapter Connected</span>
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Customer Support Agent">Customer Support Agent (Tools: read_tickets, execute_refund)</option>
              <option value="Research Agent">Research Agent (Tools: fetch_url, post_external_webhook)</option>
              <option value="Database Ops Agent">Database Ops Agent (Tools: query_database, exec_shell)</option>
              <option value="Compliant Support Assistant">Compliant Support Assistant (Benign Baseline)</option>
            </select>
          </div>

          {/* Attack Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 font-mono">
              ATTACK PROFILE
            </label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Adaptive Adversarial Testing">Adaptive Adversarial Testing (ASI01 / MCP10)</option>
              <option value="State Invariant Fuzzing">State Mutation Fuzzing (Pre/Post DB diff)</option>
              <option value="Cascading Loop Testing">Cascading Loop & Retry Storm Testing (ASI08)</option>
            </select>
          </div>

          {/* Environment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 font-mono">
              ENVIRONMENT
            </label>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Synthetic Sandbox">Synthetic Sandbox (FastAPI + Isolated State DB)</option>
              <option value="Ephemeral Isolated Container">Ephemeral Isolated Container (Mocked Sinks)</option>
            </select>
          </div>

          {/* Notice */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              AgentVeto will autonomously discover tool schemas, generate threat models, execute adaptive indirect prompt injections, and deterministically adjudicate before state mutation.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>START SCAN</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
