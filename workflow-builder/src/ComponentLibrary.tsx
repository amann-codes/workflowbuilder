import { MessageSquare, Sparkles, Database, Send, ChevronRight, ChevronLeft, Menu } from 'lucide-react';
import './ComponentLibrary.css';

const nodeDefs = [
  { type: 'trigger', label: 'User Query', icon: <MessageSquare size={18} /> },
  { type: 'action', label: 'LLM (OpenAI)', icon: <Sparkles size={18} /> },
  { type: 'condition', label: 'Knowledge Base', icon: <Database size={18} /> },
  { type: 'output', label: 'Output', icon: <Send size={18} /> },
];

const ComponentLibrary = ({ stackName, onBack, onOpenChat, onEditTitle }: any) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={onBack}>
        <ChevronLeft size={20} />
        <img src="/logo.png" alt="Logo" className="logo-img-sm" />
        <span>GenAI Stack</span>
      </div>

      <div className="sidebar-actions">
        <div className="btn-chat-ai-top" onClick={onOpenChat}>
          <MessageSquare size={18} />
          <span>Chat With AI</span>
          <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      <div className="sidebar-stack-info" onClick={onEditTitle}>
        <span>{stackName || "Untitled Stack"}</span>
        <ChevronRight size={14} color="#94a3b8" />
      </div>

      <div className="sidebar-body">
        <label className="sidebar-label">Components</label>
        <div className="drag-list">
          {nodeDefs.map((n) => (
            <div key={n.type} className="drag-item" draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', n.type)}>
              <div className="drag-item-left">
                <span className="icon-wrap">{n.icon}</span>
                <span>{n.label}</span>
              </div>
              <Menu size={16} color="#cbd5e1" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
export default ComponentLibrary;