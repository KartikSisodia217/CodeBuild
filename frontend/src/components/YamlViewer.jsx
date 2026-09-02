import React from 'react';

export default function YamlViewer({ content }) {
  // A simple hacky syntax highlighter for YAML
  const highlightYaml = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => {
      // Keys
      let highlighted = line.replace(/^(\s*)([^:]+):/, '$1<span class="text-indigo-400 font-semibold">$2</span>:');
      
      // Strings
      if (highlighted.match(/:\s*['"].*['"]$/)) {
         highlighted = highlighted.replace(/:\s*(['"].*['"])$/, ': <span class="text-emerald-400">$1</span>');
      } 
      // Numbers/Booleans
      else if (highlighted.match(/:\s*(true|false|\d+(\.\d+)?)$/i)) {
         highlighted = highlighted.replace(/:\s*(true|false|\d+(\.\d+)?)$/i, ': <span class="text-amber-400">$1</span>');
      }
      
      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      );
    });
  };

  return (
    <pre className="text-slate-300 leading-relaxed font-mono">
      {highlightYaml(content)}
    </pre>
  );
}
