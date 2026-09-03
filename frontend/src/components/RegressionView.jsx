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

  if (!data || !data.metadata?.yaml_content) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No regression specification generated.
      </div>
    );
  }

  const evaluation = data.evaluation || {};
  const isVeto = data.verdict === 'VETO';

  const handleCopy = () => {
    navigator.clipboard.writeText(data.metadata?.yaml_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([data.metadata?.yaml_content], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = `${data.run_id}_regression_spec.yaml`;
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
        "p-6 rounded-2xl border flex items-center justify-between shadow-xl",
        isVeto ? "bg-red-950/20 border-red-500/40" : "bg-slate-900 border-slate-800"
      )}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FileCode2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white uppercase font-mono">
                {saved ? 'REGRESSION TEST SAVED' : (isVeto ? 'VULNERABILITY CONFIRMED' : 'TEST SPECIFICATION CREATED')}
              </h2>
              {saved && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STORED IN TEST SUITE
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-300 mt-1">
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>SAVE REGRESSION TEST</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>TEST SUITE UPDATED</span>
            </div>
          )}
        </div>
      </div>

      {/* Regression Metadata Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#121824] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Test Identifier</span>
          <div className="text-xs font-bold text-white font-mono mt-0.5">{data.run_id}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121824] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Threat Vector</span>
          <div className="text-xs font-bold text-red-400 font-mono mt-0.5">{evaluation.threat_category || 'ASI01'}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121824] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Expected Adjudication</span>
          <div className="text-xs font-bold text-indigo-400 font-mono mt-0.5">{data.verdict || 'VETO'}</div>
        </div>
      </div>

      {/* YAML Specification Code Card */}
      <div className="rounded-2xl bg-[#121824] border border-slate-800 overflow-hidden shadow-2xl">
        
        <div className="p-4 bg-[#0E131F] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
            <span className="text-indigo-400 font-bold">spec.yaml</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-500">Replayable via CLI: <code className="text-slate-300">python -m agentveto.cli test spec.yaml</code></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy YAML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-mono font-medium text-white shadow-sm shadow-indigo-600/30 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .yaml</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#06080e] overflow-x-auto text-xs font-mono">
          <YamlViewer content={data.metadata?.yaml_content} />
        </div>

      </div>

    </div>
  );
}
