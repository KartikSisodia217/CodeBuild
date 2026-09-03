import React from 'react';

export default function YamlViewer({ content }) {
  return (
    <pre className="text-av-textSecondary leading-relaxed font-mono whitespace-pre-wrap">
      {content || '# No regression YAML was generated.'}
    </pre>
  );
}
