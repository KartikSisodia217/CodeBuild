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
  const [scanError, setScanError] = useState(null);

  // New Scan Modal state
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [currentScanConfig, setCurrentScanConfig] = useState(null);

  const [metrics, setMetrics] = useState({
    total_evaluations: 0,
    veto_count: 0,
    pass_count: 0,
    warn_count: 0,
    average_latency_ms: 0.0
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

  const handleStartScan = async (config) => {
    setIsNewScanOpen(false);
    setCurrentScanConfig(config);
    setScanError(null);
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/scan', config);
      setCurrentScanConfig({ ...config, scanResult: res.data });
      setCurrentView('progress');
      await fetchMetrics();
    } catch (err) {
      setScanError(err.response?.data?.detail || 'The controlled scan could not be completed.');
      setCurrentView('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteScan = () => {
    if (currentScanConfig?.scanResult) {
      setScenarioData(currentScanConfig.scanResult);
    }
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
    <div className="flex flex-col h-screen w-full bg-av-bg text-av-textPrimary font-sans overflow-hidden select-none">
      
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

      {scanError && currentView === 'dashboard' && (
        <div className="fixed bottom-5 right-5 max-w-sm rounded-xl border border-red-500/40 bg-red-950/90 p-4 text-xs text-red-200 shadow-xl">
          {scanError}
        </div>
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
          scanResult={currentScanConfig.scanResult}
          onComplete={handleCompleteScan}
        />
      )}

      {/* VIEW 4: RUN DETAILS WORKSPACE (SCREENS 4 - 10) */}
      {currentView === 'details' && (
        <div className="flex-1 flex flex-col min-w-0 bg-av-bg overflow-hidden">
          
          {/* Subheader with Target Agent, Verdict, and Primary Tabs */}
          <header className="h-14 border-b border-av-border bg-av-surface px-8 flex items-center justify-between shrink-0 z-20">
            
            {/* Target Agent & Run ID */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-av-textSecondary">
                <span 
                  onClick={() => setCurrentView('dashboard')}
                  className="hover:text-av-textPrimary cursor-pointer font-medium transition-colors"
                >
                  Scans
                </span>
                <ChevronRight className="w-3 h-3 text-av-textMuted" />
                <span className="text-av-textPrimary font-semibold">
                  {scenarioData?.metadata?.run_number || '#AV-1042'}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-av-border" />
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-av-textPrimary tracking-tight">
                  {scenarioData?.metadata?.agent_name || 'Target Agent'}
                </h2>
                <span className="text-xs text-av-textMuted font-mono">
                  ({scenarioData?.metadata?.name || scenarioData?.scenario_id})
                </span>
              </div>
            </div>

            {/* Tabs: Overview, Attack, Trace, Evidence, Regression */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-av-bg p-1 rounded-md border border-av-border space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                    "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
                    activeTab === 'overview' ? "bg-av-surfaceElevated text-av-textPrimary shadow-sm border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('attack')}
                  className={clsx(
                    "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
                    activeTab === 'attack' ? "bg-av-surfaceElevated text-av-textPrimary shadow-sm border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Attack</span>
                </button>

                <button
                  onClick={() => setActiveTab('trace')}
                  className={clsx(
                    "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
                    activeTab === 'trace' ? "bg-av-surfaceElevated text-av-textPrimary shadow-sm border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={clsx(
                    "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
                    activeTab === 'evidence' ? "bg-av-surfaceElevated text-av-textPrimary shadow-sm border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence</span>
                </button>

                <button
                  onClick={() => setActiveTab('regression')}
                  className={clsx(
                    "px-3 py-1 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors",
                    activeTab === 'regression' ? "bg-av-surfaceElevated text-av-textPrimary shadow-sm border border-av-borderLight" : "text-av-textSecondary hover:text-av-textPrimary hover:bg-av-surfaceHover border border-transparent"
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
                className="btn-secondary py-1 text-xs space-x-1.5"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5", evaluating && "animate-spin")} />
                <span>Re-Evaluate</span>
              </button>
            </div>

          </header>

          {/* Tab Workspace Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              
              {loading && !scenarioData ? (
                <div className="p-12 text-center text-av-textMuted font-mono text-sm flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-av-textSecondary" />
                  <span>Loading scan data...</span>
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
                      attackData={scenarioData?.threat_model} 
                    />
                  )}

                  {activeTab === 'trace' && (
                    <ExecutionTrace 
                      trace={scenarioData?.trajectory} 
                      evaluation={scenarioData?.evaluation} 
                    />
                  )}

                  {activeTab === 'evidence' && (
                    <EvidenceView 
                      dag={scenarioData?.evidence} 
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
