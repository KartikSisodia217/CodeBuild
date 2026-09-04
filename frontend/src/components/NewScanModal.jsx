import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Play, Shield, Server, Crosshair, AlertCircle, UploadCloud, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { API_BASE_URL } from '../config';

export default function NewScanModal({ isOpen, onClose, onStartScan, isLoading }) {
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
      const res = await axios.post(`${API_BASE_URL}/api/projects/analyze`, formData, {
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
      <div className={`w-full ${manifest ? 'max-w-2xl' : 'max-w-xl'} transition-all duration-300 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 shadow-2xl flex flex-col max-h-[90vh]`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#22222a] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#70dcd3]/10 border border-[#70dcd3]/30 flex items-center justify-center text-[#70dcd3]">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                New Scan
              </h2>
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
          <div className="flex border-b border-[#22222a] px-6 pt-3 space-x-6 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "pb-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer",
                activeTab === 'upload' ? "text-white border-white" : "text-[#a2a4a9] border-transparent hover:text-white"
              )}
            >
              Upload Project
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={clsx(
                "pb-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer",
                activeTab === 'demo' ? "text-white border-white" : "text-[#a2a4a9] border-transparent hover:text-white"
              )}
            >
              Demo Scenarios
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'demo' && !manifest && uploadStatus !== 'analyzing' && (
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#a2a4a9]">Target Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#2e3038] rounded-lg text-sm text-white focus:outline-none focus:border-[#70dcd3] transition-colors"
                >
                  <option value="Customer Support Agent">Customer Support Agent (Vulnerable)</option>
                  <option value="Compliant Support Assistant">Compliant Support Assistant (Secure)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-harness-ghost px-4 py-2 text-xs cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#070707]" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-[#070707]" />
                      <span>Run Scan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {uploadStatus === 'idle' && (
                <>
                <p className="text-xs text-[#aeaeb7] mb-2">Scan an AI agent project for tool misuse, indirect prompt injection, and unauthorized actions.</p>
                <div 
                  className={clsx(
                    "border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
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
                    <span className="flex-shrink-0 mx-4 text-[#60606c] text-[10px] uppercase font-bold tracking-wider font-mono">OR</span>
                    <div className="flex-grow border-t border-[#22222a]"></div>
                </div>
                
                <div className="bg-[#141418] border border-[#22222a] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-white mb-3 flex items-center">
                      <Server className="w-3.5 h-3.5 mr-2 text-[#70dcd3]" />
                      GitHub Repository
                    </h3>
                    <div className="flex space-x-3">
                        <input 
                            type="text" 
                            id="githubUrlInput"
                            placeholder="https://github.com/owner/repo" 
                            className="flex-1 bg-[#0d0e12] border border-[#2e3038] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#70dcd3] font-mono transition-colors"
                        />
                        <button 
                            onClick={(e) => {
                                const url = document.getElementById('githubUrlInput').value;
                                if (!url) return;
                                setUploadStatus('analyzing');
                                setUploadError(null);
                                axios.post(`${API_BASE_URL}/api/projects/analyze/github`, {
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
                            className="btn-harness-white px-5 py-2.5 text-xs cursor-pointer font-medium"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
                </>
              )}

              {uploadStatus === 'analyzing' && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="w-7 h-7 animate-spin text-[#70dcd3]" />
                  <h3 className="text-sm font-semibold text-white">Analyzing Project</h3>
                  <p className="text-xs text-[#aeaeb7]">Extracting files and detecting agent integrations...</p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-[#141418] border border-[#f43f5e]/40 rounded-xl p-6 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-[#f43f5e] mx-auto" />
                  <h3 className="text-sm font-semibold text-[#f43f5e]">Analysis Failed</h3>
                  <p className="text-xs text-[#f43f5e]/90">{uploadError}</p>
                  <button onClick={() => setUploadStatus('idle')} className="btn-harness-ghost px-4 py-2 mt-2 text-xs cursor-pointer">
                    Try Again
                  </button>
                </div>
              )}

              {uploadStatus === 'success' && manifest && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-[#22222a]">
                    <div>
                      <h3 className="text-base font-semibold text-white">{manifest.project_name || 'Uploaded Project'}</h3>
                      <p className="text-xs text-[#aeaeb7] mt-1 font-mono">Detected Framework: {manifest.integration_type || manifest.language || 'Unknown'}</p>
                    </div>
                    {manifest.agentic && manifest.supported ? (
                      <div className="px-3 py-1 bg-[#70dcd3]/10 text-[#70dcd3] rounded-full flex items-center space-x-1.5 border border-[#70dcd3]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Ready for Scan</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-[#f43f5e]/10 text-[#f43f5e] rounded-full flex items-center space-x-1.5 border border-[#f43f5e]/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Unsupported Project</span>
                      </div>
                    )}
                  </div>

                  {!manifest.agentic || !manifest.supported ? (
                    <div className="bg-[#141418] border border-[#f43f5e]/30 rounded-xl p-5 text-xs text-[#f43f5e]/90 space-y-1">
                      <p className="font-semibold text-sm">Cannot Scan Project</p>
                      <p className="text-[#aeaeb7] leading-relaxed">
                        {!manifest.agentic 
                          ? "This project does not contain any detected agentic frameworks, tools, or generative execution paths. AgentVeto requires an active agent integration to scan."
                          : "This project uses an unsupported integration framework."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-[#a2a4a9] uppercase tracking-wider font-mono">Detected Components</h4>
                      {manifest.agents?.length === 0 ? (
                         <p className="text-xs text-[#aeaeb7] bg-[#141418] p-4 rounded-xl border border-[#22222a]">No agents detected in project.</p>
                      ) : (
                        manifest.agents?.map((agent, i) => (
                          <div key={i} className="p-4 rounded-xl bg-[#141418] border border-[#22222a] flex justify-between items-center">
                            <div>
                              <div className="text-sm font-semibold text-white">{agent.name}</div>
                              <div className="text-xs text-[#a2a4a9] mt-1 font-mono">{agent.file}</div>
                            </div>
                            <div className="text-[10px] text-[#70dcd3] bg-[#0d0e12] border border-[#70dcd3]/30 px-2.5 py-1 rounded-full uppercase font-mono font-semibold">
                              {agent.tools?.length || 0} explicit tool declarations
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between border-t border-[#22222a]">
                    <button type="button" onClick={() => setUploadStatus('idle')} className="btn-harness-ghost px-4 py-2 text-xs cursor-pointer">
                      Back
                    </button>
                    <button 
                      onClick={handleStartManifestScan} 
                      disabled={isLoading}
                      className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#070707]" />
                          <span>Scanning...</span>
                        </>
                      ) : manifest.agentic && manifest.supported ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-[#070707]" />
                          <span>Run Scan</span>
                        </>
                      ) : (
                        <span>View Details</span>
                      )}
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
