import React, { useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Bug, 
  Code, 
  AlertTriangle, 
  MousePointerClick
} from 'lucide-react';
import clsx from 'clsx';

// --- CUSTOM NODE ---
const CustomNode = ({ data, type, selected }) => {
  const isVeto = type === 'veto_sink';
  const isInjection = type === 'injection_source';
  const isPrompt = type === 'user_prompt';
  const isLLM = type === 'llm_reasoning';

  const rawContent = data.content || data.inputs || data.outputs;
  let formattedContent = '';
  if (typeof rawContent === 'object' && rawContent !== null) {
    formattedContent = JSON.stringify(rawContent, null, 2);
  } else if (rawContent) {
    formattedContent = String(rawContent);
  }

  let nodeIcon = <Code className="w-4 h-4 text-av-pass" />;
  let nodeBadge = "Tool Execution";
  let borderClass = "border-av-border";
  let bgClass = "bg-av-surface";

  if (isVeto) {
    nodeIcon = <ShieldAlert className="w-4 h-4 text-av-veto" />;
    nodeBadge = "Target Action (Blocked)";
    borderClass = "border-av-veto/40 ring-1 ring-av-veto/20";
  } else if (isInjection) {
    nodeIcon = <Bug className="w-4 h-4 text-av-warn" />;
    nodeBadge = "Untrusted External Data";
    borderClass = "border-av-warn/40 ring-1 ring-av-warn/20";
  } else if (isPrompt) {
    nodeIcon = <Terminal className="w-4 h-4 text-av-textSecondary" />;
    nodeBadge = "Initial User Task";
    borderClass = "border-av-borderLight";
  } else if (isLLM) {
    nodeIcon = <Cpu className="w-4 h-4 text-av-info" />;
    nodeBadge = "Model Reasoning";
    borderClass = "border-av-info/40";
  }

  return (
    <div className={clsx(
      "w-[320px] rounded-xl border transition-all relative shadow-subtle group",
      bgClass,
      borderClass,
      selected ? "ring-2 ring-av-textSecondary" : ""
    )}>
      
      {/* Left Input Handle */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !-left-1.5 !bg-av-bg !border-2 !border-av-textSecondary rounded-full" 
      />

      {/* Node Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-av-border bg-av-surfaceElevated rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {nodeIcon}
          </div>
          <div>
            <div className="text-xs font-semibold text-av-textPrimary uppercase tracking-wider font-mono">
              {data.label}
            </div>
            <div className="text-[10px] text-av-textMuted font-mono mt-0.5">
              {nodeBadge}
            </div>
          </div>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-4 space-y-3 bg-av-bg rounded-b-xl">
        {formattedContent && (
          <div className="p-3 rounded-lg bg-av-surface border border-av-border font-mono text-[10px] text-av-textSecondary leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
            {formattedContent}
          </div>
        )}

        {data.tool_name && (
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-av-textMuted font-semibold">Sink:</span>
            <span className="px-2 py-0.5 rounded font-semibold bg-av-surfaceElevated text-av-textPrimary border border-av-borderLight">
              {data.tool_name}()
            </span>
          </div>
        )}

        {data.status === 'VETOED' && (
          <div className="p-2 rounded-lg bg-av-vetoBg border border-av-veto/30 flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-av-veto shrink-0 mt-0.5" />
            <div className="text-[10px] text-av-veto leading-tight">
              <span className="font-semibold">VETO:</span> Execution blocked.
            </div>
          </div>
        )}
      </div>

      {/* Right Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !-right-1.5 !bg-av-bg !border-2 !border-av-textSecondary rounded-full" 
      />
    </div>
  );
};

const nodeTypes = {
  user_prompt: (props) => <CustomNode {...props} type="user_prompt" />,
  injection_source: (props) => <CustomNode {...props} type="injection_source" />,
  llm_reasoning: (props) => <CustomNode {...props} type="llm_reasoning" />,
  tool_execution: (props) => <CustomNode {...props} type="tool_execution" />,
  agent_step: (props) => <CustomNode {...props} type="agent_step" />,
  veto_sink: (props) => <CustomNode {...props} type="veto_sink" />
};

export default function TraceGraph({ dag, evaluation, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!dag || !dag.nodes) return;

    const rfNodes = dag.nodes.map((n, idx) => {
      const nodeData = n.data || {};
      const posX = n.position?.x ?? (idx * 380 + 60);
      const posY = n.position?.y ?? 180;

      return {
        id: n.id,
        type: n.type || 'tool_execution',
        position: { x: posX, y: posY },
        data: {
          label: nodeData.label || n.label || `Step ${idx + 1}`,
          content: nodeData.inputs || nodeData.outputs || nodeData.content || '',
          inputs: nodeData.inputs,
          outputs: nodeData.outputs,
          tool_name: nodeData.name || nodeData.tool_name || '',
          status: nodeData.status || (nodeData.is_vetoed ? 'VETOED' : 'OK'),
          kind: nodeData.kind
        }
      };
    });

    const rfEdges = (dag.edges || []).map((e, idx) => {
      const isRed = e.style?.stroke === '#EF4444' || e.color === 'red' || e.animated;
      const strokeColor = isRed ? '#EF4444' : '#6B7280'; // veto or textMuted

      return {
        id: e.id || `edge-${e.source}-${e.target}-${idx}`,
        source: e.source,
        target: e.target,
        animated: false,
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 20,
          height: 20
        },
        label: e.label,
        labelStyle: { fill: '#9AA1AD', fontWeight: 500, fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#14171C', opacity: 0.9, rx: 4, ry: 4 },
        labelBgPadding: [6, 4]
      };
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [dag]);

  return (
    <div className="w-full h-full bg-av-bg relative flex items-center justify-center">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.5}
        className="bg-av-bg"
      >
        <Background color="#252A32" gap={20} size={1} />
        <Controls className="!bg-av-surface !border !border-av-border !rounded-md shadow-subtle" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'veto_sink') return '#EF4444';
            if (n.type === 'injection_source') return '#F59E0B';
            if (n.type === 'user_prompt') return '#6B7280';
            if (n.type === 'llm_reasoning') return '#3B82F6';
            return '#10B981';
          }}
          maskColor="rgba(13, 15, 18, 0.7)"
          className="!bg-av-surface !border !border-av-border !rounded-md overflow-hidden shadow-subtle"
        />
      </ReactFlow>
    </div>
  );
}
