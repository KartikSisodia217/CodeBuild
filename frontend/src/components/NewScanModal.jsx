import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Play, Shield, Server, Crosshair, AlertCircle, UploadCloud, FileArchive, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function NewScanModal({ isOpen, onClose, onStartScan }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'demo'
  
  // Demo State
  const [selectedAgent, setSelectedAgent] = useState('Customer Support Agent');
  const [selectedProfile, setSelectedProfile] = useState('Adaptive Adversarial Testing');
  const [selectedEnv, setSelectedEnv] = useState('Synthetic Sandbox');

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'analyzing' | 'success' | 'error'
  const [uploadError, setUploadError] = useState(null);
  const [manifest, setManifest] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setUploadStatus('idle');
    setUploadError(null);
    setManifest(null);
    setActiveTab('upload');
    onClose();
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    let scenarioId = 'zero_click_echoleak';
    if (selectedAgent === 'Compliant Support Assistant') {
      scenarioId = 'benign_support_flow';
    }
    onStartScan({
      agent_name: selectedAgent,
      attack_profile: selectedProfile,
      environment: selectedEnv,
      scenario_id: scenarioId
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.zip')) {
      setUploadError('Invalid file type. Please upload a .zip archive.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('analyzing');
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/projects/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setManifest(res.data);
      setUploadStatus('success');
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to analyze project. Please try again.');
      setUploadStatus('error');
    }
  };

  const handleStartManifestScan = () => {
    onStartScan({
      agent_name: manifest.project_name || 'Uploaded Project',
      attack_profile: 'Adaptive Adversarial Testing',
      environment: 'Synthetic Sandbox',
      project_manifest: manifest
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className={`w-full ${manifest ? 'max-w-4xl' : 'max-w-2xl'} transition-all duration-300 rounded-2xl bg-[#121824] border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]`}>
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Start Security Scan
              </h2>
              <p className="text-xs text-slate-400">Upload agent or use demo fixture</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        {!manifest && uploadStatus !== 'analyzing' && (
          <div className="flex border-b border-slate-800 px-6 pt-4 space-x-6 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
                activeTab === 'upload' ? "text-indigo-400 border-indigo-400" : "text-slate-500 border-transparent hover:text-slate-300"
              )}
            >
              Upload Project
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={clsx(
                "pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
                activeTab === 'demo' ? "text-indigo-400 border-indigo-400" : "text-slate-500 border-transparent hover:text-slate-300"
              )}
            >
              Demo Fixtures
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'demo' && !manifest && uploadStatus !== 'analyzing' && (
            <form onSubmit={handleDemoSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
                  <span>TARGET AGENT</span>
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Customer Support Agent">Vulnerable support fixture (read_tickets, execute_refund)</option>
                  <option value="Compliant Support Assistant">Policy-respecting support fixture (PASS baseline)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">ATTACK PROFILE</label>
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
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">
                  ENVIRONMENT
                </label>
                <select
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Synthetic Sandbox">Synthetic sandbox (isolated fixture state)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all">
                  <Play className="w-3.5 h-3.5" />
                  <span>START SCAN</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {uploadStatus === 'idle' && (
                <>
                <div 
                  className={clsx(
                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                    isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-slate-500 bg-[#0B0F17]"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".zip" />
                  <UploadCloud className={clsx("w-10 h-10 mb-4", isDragging ? "text-indigo-400" : "text-slate-500")} />
                  <h3 className="text-sm font-bold text-white mb-1">Upload your AI agent project</h3>
                  <p className="text-xs text-slate-400 mb-4">Drop .zip file here or Browse Files</p>
                  <p className="text-[10px] text-slate-500 font-mono">Maximum supported archive limits enforced by backend</p>
                </div>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-mono">OR</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>
                
                <div className="bg-[#0B0F17] border border-slate-700 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center"><Server className="w-4 h-4 mr-2" />Analyze Public GitHub Repository</h3>
                    <div className="flex space-x-3">
                        <input 
                            type="text" 
                            id="githubUrlInput"
                            placeholder="https://github.com/owner/repo" 
                            className="flex-1 bg-[#121824] border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                        />
                        <button 
                            onClick={(e) => {
                                const url = document.getElementById('githubUrlInput').value;
                                if (!url) return;
                                setUploadStatus('analyzing');
                                setUploadError(null);
                                axios.post('http://127.0.0.1:8000/api/projects/analyze/github', {
                                    source_type: "github",
                                    repository_url: url
                                }).then(res => {
                                    setManifest(res.data);
                                    setUploadStatus('success');
                                }).catch(err => {
                                    setUploadError(err.response?.data?.detail || 'Failed to analyze repository. Please try again.');
                                    setUploadStatus('error');
                                });
                            }}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
                </>
              )}

              {uploadStatus === 'analyzing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Analyzing Project...</h3>
                  <div className="text-xs text-slate-400 space-y-2 text-center mt-4">
                    <p className="flex items-center justify-center space-x-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span>Archive uploaded</span></p>
                    <p className="flex items-center justify-center space-x-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span>Files extracted securely</span></p>
                    <p className="flex items-center justify-center space-x-2 text-slate-300"><Loader2 className="w-3 h-3 animate-spin text-indigo-400" /><span>Detecting AgentVeto integrations</span></p>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-6 text-center space-y-4">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Project Analysis Failed</h3>
                  <p className="text-xs text-red-300">{uploadError}</p>
                  <button onClick={() => setUploadStatus('idle')} className="px-4 py-2 mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {uploadStatus === 'success' && manifest && (
                <div className="space-y-6">
                  
                  {/* Informational Security Banner */}
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono tracking-wide mb-1">SECURE ANALYSIS</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        ✓ AST-based discovery  ✓ No user-code execution  ✓ Synthetic execution environment  ✓ Deterministic security evaluation
                      </p>
                    </div>
                  </div>

                  {/* Manifest Overview */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{manifest.project_name || 'Uploaded Project'}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">Supported Integrations: {manifest.integration_type || manifest.language}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Analysis Complete</span>
                    </div>
                  </div>

                  {/* Agents Found */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Agents Found</h4>
                    {manifest.agents?.map((agent, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#0E131F] border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-bold text-white">{agent.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{agent.file}</div>
                          </div>
                          <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                            {agent.tools?.length || 0} tools found
                          </div>
                        </div>

                        {agent.tools?.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                  <th className="pb-2 font-medium">Tool</th>
                                  <th className="pb-2 font-medium">File</th>
                                  <th className="pb-2 font-medium">Line</th>
                                  <th className="pb-2 font-medium">Risk</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50">
                                {agent.tools.map((tool, j) => {
                                  const isSink = tool.name.toLowerCase().includes('delete') || tool.name.toLowerCase().includes('update') || tool.name.toLowerCase().includes('execute');
                                  return (
                                    <tr key={j} className="text-slate-300">
                                      <td className="py-2.5 font-bold">{tool.name}</td>
                                      <td className="py-2.5 text-slate-500">{tool.source_file || agent.file}</td>
                                      <td className="py-2.5 text-slate-500">{tool.line_number || '-'}</td>
                                      <td className="py-2.5">
                                        <span className={clsx(
                                          "px-2 py-0.5 rounded text-[10px] font-bold border",
                                          isSink ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        )}>
                                          {isSink ? 'SINK' : 'SOURCE'}
                                        </span>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                    <button type="button" onClick={() => setUploadStatus('idle')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                      Upload Different Project
                    </button>
                    <button onClick={handleStartManifestScan} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all">
                      <Play className="w-4 h-4" />
                      <span>RUN SECURITY SCAN</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
