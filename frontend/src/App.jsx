import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight,
  RefreshCw,
  FileText,
  Crosshair,
  Clock,
  Layers,
  FileCode2
} from 'lucide-react';
import clsx from 'clsx';

import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import NewScanModal from './components/NewScanModal';
import ScanProgress from './components/ScanProgress';
import RunOverview from './components/RunOverview';
import AttackAnalysis from './components/AttackAnalysis';
import ExecutionTrace from './components/ExecutionTrace';
import EvidenceView from './components/EvidenceView';
import RegressionView from './components/RegressionView';
import RunHistory from './components/RunHistory';
import { API_BASE_URL } from './config';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'details', 'history', 'progress'
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
      const res = await axios.get(`${API_BASE_URL}/api/scenarios`);
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
      const res = await axios.get(`${API_BASE_URL}/api/metrics`);
      if (res.data) setMetrics(res.data);
    } catch (err) {
      console.warn("Metrics endpoint unreachable:", err);
    }
  };

  const fetchScenarioDetails = async (id) => {
    try {
      setLoading(true);
      const url = id.startsWith('run_') 
        ? `${API_BASE_URL}/api/scan/${id}`
        : `${API_BASE_URL}/api/scenarios/${id}`;
      const res = await axios.get(url);
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
    setCurrentScanConfig(config);
    setScanError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/scan`, config);
      setCurrentScanConfig({ ...config, scanResult: res.data });
      setIsNewScanOpen(false);
      setCurrentView('progress');
      await fetchMetrics();
    } catch (err) {
      setScanError(err.response?.data?.detail || 'The controlled scan could not be completed.');
      setIsNewScanOpen(false);
      setCurrentView('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteScan = () => {
    if (currentScanConfig?.scanResult) {
      setScenarioData(currentScanConfig.scanResult);
      if (currentScanConfig.scanResult.run_id) {
        setSelectedScenarioId(currentScanConfig.scanResult.run_id);
      }
    }
    if (currentScanConfig?.scenario_id && !currentScanConfig?.scanResult?.run_id) {
      setSelectedScenarioId(currentScanConfig.scenario_id);
    }
    setCurrentView('details');
    setActiveTab('overview');
  };

  const handleReEvaluate = async () => {
    if (!selectedScenarioId) return;
    setEvaluating(true);
    try {
      if (selectedScenarioId.startsWith('run_')) {
        const res = await axios.post(`${API_BASE_URL}/api/scan/${selectedScenarioId}/re-evaluate`);
        setScenarioData(res.data);
      } else {
        await fetchScenarioDetails(selectedScenarioId);
      }
      await fetchMetrics();
    } catch (err) {
      console.error("Failed to re-evaluate:", err);
    } finally {
      setTimeout(() => setEvaluating(false), 300);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#070707] text-[#ffffff] font-sans overflow-hidden select-none">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewScan={() => setIsNewScanOpen(true)}
        activeRunId={selectedScenarioId}
      />

      {/* VIEW 0: LANDING PAGE (INTUITIVE, HUMAN EXPLANATION) */}
      {currentView === 'landing' && (
        <LandingPage
          onOpenConsole={() => setCurrentView('dashboard')}
          onOpenNewScan={() => setIsNewScanOpen(true)}
        />
      )}

      {/* VIEW 1: DASHBOARD CONSOLE (CLEAN, MINIMAL, NO DUPLICATE BUTTONS) */}
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
        <div className="flex-1 flex flex-col min-w-0 bg-[#070707] overflow-hidden">
          
          {/* Subheader with Target Agent, Verdict, and Primary Tabs */}
          <header className="h-14 border-b border-[#22222a] bg-[#0d0e12] px-8 flex items-center justify-between shrink-0 z-20">
            
            {/* Target Agent & Run Details Breadcrumb */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#a2a4a9]">
                <span 
                  onClick={() => setCurrentView('dashboard')}
                  className="hover:text-white cursor-pointer font-medium transition-colors"
                >
                  Scans
                </span>
                <ChevronRight className="w-3 h-3 text-[#60606c]" />
                <span className="text-white font-medium">
                  {scenarioData?.metadata?.run_number || '#AV-1042'}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-[#22222a]" />
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-medium text-white tracking-tight">
                  {scenarioData?.metadata?.agent_name || 'Target Agent'}
                </h2>
                <span className="text-xs text-[#aeaeb7] font-mono">
                  ({scenarioData?.metadata?.name || scenarioData?.scenario_id})
                </span>
              </div>
            </div>

            {/* Tabs: Overview, Attack, Trace, Evidence, Regression (Hardware Pill Style) */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-[#0d0e12] p-1 rounded-full border border-[#22222a] space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                    "px-4 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
                    activeTab === 'overview' 
                      ? "bg-white text-[#070707] shadow-sm" 
                      : "text-[#a2a4a9] hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('attack')}
                  className={clsx(
                    "px-4 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
                    activeTab === 'attack' 
                      ? "bg-white text-[#070707] shadow-sm" 
                      : "text-[#a2a4a9] hover:text-white"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Attack</span>
                </button>

                <button
                  onClick={() => setActiveTab('trace')}
                  className={clsx(
                    "px-4 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
                    activeTab === 'trace' 
                      ? "bg-white text-[#070707] shadow-sm" 
                      : "text-[#a2a4a9] hover:text-white"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trace</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={clsx(
                    "px-4 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
                    activeTab === 'evidence' 
                      ? "bg-white text-[#070707] shadow-sm" 
                      : "text-[#a2a4a9] hover:text-white"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence</span>
                </button>

                <button
                  onClick={() => setActiveTab('regression')}
                  className={clsx(
                    "px-4 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all cursor-pointer",
                    activeTab === 'regression' 
                      ? "bg-white text-[#070707] shadow-sm" 
                      : "text-[#a2a4a9] hover:text-white"
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
                className="btn-harness-ghost px-4 py-1.5 text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5 text-[#70dcd3]", evaluating && "animate-spin")} />
                <span>Re-Evaluate</span>
              </button>
            </div>

          </header>

          {/* Tab Workspace Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              
              {loading && !scenarioData ? (
                <div className="p-12 text-center text-slate-500 font-mono text-xs flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
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
                      attackData={scenarioData?.threat_model || scenarioData?.attack_analysis} 
                    />
                  )}

                  {activeTab === 'trace' && (
                    <ExecutionTrace 
                      trace={scenarioData?.trajectory || scenarioData?.trace} 
                      evaluation={scenarioData?.evaluation} 
                    />
                  )}

                  {activeTab === 'evidence' && (
                    <EvidenceView 
                      dag={scenarioData?.evidence || scenarioData?.dag} 
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
        isLoading={loading}
        onClose={() => setIsNewScanOpen(false)}
        onStartScan={handleStartScan}
      />

    </div>
  );
}
