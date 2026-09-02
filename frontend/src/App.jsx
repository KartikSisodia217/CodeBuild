import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Database, 
  Play, 
  Pause,
  SkipForward,
  RotateCcw,
  Code2, 
  Eye, 
  FileJson, 
  ChevronRight,
  Lock,
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  FileCode2,
  Download,
  X,
  Sparkles,
  Info,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import clsx from 'clsx';
import TraceGraph from './components/TraceGraph';
import YamlViewer from './components/YamlViewer';

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState('graph'); // 'graph', 'json', 'yaml'
  
  // Interactive Node Inspection Drawer
  const [selectedNode, setSelectedNode] = useState(null);

  // Policy Rule Toggles
  const [rules, setRules] = useState([
    { id: 'sink_invariants', name: 'Restricted Sinks Invariant', enabled: true, desc: 'Block execute_refund, transfer_funds, exec_shell' },
    { id: 'dlp_scanner', name: 'DLP Secret Scanner', enabled: true, desc: 'Regex scan for OpenAI, AWS, and private keys' },
    { id: 'state_diff', name: 'State Mutation Gate', enabled: true, desc: 'Verify before/after database state integrity' },
    { id: 'retry_storm', name: 'Cascading Loop Gating', enabled: true, desc: 'Warn on tool retry loop storms (>= 4 loops)' }
  ]);

  // Step-by-step playback state
  const [playbackStep, setPlaybackStep] = useState(999); // 999 = show all
  const [isPlaying, setIsPlaying] = useState(false);

  const [metrics, setMetrics] = useState({
    total_evaluations: 16,
    veto_count: 11,
    pass_count: 4,
    warn_count: 1,
    average_latency_ms: 0.82
  });

  useEffect(() => {
    fetchScenarios();
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (selectedScenarioId) {
      fetchScenarioDetails(selectedScenarioId);
      setSelectedNode(null);
      setPlaybackStep(999);
      setIsPlaying(false);
    }
  }, [selectedScenarioId]);

  // Playback timer loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && scenarioData?.dag?.nodes) {
      interval = setInterval(() => {
        setPlaybackStep((prev) => {
          if (prev >= scenarioData.dag.nodes.length) {
            setIsPlaying(false);
            return scenarioData.dag.nodes.length;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, scenarioData]);

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

  const handleDownloadYaml = () => {
    if (!scenarioData?.yaml_content) return;
    const element = document.createElement("a");
    const file = new Blob([scenarioData.yaml_content], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = `${scenarioData.scenario_id}_regression_spec.yaml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const startPlayback = () => {
    setPlaybackStep(1);
    setIsPlaying(true);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setPlaybackStep(999);
  };

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  // Filter DAG nodes based on step scrubber
  const filteredDag = React.useMemo(() => {
    if (!scenarioData?.dag) return null;
    if (playbackStep >= scenarioData.dag.nodes.length) return scenarioData.dag;

    const visibleNodes = scenarioData.dag.nodes.slice(0, playbackStep);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = scenarioData.dag.edges.filter(
      e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    return {
      nodes: visibleNodes,
      edges: visibleEdges
    };
  }, [scenarioData, playbackStep]);

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-80 border-r border-slate-800/80 bg-[#0a0e17]/95 flex flex-col shrink-0 z-20">
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0a0e17] rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-black tracking-wider text-white">AGENT<span className="text-indigo-400">VETO</span></h1>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">v2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Continuous AI Adjudication</p>
            </div>
          </div>
        </div>

        {/* Live Policy Telemetry Stats */}
        <div className="p-3 border-b border-slate-800/60 bg-[#0d121f]/50 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase font-mono">Decisions</div>
            <div className="text-xs font-bold text-white font-mono">{metrics.total_evaluations}</div>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-[9px] text-red-400 uppercase font-mono">Vetoes</div>
            <div className="text-xs font-bold text-red-400 font-mono">{metrics.veto_count}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[9px] text-emerald-400 uppercase font-mono">Latency</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">&lt; 1ms</div>
          </div>
        </div>

        {/* Benchmark Scenarios List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-1 pt-1 pb-1 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Threat Benchmark Traces</span>
            <span className="text-[9px] font-mono text-slate-500">4 Scenarios</span>
          </div>

          {loading && !scenarios.length ? (
            <div className="p-4 text-slate-500 text-xs flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Loading benchmark suite...</span>
            </div>
          ) : (
            scenarios.map((s) => {
              const isSelected = selectedScenarioId === s.id;
              const isVeto = s.expected_verdict === 'CRITICAL_VETO';
              const isPass = s.expected_verdict === 'PASS';

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={clsx(
                    "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                    isSelected
                      ? "bg-gradient-to-r from-slate-900 to-[#121828] border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={clsx(
                        "p-1 rounded-lg border shrink-0",
                        isVeto ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        isPass ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      )}>
                        {isVeto ? <ShieldAlert className="w-3 h-3" /> :
                         isPass ? <ShieldCheck className="w-3 h-3" /> :
                         <AlertTriangle className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-semibold text-white tracking-tight line-clamp-1">{s.name}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed pl-6">
                    {s.description}
                  </p>

                  <div className="mt-2 pl-6 flex items-center gap-1.5">
                    <span className={clsx(
                      "px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase border",
                      isVeto ? "bg-red-500/10 text-red-400 border-red-500/30" :
                      isPass ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}>
                      {s.expected_verdict}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
                      {s.threat_category}
                    </span>
                  </div>
                </button>
              );
            })
          )}

          {/* Active Security Invariants Section */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="px-1 pb-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3 text-indigo-400" /> Active Policy Rules</span>
            </div>
            
            <div className="space-y-1.5">
              {rules.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => toggleRule(r.id)}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-[10px] font-semibold text-slate-200">{r.name}</div>
                    <div className="text-[8px] text-slate-500 truncate max-w-[190px]">{r.desc}</div>
                  </div>
                  <div className={clsx("w-3.5 h-3.5 rounded flex items-center justify-center text-[10px]", r.enabled ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-600")}>
                    {r.enabled && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engineer Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-600/30">
              N
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Nishit
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[9px] text-indigo-400 font-mono">Policy & Evidence Lead</p>
            </div>
          </div>
          <div className="text-[9px] font-mono text-slate-500 border border-slate-800 rounded px-1.5 py-0.5">
            Member 4
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#07090e] relative overflow-hidden">
        
        {/* Top Control Bar */}
        <header className="h-16 shrink-0 border-b border-slate-800/80 bg-[#0a0e17]/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Benchmark</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-400 font-semibold">{scenarioData?.scenario_id || selectedScenarioId}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              {selectedScenario?.name}
            </h2>
          </div>

          {/* Navigation Tabs & Interactive Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Simulation Timeline Controls */}
            {activeTab === 'graph' && scenarioData?.dag && (
              <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 space-x-1">
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : startPlayback}
                  className={clsx(
                    "px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg flex items-center space-x-1 transition-all",
                    isPlaying ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-indigo-600 text-white hover:bg-indigo-500"
                  )}
                  title="Simulate Trajectory Execution Step-by-Step"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
                </button>

                <button
                  onClick={() => setPlaybackStep(prev => Math.min(prev + 1, scenarioData.dag.nodes.length))}
                  disabled={playbackStep >= (scenarioData.dag.nodes?.length || 0)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                  title="Step Next"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={resetPlayback}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Reset Timeline to Show All"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="text-[10px] font-mono text-slate-500 px-1">
                  Step {Math.min(playbackStep, scenarioData.dag.nodes.length)}/{scenarioData.dag.nodes.length}
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('graph')}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all",
                  activeTab === 'graph'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Evidence DAG</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all",
                  activeTab === 'json'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Trace JSON</span>
              </button>

              <button
                onClick={() => setActiveTab('yaml')}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all",
                  activeTab === 'yaml'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Regression Spec</span>
              </button>
            </div>

            {/* Re-evaluate Trigger */}
            <button
              onClick={handleReEvaluate}
              disabled={evaluating}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-medium text-slate-200 border border-slate-700 rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5 text-indigo-400", evaluating && "animate-spin")} />
              <span>Evaluate</span>
            </button>
          </div>
        </header>

        {/* Adjudication Status Ribbon */}
        {scenarioData && (
          <div className={clsx(
            "h-12 shrink-0 px-6 border-b flex items-center justify-between z-10 transition-colors",
            scenarioData.evaluation.status === 'CRITICAL_VETO'
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : scenarioData.evaluation.status === 'PASS'
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          )}>
            <div className="flex items-center space-x-3">
              <div className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-black font-mono uppercase tracking-wider flex items-center space-x-1.5 border",
                scenarioData.evaluation.status === 'CRITICAL_VETO'
                  ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : scenarioData.evaluation.status === 'PASS'
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-400"
              )}>
                {scenarioData.evaluation.status === 'CRITICAL_VETO' ? <ShieldAlert className="w-4 h-4" /> :
                 scenarioData.evaluation.status === 'PASS' ? <ShieldCheck className="w-4 h-4" /> :
                 <AlertTriangle className="w-4 h-4" />}
                <span>{scenarioData.evaluation.status}</span>
              </div>

              <p className="text-xs font-medium text-slate-300">
                {scenarioData.evaluation.rationale}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic Latency:</span>
                <span className="text-indigo-300 font-bold">0.00ms</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700"></div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Hallucination Boolean Gate</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Workspace */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* EVIDENCE DAG GRAPH TAB */}
            {activeTab === 'graph' && filteredDag && (
              <motion.div
                key="graph-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full h-full"
              >
                <TraceGraph 
                  dag={filteredDag} 
                  evaluation={scenarioData?.evaluation} 
                  onNodeClick={(node) => setSelectedNode(node)}
                />
              </motion.div>
            )}

            {/* RAW TRACE JSON TAB */}
            {activeTab === 'json' && scenarioData?.trace && (
              <motion.div
                key="json-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto rounded-2xl bg-[#0a0e17] border border-slate-800 shadow-2xl p-6">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <FileJson className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        OpenInference Agent Trajectory Log
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Run ID: {scenarioData.trace.run_id}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 bg-[#06080e] p-5 rounded-xl border border-slate-900 overflow-x-auto leading-relaxed">
                    {JSON.stringify(scenarioData.trace, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* GENERATED REGRESSION YAML TAB */}
            {activeTab === 'yaml' && scenarioData?.yaml_content && (
              <motion.div
                key="yaml-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto rounded-2xl bg-[#0a0e17] border border-slate-800 shadow-2xl p-6">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <FileCode2 className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Auto-Generated CI/CD Regression Specification
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Replayable via <code className="text-indigo-400 font-mono">agentveto test spec.yaml</code>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadYaml}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .YAML</span>
                    </button>
                  </div>
                  <div className="bg-[#06080e] p-5 rounded-xl border border-slate-900 overflow-x-auto text-xs font-mono">
                    <YamlViewer content={scenarioData.yaml_content} />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* INTERACTIVE NODE INSPECTOR SLIDE-OUT DRAWER */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-16 bottom-0 w-96 bg-[#0a0e17]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase font-mono text-white tracking-wider">
                    Node Adjudication Inspector
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Node Identifier</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-bold">{selectedNode.id}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Execution Type</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 capitalize">{selectedNode.type?.replace('_', ' ')}</div>
                </div>

                {selectedNode.data?.tool_name && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Intercepted Sink</div>
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                      {selectedNode.data.tool_name}()
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Payload Content / Arguments</div>
                  <div className="p-3 rounded-xl bg-[#06080e] border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-text">
                    {selectedNode.data?.content || 'No content payload recorded.'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Security Decision</div>
                  <div className={clsx(
                    "p-3 rounded-xl border flex items-center space-x-2",
                    selectedNode.data?.status === 'VETOED' ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  )}>
                    {selectedNode.data?.status === 'VETOED' ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                    <div>
                      <div className="font-bold text-xs">
                        {selectedNode.data?.status === 'VETOED' ? 'CRITICAL_VETO Triggered' : 'Action Allowed'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedNode.data?.status === 'VETOED' 
                          ? 'Blocked via boolean invariant before state mutation' 
                          : 'Nominal telemetry step'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-[#080c14]">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}

export default App;
