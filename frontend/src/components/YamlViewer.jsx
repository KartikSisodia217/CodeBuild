import React from 'react';

export default function YamlViewer({ content }) {
  return (
    <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
      {content || '# No regression YAML was generated.'}
    </pre>
  );
}
