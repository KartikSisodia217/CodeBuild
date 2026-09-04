import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  BookmarkCheck
} from 'lucide-react';
import clsx from 'clsx';
import YamlViewer from './YamlViewer';

export default function RegressionView({ data }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!data || !data.metadata?.yaml_content) {
    return (
      <div className="p-8 text-center text-av-textMuted font-mono text-sm">
        No regression specification generated.
      </div>
    );
  }

  const evaluation = data.evaluation || {};
  const verdict = data.metadata?.verdict || data.verdict;
  const isVeto = verdict === 'CRITICAL_VETO' || verdict === 'VETO';

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
    <div className="space-y-6 max-w-4xl">
      
      {/* Status Banner */}
      <div className="p-6 rounded-xl border border-av-border flex items-center justify-between shadow-subtle bg-av-surface">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-av-bg border border-av-borderLight flex items-center justify-center text-av-textSecondary shrink-0">
            <FileCode2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-av-textPrimary">
                {saved ? 'Regression Test Saved' : (isVeto ? 'Vulnerability Captured' : 'Test Specification Created')}
              </h2>
            </div>
            
            <p className="text-sm text-av-textSecondary mt-1">
              {isVeto 
                ? 'This caught exploit has been serialized into a deterministic regression test.' 
                : 'Nominal baseline interaction converted into invariant compliance test.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!saved ? (
            <button
              onClick={handleSave}
              className="btn-primary space-x-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Save Test</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-sm font-medium text-av-pass bg-[#101F18] px-3 py-1.5 rounded-md border border-av-pass/30">
              <Check className="w-4 h-4" />
              <span>Saved to Suite</span>
            </div>
          )}
        </div>
      </div>

      {/* Regression Metadata Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-av-surface border border-av-border shadow-sm">
          <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Test Identifier</span>
          <div className="text-sm font-mono text-av-textPrimary mt-1">{data.run_id}</div>
        </div>

        <div className="p-4 rounded-lg bg-av-surface border border-av-border shadow-sm">
          <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Threat Vector</span>
          <div className="text-sm font-mono text-av-textPrimary mt-1">{evaluation.threat_category || 'Agent Goal Hijacking'}</div>
        </div>

        <div className="p-4 rounded-lg bg-av-surface border border-av-border shadow-sm">
          <span className="text-[10px] font-semibold text-av-textMuted uppercase tracking-wider">Expected Verdict</span>
          <div className="text-sm font-mono text-av-textPrimary mt-1">{verdict || 'VETO'}</div>
        </div>
      </div>

      {/* YAML Specification Code Card */}
      <div className="rounded-xl bg-av-surface border border-av-border overflow-hidden shadow-subtle">
        
        <div className="p-4 bg-av-surfaceElevated border-b border-av-border flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-av-textSecondary">
            <span className="font-semibold text-av-textPrimary">spec.yaml</span>
            <span className="text-av-textMuted">•</span>
            <span className="text-xs text-av-textMuted font-mono">agentveto test spec.yaml</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="btn-secondary space-x-1.5 py-1.5 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-av-pass" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="btn-secondary space-x-1.5 py-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-av-bg overflow-x-auto text-sm font-mono text-av-textPrimary border-t border-av-borderLight">
          <YamlViewer content={data.metadata?.yaml_content} />
        </div>

      </div>

    </div>
  );
}
