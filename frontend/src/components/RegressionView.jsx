import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  BookmarkCheck,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import YamlViewer from './YamlViewer';

export default function RegressionView({ data }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!data || !data.yaml_content) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No regression specification generated.
      </div>
    );
  }

  const evaluation = data.evaluation || {};
  const isVeto = evaluation.status === 'CRITICAL_VETO';

  const handleCopy = () => {
    navigator.clipboard.writeText(data.yaml_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([data.yaml_content], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = `${data.scenario_id}_regression_spec.yaml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Vulnerability Gating Status Banner */}
      <div className={clsx(
        "p-6 rounded-[20px] border flex items-center justify-between bg-[#0d0e12]",
        isVeto ? "border-[#f43f5e]/40" : "border-[#70dcd3]/40"
      )}>
        <div className="flex items-center space-x-4">
          <div className={clsx(
            "w-12 h-12 rounded-full border flex items-center justify-center shrink-0",
            isVeto ? "bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]" : "bg-[#70dcd3]/10 border-[#70dcd3]/30 text-[#70dcd3]"
          )}>
            <FileCode2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-medium text-white uppercase font-mono tracking-[0.056em]">
                {saved ? 'REGRESSION TEST SAVED' : (isVeto ? 'VULNERABILITY CONFIRMED' : 'TEST SPECIFICATION CREATED')}
              </h2>
              {saved && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-[#70dcd3] text-[#70dcd3]">
                  STORED IN TEST SUITE
                </span>
              )}
            </div>
            
            <p className="text-xs text-[#aeaeb7] mt-1 font-normal">
              {isVeto 
                ? 'This caught exploit has been serialized into a deterministic regression test to prevent regressions in GitHub Actions.' 
                : 'Nominal baseline interaction converted into invariant compliance test.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!saved ? (
            <button
              onClick={handleSave}
              className="btn-harness-white px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-[#070707]" />
              <span>SAVE REGRESSION TEST</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#70dcd3] border border-[#70dcd3]/30 px-3.5 py-1.5 rounded-full">
              <Check className="w-4 h-4" />
              <span>TEST SUITE UPDATED</span>
            </div>
          )}
        </div>
      </div>

      {/* Regression Metadata Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16">
          <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Test Identifier</span>
          <div className="text-xs font-medium text-white font-mono mt-1">{data.scenario_id}</div>
        </div>

        <div className="p-4 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16">
          <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Threat Vector</span>
          <div className="text-xs font-medium text-[#f43f5e] font-mono mt-1">{evaluation.threat_category || 'ASI01'}</div>
        </div>

        <div className="p-4 rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16">
          <span className="text-[10px] font-mono text-[#a2a4a9] uppercase tracking-[0.094em]">Expected Adjudication</span>
          <div className="text-xs font-medium text-[#70dcd3] font-mono mt-1">{evaluation.status || 'CRITICAL_VETO'}</div>
        </div>
      </div>

      {/* YAML Specification Code Card */}
      <div className="rounded-[20px] bg-[#0d0e12] border border-[#d9dae5]/16 overflow-hidden">
        
        <div className="p-4 bg-[#141418] border-b border-[#22222a] flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs text-[#a2a4a9]">
            <span className="text-[#70dcd3] font-medium">spec.yaml</span>
            <span className="text-[#60606c]">•</span>
            <span className="text-[11px] text-[#aeaeb7]">Replayable via CLI: <code className="text-white">python -m agentveto.cli test spec.yaml</code></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="btn-harness-ghost px-3.5 py-1.5 text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#70dcd3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy YAML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="btn-harness-white px-4 py-1.5 text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#070707]" />
              <span>Download .yaml</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#070707] overflow-x-auto text-xs font-mono">
          <YamlViewer content={data.yaml_content} />
        </div>

      </div>

    </div>
  );
}
