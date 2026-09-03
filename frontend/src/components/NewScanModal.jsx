import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Play, Server, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function NewScanModal({ isOpen, onClose, onStartScan }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'demo'
  
  // Demo State
  const [selectedAgent, setSelectedAgent] = useState('Customer Support Agent');

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
      attack_profile: 'Adaptive Adversarial Testing',
      environment: 'Synthetic Sandbox',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full ${manifest ? 'max-w-2xl' : 'max-w-xl'} bg-av-surfaceElevated border border-av-border rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-av-border flex items-center justify-between bg-av-surface">
          <h2 className="text-sm font-semibold text-av-textPrimary">
            New Scan
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded text-av-textSecondary hover:bg-av-surfaceHover hover:text-av-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        {!manifest && uploadStatus !== 'analyzing' && (
          <div className="flex px-6 pt-2 border-b border-av-border gap-6 bg-av-surface">
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "pb-3 text-xs font-semibold transition-colors border-b-2",
                activeTab === 'upload' ? "text-av-textPrimary border-av-textPrimary" : "text-av-textSecondary border-transparent hover:text-av-textPrimary"
              )}
            >
              Upload Project
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={clsx(
                "pb-3 text-xs font-semibold transition-colors border-b-2",
                activeTab === 'demo' ? "text-av-textPrimary border-av-textPrimary" : "text-av-textSecondary border-transparent hover:text-av-textPrimary"
              )}
            >
              Demo Scenarios
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto bg-av-bg">
          {activeTab === 'demo' && !manifest && uploadStatus !== 'analyzing' && (
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-av-textSecondary">Target Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-av-surface border border-av-border rounded-md text-sm text-av-textPrimary focus:outline-none focus:border-av-textSecondary"
                >
                  <option value="Customer Support Agent">Customer Support Agent (Vulnerable)</option>
                  <option value="Compliant Support Assistant">Compliant Support Assistant (Secure)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary space-x-2">
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Scan</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {uploadStatus === 'idle' && (
                <>
                <p className="text-sm text-av-textSecondary mb-2">Scan an AI agent project for tool misuse, indirect prompt injection, and unauthorized actions.</p>
                <div 
                  className={clsx(
                    "border border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                    isDragging ? "border-av-textSecondary bg-av-surfaceHover" : "border-av-border hover:border-av-textSecondary bg-av-surface"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".zip" />
                  <UploadCloud className={clsx("w-6 h-6 mb-3", isDragging ? "text-av-textPrimary" : "text-av-textSecondary")} />
                  <h3 className="text-sm font-semibold text-av-textPrimary mb-1">Upload Project Archive</h3>
                  <p className="text-xs text-av-textSecondary">Drop a .zip file here or click to browse</p>
                </div>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-av-border"></div>
                    <span className="flex-shrink-0 mx-4 text-av-textMuted text-[10px] uppercase font-bold tracking-wider">OR</span>
                    <div className="flex-grow border-t border-av-border"></div>
                </div>
                
                <div className="bg-av-surface border border-av-border rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-av-textPrimary mb-3 flex items-center">
                      <Server className="w-3.5 h-3.5 mr-2 text-av-textSecondary" />
                      GitHub Repository
                    </h3>
                    <div className="flex space-x-3">
                        <input 
                            type="text" 
                            id="githubUrlInput"
                            placeholder="https://github.com/owner/repo" 
                            className="flex-1 bg-av-bg border border-av-border rounded-md px-3 py-2 text-sm text-av-textPrimary focus:outline-none focus:border-av-textSecondary"
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
                            className="btn-primary"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
                </>
              )}

              {uploadStatus === 'analyzing' && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="w-6 h-6 animate-spin text-av-textSecondary" />
                  <h3 className="text-sm font-semibold text-av-textPrimary">Analyzing Project</h3>
                  <p className="text-xs text-av-textSecondary">Extracting files and detecting agent integrations...</p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-av-vetoBg border border-av-veto/30 rounded-lg p-6 text-center space-y-3">
                  <h3 className="text-sm font-semibold text-av-veto">Analysis Failed</h3>
                  <p className="text-sm text-av-veto/80">{uploadError}</p>
                  <button onClick={() => setUploadStatus('idle')} className="btn-secondary mt-2">
                    Try Again
                  </button>
                </div>
              )}

              {uploadStatus === 'success' && manifest && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-av-border">
                    <div>
                      <h3 className="text-base font-semibold text-av-textPrimary">{manifest.project_name || 'Uploaded Project'}</h3>
                      <p className="text-xs text-av-textSecondary mt-1">Detected Framework: {manifest.integration_type || manifest.language}</p>
                    </div>
                    <div className="px-2 py-1 bg-av-passBg text-av-pass rounded flex items-center space-x-1.5 border border-av-pass/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Ready for Scan</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-av-textSecondary uppercase tracking-wider">Detected Components</h4>
                    {manifest.agents?.length === 0 ? (
                       <p className="text-sm text-av-textMuted bg-av-surface p-4 rounded-lg border border-av-border">No agents detected in project.</p>
                    ) : (
                      manifest.agents?.map((agent, i) => (
                        <div key={i} className="p-4 rounded-lg bg-av-surface border border-av-border flex justify-between items-center">
                          <div>
                            <div className="text-sm font-semibold text-av-textPrimary">{agent.name}</div>
                            <div className="text-xs text-av-textSecondary mt-1 font-mono">{agent.file}</div>
                          </div>
                          <div className="text-[10px] text-av-textSecondary bg-av-bg border border-av-border px-2 py-0.5 rounded uppercase font-semibold">
                            {agent.tools?.length || 0} tools found
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button type="button" onClick={() => setUploadStatus('idle')} className="text-xs font-semibold text-av-textSecondary hover:text-av-textPrimary">
                      Back
                    </button>
                    <button onClick={handleStartManifestScan} className="btn-primary space-x-1.5">
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Scan</span>
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
