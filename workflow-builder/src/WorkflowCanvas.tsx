import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { Background, addEdge, applyNodeChanges, applyEdgeChanges, useReactFlow } from 'reactflow';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';
import { UserQueryNode, LLMNode, KnowledgeNode, OutputNode } from './nodes/Nodes';
import ChatPanel from './ChatPanel';
import { Plus, Minus, Maximize, ChevronDown, Play, MousePointer2, Save } from 'lucide-react';
import './WorkflowCanvas.css';

const nodeTypes = { trigger: UserQueryNode, action: LLMNode, condition: KnowledgeNode, output: OutputNode };

const fitViewOptions = { padding: 0.2, maxZoom: 1 };

const ZoomPill = () => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [val, setVal] = useState(100);
  useEffect(() => {
    const i = setInterval(() => setVal(Math.round(getZoom() * 100)), 300);
    return () => clearInterval(i);
  }, [getZoom]);

  return (
    <div className="zoom-pill">
      <button onClick={() => zoomIn()}><Plus size={18} /></button>
      <div className="sep" />
      <button onClick={() => zoomOut()}><Minus size={18} /></button>
      <div className="sep" />
      <button onClick={() => fitView(fitViewOptions)}><Maximize size={16} /></button>
      <div className="sep" />
      <div className="zoom-val">{val}% <ChevronDown size={14} /></div>
    </div>
  );
};

const WorkflowCanvas = ({ initialNodes, initialEdges, onSaveRequest, chatOpen, setChatOpen }: any) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { project } = useReactFlow();

  useEffect(() => { setNodes(initialNodes); setEdges(initialEdges); }, [initialNodes, initialEdges]);

  const onNodesChange: OnNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange: OnEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);
  const onConnect: OnConnect = useCallback((p) => setEdges((eds) => addEdge({ ...p, animated: true }, eds)), []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !wrapper.current) return;
    const b = wrapper.current.getBoundingClientRect();
    const pos = project({ x: e.clientX - b.left, y: e.clientY - b.top });
    
    // Singleton check logic
    if (['trigger', 'action', 'output'].includes(type) && nodes.some(n => n.type === type)) {
        alert(`Only one ${type} node is allowed.`);
        return;
    }

    setNodes((nds) => nds.concat({ id: Date.now().toString(), type, position: pos, data: { label: type, query: '', topK: 4, model: 'gemini-pro', systemPrompt: '', temperature: 0.7 } }));
  };

  return (
    <div className="canvas-root" ref={wrapper} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div className="canvas-header-actions">
        <button className="btn-save-workflow" onClick={() => onSaveRequest(nodes, edges)}>
          <Save size={16} /> Save
        </button>
        <div className="user-av-circle">S</div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        deleteKeyCode={["Backend", "Delete"]} // Support both keyboard types
        multiSelectionKeyCode="Control"
        selectionKeyCode="Shift"
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <ZoomPill />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="canvas-empty-state">
          <div className="empty-ico-box">
            <div className="mock-node-rect"><MousePointer2 size={24} className="ptr-ico" /></div>
          </div>
          <p>Drag & drop to get started</p>
        </div>
      )}

      <button className="fab-run-stack" onClick={() => setChatOpen(true)}>
        <Play size={20} fill="white" />
      </button>
      {chatOpen && <ChatPanel nodes={nodes} edges={edges} onClose={() => setChatOpen(false)} />}
    </div>
  );
};
export default WorkflowCanvas;