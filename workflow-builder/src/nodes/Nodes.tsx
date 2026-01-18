import { Handle, Position, useReactFlow } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Sparkles, Database, Settings, Upload, Trash2, LogIn, LogOut } from 'lucide-react';
import './Nodes.css';
import React from 'react';

// --- Shared Header Component for Deletion ---
const NodeHeader = ({ title, icon: Icon, id }: { title: string, icon: any, id: string }) => {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="node-header">
      <div className="node-header-title">
        <Icon size={14} className="text-gray-600" />
        <span>{title}</span>
      </div>
      <div className="node-header-actions">
        <Trash2 size={12} className="node-trash-icon nodrag" onClick={onDelete} />
        <Settings size={12} className="node-settings-icon" />
      </div>
    </div>
  );
};

export const UserQueryNode = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  return (
    <div className="custom-node-card">
      <NodeHeader title="User Input" icon={LogIn} id={id} />
      <div className="node-sub-info">Enter point for querys</div>
      <div className="node-content">
        <label className="node-label-small">Query</label>
        <textarea
          className="node-input nodrag"
          rows={3}
          value={data.query || ''}
          onChange={(e) => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, query: e.target.value } } : n))}
          placeholder="Write your query here"
        />
      </div>
      <div className="node-footer-status text-orange">Query</div>
      <Handle type="source" position={Position.Right} className="custom-handle handle-query" />
    </div>
  );
};

export const KnowledgeNode = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [uploading, setUploading] = React.useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Upload failed");

      setNodes(nds => nds.map(n => n.id === id ? {
        ...n,
        data: { ...n.data, filename: file.name, documentId: json.document_id }
      } : n));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="custom-node-card">
      <NodeHeader title="Knowledge Base" icon={Database} id={id} />
      <div className="node-sub-info">Let LLM search info in your file</div>
      <div className="node-content">
        <label className="node-label-small">File for Knowledge Base</label>
        {data.filename ? (
          <div className="file-box-active">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.filename}</span>
            <Trash2 size={14} className="trash-ico" onClick={() => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, filename: '' } } : n))} />
          </div>
        ) : (
          <label className="file-upload-dashed">
            <input type="file" hidden onChange={onFile} accept=".pdf" />
            <Upload size={14} /> <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          </label>
        )}
      </div>
      <div className="node-footer-status text-blue">Context</div>
      <Handle type="target" position={Position.Left} className="custom-handle" id="query-in" />
      <Handle type="source" position={Position.Right} className="custom-handle handle-context" />
    </div>
  );
};

export const LLMNode = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  return (
    <div className="custom-node-card">
      <NodeHeader title="LLM (Gemini)" icon={Sparkles} id={id} />
      <div className="node-sub-info">Run a query with Gemini LLM</div>
      <div className="node-content">
        <div className="node-input-group">
          <label className="node-label-small">System Prompt</label>
          <textarea
            className="node-input nodrag"
            rows={4}
            value={data.systemPrompt || ''}
            onChange={(e) => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, systemPrompt: e.target.value } } : n))}
            placeholder="You are a helpful assistant..."
          />
        </div>
      </div>
      <div className="node-footer-status text-purple">Output</div>
      <Handle type="target" position={Position.Left} className="custom-handle" style={{ top: '40%' }} id="query" />
      <Handle type="target" position={Position.Left} className="custom-handle" style={{ top: '60%' }} id="context" />
      <Handle type="source" position={Position.Right} className="custom-handle handle-output" />
    </div>
  );
};

export const OutputNode = ({ id }: NodeProps) => (
  <div className="custom-node-card">
    <NodeHeader title="Output" icon={LogOut} id={id} />
    <div className="node-sub-info">Output of the result nodes as text</div>
    <div className="node-content">
      <label className="node-label-small">Output Text</label>
      <div className="node-field-mock">Output will be generated based on query</div>
    </div>
    <div className="node-footer-status text-green-500">Output</div>
    <Handle type="target" position={Position.Left} className="custom-handle" />
  </div>
);