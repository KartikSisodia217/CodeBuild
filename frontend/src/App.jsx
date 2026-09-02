import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Crosshair, 
  Clock, 
  FileCode2, 
  FileText, 
  Activity, 
  Zap, 
  Database,
  ArrowRight,
  ChevronRight,
  Plus,
  RefreshCw,
  Terminal
} from 'lucide-react';
import clsx from 'clsx';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NewScanModal from './components/NewScanModal';
import ScanProgress from './components/ScanProgress';
import RunOverview from './components/RunOverview';
import AttackAnalysis from './components/AttackAnalysis';
import ExecutionTrace from './components/ExecutionTrace';
import EvidenceView from './components/EvidenceView';
import RegressionView from './components/RegressionView';
import RunHistory from './components/RunHistory';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'details', 'history', 'progress'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attack', 'trace', 'evidence', 'regression'
  
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('zero_click_echoleak');
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // New Scan Modal state
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [currentScanConfig, setCurrentScanConfig] = useState(null);

  const [metrics, setMetrics] = useState({
    total_evaluations: 18,
    veto_count: 12,
    pass_count: 5,
    warn_count: 1,
    average_latency_ms: 0.85
  });

  useEffect(() => {
    fetchScenarios();
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (selectedScenarioId) {
      fetchScenarioDetails(selectedScenarioId);
    }
  }, [selectedScenarioId]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/api/scenarios');
      setScenarios(res.data);
      if (res.data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch scenarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/metrics');
      if (res.data) setMetrics(res.data);
    } catch (err) {
      console.warn("Metrics endpoint unreachable:", err);
    }
  };

  const fetchScenarioDetails = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/api/scenarios/${id}`);
      setScenarioData(res.data);
    } catch (err) {
      console.error("Failed to fetch scenario details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRun = (id) => {
    setSelectedScenarioId(id);
    setCurrentView('details');
    setActiveTab('overview');
  };

  const handleStartScan = (config) => {
    setIsNewScanOpen(false);
    setCurrentScanConfig(config);
    setCurrentView('progress');
  };

  const handleCompleteScan = () => {
    if (currentScanConfig?.scenario_id) {
      setSelectedScenarioId(currentScanConfig.scenario_id);
    }
    setCurrentView('details');
    setActiveTab('overview');
  };

  const handleReEvaluate = async () => {
    if (!selectedScenarioId) return;
    setEvaluating(true);
    try {
      await fetchScenarioDetails(selectedScenarioId);
      await fetchMetrics();
    } finally {
      setTimeout(() => setEvaluating(false), 300);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0F17] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewScan={() => setIsNewScanOpen(true)}
        activeRunId={scenarioData?.metadata?.run_number || '#AV-1042'}
      />

      {/* VIEW 1: DASHBOARD (SCREEN 1) */}
      {currentView === 'dashboard' && (
        <Dashboard
          runs={scenarios}
          metrics={metrics}
          onSelectRun={handleSelectRun}
          onOpenNewScan={() => setIsNewScanOpen(true)}
        />
      )}

      {/* VIEW 2: RUN HISTORY (SCREEN 11) */}
      {currentView === 'history' && (
        <RunHistory
          runs={scenarios}
          onSelectRun={handleSelectRun}
        />
      )}

      {/* VIEW 3: SCAN PROGRESS (SCREEN 3) */}
      {currentView === 'progress' && currentScanConfig && (
        <ScanProgress
          scanConfig={currentScanConfig}
          onComplete={handleCompleteScan}
        />
      )}

      {/* VIEW 4: RUN DETAILS WORKSPACE (SCREENS 4 - 10) */}
      {currentView === 'details' && (
        <div className="flex-1 flex flex-col min-w-0 bg-[#07090e] overflow-hidden">
          
          {/* Subheader with Target Agent, Verdict, and Primary Tabs */}
          <header className="h-16 border-b border-slate-800/80 bg-[#0B0F17] px-8 flex items-center justify-between shrink-0 z-20">
            
            {/* Target Agent & Run ID */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span 
                  onClick={() => setCurrentView('dashboard')}
                  className="hover:text-indigo-400 cursor-pointer"
                >
                  Runs
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-indigo-400 font-bold">
                  {scenarioData?.metadata?.run_number || '#AV-1042'}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {scenarioData?.metadata?.agent_name || 'Target Agent'}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  ({scenarioData?.metadata?.name || scenarioData?.scenario_id})
                </span>
              </div>
            </div>

            {/* Tabs: Overview, Attack, Trace, Evidence, Regression */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-[#121824] p-1 rounded-xl border border-slate-800 space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all",
                    activeTab === 'overview' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('attack')}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all",
                    activeTab === 'attack' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attack</span>
                </button>

                <button
                  onClick={() => setActiveTab('trace')}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all",
                    activeTab === 'trace' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trace</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all",
                    activeTab === 'evidence' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence</span>
                </button>

                <button
                  onClick={() => setActiveTab('regression')}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all",
                    activeTab === 'regression' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Regression</span>
                </button>
              </div>

              {/* Re-evaluate Button */}
              <button
                onClick={handleReEvaluate}
                disabled={evaluating}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5 text-indigo-400", evaluating && "animate-spin")} />
                <span>Re-Evaluate</span>
              </button>
            </div>

          </header>

          {/* Tab Workspace Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              
              {loading && !scenarioData ? (
                <div className="p-12 text-center text-slate-500 font-mono text-xs flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Loading adjudication data...</span>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <RunOverview 
                      data={scenarioData} 
                      onSwitchTab={(tab) => setActiveTab(tab)} 
                    />
                  )}

                  {activeTab === 'attack' && (
                    <AttackAnalysis 
                      attackData={scenarioData?.attack_analysis} 
                    />
                  )}

                  {activeTab === 'trace' && (
                    <ExecutionTrace 
                      trace={scenarioData?.trace} 
                      evaluation={scenarioData?.evaluation} 
                    />
                  )}

                  {activeTab === 'evidence' && (
                    <EvidenceView 
                      dag={scenarioData?.dag} 
                      evaluation={scenarioData?.evaluation} 
                      stateDiff={scenarioData?.state_diff} 
                    />
                  )}

                  {activeTab === 'regression' && (
                    <RegressionView 
                      data={scenarioData} 
                    />
                  )}
                </>
              )}

            </div>
          </main>

        </div>
      )}

      {/* SCREEN 2: NEW SCAN MODAL */}
      <NewScanModal
        isOpen={isNewScanOpen}
        onClose={() => setIsNewScanOpen(false)}
        onStartScan={handleStartScan}
      />

    </div>
  );
}
