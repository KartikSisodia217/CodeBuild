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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className={`w-full ${manifest ? 'max-w-4xl' : 'max-w-2xl'} transition-all duration-300 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 shadow-2xl flex flex-col max-h-[90vh]`}>
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#22222a] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#70dcd3]/10 border border-[#70dcd3]/30 flex items-center justify-center text-[#70dcd3]">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-[0.056em] font-mono">
                Start Security Scan
              </h2>
              <p className="text-xs text-[#aeaeb7]">Upload agent or use demo fixture</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/10 text-[#a2a4a9] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        {!manifest && uploadStatus !== 'analyzing' && (
          <div className="flex border-b border-[#22222a] px-6 pt-4 space-x-6 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "pb-3 text-xs font-medium uppercase tracking-[0.056em] transition-colors border-b-2 cursor-pointer",
                activeTab === 'upload' ? "text-white border-white" : "text-[#a2a4a9] border-transparent hover:text-white"
              )}
            >
              Upload Project
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={clsx(
                "pb-3 text-xs font-medium uppercase tracking-[0.056em] transition-colors border-b-2 cursor-pointer",
                activeTab === 'demo' ? "text-white border-white" : "text-[#a2a4a9] border-transparent hover:text-white"
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
                <label className="text-xs font-medium text-[#a2a4a9] font-mono flex items-center justify-between">
                  <span>TARGET AGENT</span>
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#2e3038] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#0092e4] transition-colors"
                >
                  <option value="Customer Support Agent">Vulnerable support fixture (read_tickets, execute_refund)</option>
                  <option value="Compliant Support Assistant">Policy-respecting support fixture (PASS baseline)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#a2a4a9] font-mono">ATTACK PROFILE</label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#2e3038] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#0092e4] transition-colors"
                >
                  <option value="Adaptive Adversarial Testing">Adaptive Adversarial Testing (ASI01 / MCP10)</option>
                  <option value="State Invariant Fuzzing">State Mutation Fuzzing (Pre/Post DB diff)</option>
                  <option value="Cascading Loop Testing">Cascading Loop & Retry Storm Testing (ASI08)</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#a2a4a9] font-mono">
                  ENVIRONMENT
                </label>
                <select
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#2e3038] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#0092e4] transition-colors"
                >
                  <option value="Synthetic Sandbox">Synthetic sandbox (isolated fixture state)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button type="button" onClick={handleClose} className="btn-harness-ghost px-4 py-2 text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer">
                  <Play className="w-3.5 h-3.5 fill-[#070707]" />
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
                    isDragging ? "border-[#70dcd3] bg-[#70dcd3]/5" : "border-[#2e3038] hover:border-[#d9dae5]/40 bg-[#141418]"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".zip" />
                  <UploadCloud className={clsx("w-10 h-10 mb-4", isDragging ? "text-[#70dcd3]" : "text-[#a2a4a9]")} />
                  <h3 className="text-sm font-medium text-white mb-1">Upload your AI agent project</h3>
                  <p className="text-xs text-[#aeaeb7] mb-4">Drop .zip file here or Browse Files</p>
                  <p className="text-[10px] text-[#60606c] font-mono">Maximum supported archive limits enforced by backend</p>
                </div>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#22222a]"></div>
                    <span className="flex-shrink-0 mx-4 text-[#60606c] text-xs font-mono">OR</span>
                    <div className="flex-grow border-t border-[#22222a]"></div>
                </div>
                
                <div className="bg-[#141418] border border-[#22222a] rounded-xl p-6">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center"><Server className="w-4 h-4 mr-2 text-[#70dcd3]" />Analyze Public GitHub Repository</h3>
                    <div className="flex space-x-3">
                        <input 
                            type="text" 
                            id="githubUrlInput"
                            placeholder="https://github.com/owner/repo" 
                            className="flex-1 bg-[#0d0e12] border border-[#2e3038] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#0092e4] font-mono transition-colors"
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
                            className="btn-harness-white px-5 py-2.5 text-xs cursor-pointer"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
                </>
              )}

              {uploadStatus === 'analyzing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#70dcd3]" />
                  <h3 className="text-sm font-medium text-white uppercase tracking-[0.056em] font-mono">Analyzing Project...</h3>
                  <div className="text-xs text-[#aeaeb7] space-y-2 text-center mt-4">
                    <p className="flex items-center justify-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#70dcd3]" /><span>Archive uploaded</span></p>
                    <p className="flex items-center justify-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#70dcd3]" /><span>Files extracted securely</span></p>
                    <p className="flex items-center justify-center space-x-2 text-white"><Loader2 className="w-3.5 h-3.5 animate-spin text-[#70dcd3]" /><span>Detecting AgentVeto integrations</span></p>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-[#141418] border border-[#f43f5e]/40 rounded-xl p-6 text-center space-y-4">
                  <AlertCircle className="w-8 h-8 text-[#f43f5e] mx-auto" />
                  <h3 className="text-sm font-medium text-white uppercase tracking-[0.056em] font-mono">Project Analysis Failed</h3>
                  <p className="text-xs text-[#f43f5e]">{uploadError}</p>
                  <button onClick={() => setUploadStatus('idle')} className="btn-harness-ghost px-4 py-2 mt-4 text-xs cursor-pointer">
                    Try Again
                  </button>
                </div>
              )}

              {uploadStatus === 'success' && manifest && (
                <div className="space-y-6">
                  
                  {/* Informational Security Banner */}
                  <div className="p-4 rounded-xl bg-[#141418] border border-[#22222a] flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-[#70dcd3] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-medium text-white font-mono tracking-wide mb-1">SECURE ANALYSIS</h4>
                      <p className="text-xs text-[#aeaeb7] leading-relaxed">
                        ✓ AST-based discovery  ✓ No user-code execution  ✓ Synthetic execution environment  ✓ Deterministic security evaluation
                      </p>
                    </div>
                  </div>

                  {/* Manifest Overview */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{manifest.project_name || 'Uploaded Project'}</h3>
                      <p className="text-xs text-[#aeaeb7] font-mono mt-1">Supported Integrations: {manifest.integration_type || manifest.language}</p>
                    </div>
                    <div className="px-3 py-1.5 border border-[#70dcd3] rounded-full flex items-center space-x-1.5 text-[#70dcd3]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium font-mono">Analysis Complete</span>
                    </div>
                  </div>

                  {/* Agents Found */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-[#a2a4a9] uppercase tracking-[0.094em] font-mono">Agents Found</h4>
                    {manifest.agents?.map((agent, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#141418] border border-[#22222a]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-medium text-white">{agent.name}</div>
                            <div className="text-[10px] text-[#a2a4a9] font-mono mt-0.5">{agent.file}</div>
                          </div>
                          <div className="text-xs font-mono text-[#70dcd3] border border-[#70dcd3]/30 px-2 py-0.5 rounded-full">
                            {agent.tools?.length || 0} tools found
                          </div>
                        </div>

                        {agent.tools?.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="text-[#a2a4a9] border-b border-[#22222a]">
                                  <th className="pb-2 font-medium">Tool</th>
                                  <th className="pb-2 font-medium">File</th>
                                  <th className="pb-2 font-medium">Line</th>
                                  <th className="pb-2 font-medium">Risk</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#22222a]">
                                {agent.tools.map((tool, j) => {
                                  const isSink = tool.name.toLowerCase().includes('delete') || tool.name.toLowerCase().includes('update') || tool.name.toLowerCase().includes('execute');
                                  return (
                                    <tr key={j} className="text-[#aeaeb7]">
                                      <td className="py-2.5 font-medium text-white">{tool.name}</td>
                                      <td className="py-2.5 text-[#a2a4a9]">{tool.source_file || agent.file}</td>
                                      <td className="py-2.5 text-[#60606c]">{tool.line_number || '-'}</td>
                                      <td className="py-2.5">
                                        <span className={clsx(
                                          "px-2 py-0.5 rounded-full text-[10px] font-mono border",
                                          isSink ? "border-[#f43f5e] text-[#f43f5e]" : "border-[#70dcd3] text-[#70dcd3]"
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
                  <div className="pt-4 flex items-center justify-between border-t border-[#22222a]">
                    <button type="button" onClick={() => setUploadStatus('idle')} className="btn-harness-ghost px-4 py-2 text-xs cursor-pointer">
                      Upload Different Project
                    </button>
                    <button onClick={handleStartManifestScan} className="btn-harness-white px-6 py-3 text-xs flex items-center space-x-2 cursor-pointer">
                      <Play className="w-4 h-4 fill-[#070707]" />
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
