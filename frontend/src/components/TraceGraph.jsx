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
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Bug, 
  Code, 
  AlertTriangle, 
  Sparkles,
  ArrowDownRight,
  Lock,
  ExternalLink,
  Flame,
  MousePointerClick
} from 'lucide-react';
import clsx from 'clsx';

// --- CUSTOM NODES ---

const CustomNode = ({ data, type, selected }) => {
  const isVeto = type === 'veto_sink';
  const isInjection = type === 'injection_source';
  const isPrompt = type === 'user_prompt';
  const isLLM = type === 'llm_reasoning';
  const isTool = type === 'tool_execution';

  return (
    <div className={clsx(
      "w-[340px] rounded-2xl border backdrop-blur-xl transition-all duration-300 relative overflow-hidden shadow-2xl cursor-pointer select-none group",
      selected ? "ring-2 ring-indigo-400 scale-[1.02]" : "",
      isVeto ? "bg-[#14080a]/90 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:border-red-400" :
      isInjection ? "bg-[#161106]/90 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-amber-400" :
      isPrompt ? "bg-[#0b0f1d]/90 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-400" :
      isLLM ? "bg-[#130b1c]/90 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400" :
      "bg-[#091512]/90 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-400"
    )}>
      
      {/* Top Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3.5 !h-3.5 !-top-1.5 !bg-slate-300 !border-2 !border-[#07090e] rounded-full" 
      />

      {/* Glow highlight strip */}
      <div className={clsx(
        "h-1 w-full",
        isVeto ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-600" :
        isInjection ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" :
        isPrompt ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" :
        isLLM ? "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" :
        "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600"
      )} />

      {/* Node Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className={clsx(
            "p-1.5 rounded-lg border",
            isVeto ? "bg-red-500/20 border-red-500/40 text-red-400" :
            isInjection ? "bg-amber-500/20 border-amber-500/40 text-amber-400" :
            isPrompt ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" :
            isLLM ? "bg-purple-500/20 border-purple-500/40 text-purple-400" :
            "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
          )}>
            {isVeto ? <ShieldAlert className="w-4 h-4" /> :
             isInjection ? <Bug className="w-4 h-4" /> :
             isPrompt ? <Terminal className="w-4 h-4" /> :
             isLLM ? <Cpu className="w-4 h-4" /> :
             <Code className="w-4 h-4" />}
          </div>

          <div>
            <div className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              {data.label}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isVeto ? "Target Action (Blocked)" :
               isInjection ? "Untrusted External Data" :
               isPrompt ? "Initial User Instruction" :
               isLLM ? "Model Chain of Thought" :
               "Autonomous Tool Execution"}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {isVeto && (
            <span className="px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
              VETO
            </span>
          )}
          <MousePointerClick className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {data.content && (
          <div className="p-2.5 rounded-xl bg-[#06080e]/90 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap select-text">
            {data.content}
          </div>
        )}

        {data.tool_name && (
          <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 font-semibold">Sink Function:</span>
            <span className={clsx(
              "px-2 py-0.5 rounded font-bold border",
              isVeto ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
            )}>
              {data.tool_name}()
            </span>
          </div>
        )}

        {/* Veto Alert Banner */}
        {data.status === 'VETOED' && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/80 to-rose-950/80 border border-red-500/50 flex items-center space-x-2.5 shadow-inner">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="text-[10px] font-mono text-red-200">
              <span className="font-bold text-red-400">POLICY INVARIANT HIT:</span> Execution halted before sandbox mutation.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3.5 !h-3.5 !-bottom-1.5 !bg-slate-300 !border-2 !border-[#07090e] rounded-full" 
      />
    </div>
  );
};

const nodeTypes = {
  user_prompt: (props) => <CustomNode {...props} type="user_prompt" />,
  injection_source: (props) => <CustomNode {...props} type="injection_source" />,
  llm_reasoning: (props) => <CustomNode {...props} type="llm_reasoning" />,
  tool_execution: (props) => <CustomNode {...props} type="tool_execution" />,
  veto_sink: (props) => <CustomNode {...props} type="veto_sink" />
};

export default function TraceGraph({ dag, evaluation, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!dag || !dag.nodes) return;

    // Transform backend DAG into React Flow nodes
    const rfNodes = dag.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position_x, y: n.position_y },
      data: {
        label: n.label,
        content: n.content,
        tool_name: n.tool_name,
        status: n.status
      }
    }));

    // Transform backend DAG into React Flow edges with colored markers
    const rfEdges = dag.edges.map((e, idx) => {
      const isRed = e.color === 'red';
      const isAmber = e.color === 'amber';
      const strokeColor = isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#6366f1';

      return {
        id: `edge-${e.source}-${e.target}-${idx}`,
        source: e.source,
        target: e.target,
        animated: e.animated,
        style: {
          stroke: strokeColor,
          strokeWidth: e.animated ? 2.5 : 1.5,
          strokeDasharray: e.animated ? '6,6' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 20,
          height: 20
        }
      };
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [dag]);

  return (
    <div className="w-full h-full bg-[#07090e] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="bg-[#07090e]"
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'veto_sink') return '#ef4444';
            if (n.type === 'injection_source') return '#f59e0b';
            if (n.type === 'user_prompt') return '#6366f1';
            if (n.type === 'llm_reasoning') return '#a855f7';
            return '#10b981';
          }}
          maskColor="rgba(7, 9, 14, 0.85)"
          className="!bg-[#0a0e17] !border !border-slate-800 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
