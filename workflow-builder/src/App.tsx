import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowCanvas from './WorkflowCanvas';
import ComponentLibrary from './ComponentLibrary';
import Dashboard from './Dashboard';
import { X } from 'lucide-react';
import './App.css';

const App = () => {
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [stacks, setStacks] = useState([]);
  const [currentStack, setCurrentStack] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Metadata Dialog State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    const res = await fetch('http://localhost:8000/workflows');
    const data = await res.json();
    setStacks(data);
  };
  useEffect(() => { load(); }, []);

  const openMetaDialog = (stack?: any) => {
    setName(stack?.name || "");
    setDesc(stack?.description || "");
    setModalOpen(true);
  };

  const handleApplyMetadata = () => {
    if (!name.trim()) return alert("Name is required");
    if (view === 'dashboard') {
      // Logic for "New Stack"
      setCurrentStack({ name, description: desc, nodes: [], edges: [] });
      setView('builder');
    } else {
      // Logic for "Edit Metadata" inside builder
      setCurrentStack({ ...currentStack, name, description: desc });
    }
    setModalOpen(false);
  };

  const handleSaveToDB = async (nodes: any[], edges: any[]) => {
    const isUpdate = !!currentStack.id;
    const url = isUpdate ? `http://localhost:8000/workflows/${currentStack.id}` : 'http://localhost:8000/workflows';

    // Payload includes metadata + node logic
    const payload = { ...currentStack, nodes, edges };

    const res = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      load();
      setView('dashboard');
      setCurrentStack(null);
    }
  };

  if (view === 'dashboard') {
    return (
      <div className="app-viewport">
        <Dashboard
          stacks={stacks}
          onSelect={(s) => { setCurrentStack(s); setView('builder'); }}
          onCreateNew={() => openMetaDialog()}
        />
        {modalOpen && (
          <div className="m-overlay">
            <div className="m-card">
              <div className="m-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/logo.png" alt="Logo" className="logo-img-sm" />
                  <h3>Create New Stack</h3>
                </div>
                <X className="m-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="m-body">
                <div className="m-field">
                  <label>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chat with PDF" />
                </div>
                <div className="m-field">
                  <label>Description</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Summarize your stack..." rows={3} />
                </div>
              </div>
              <div className="m-footer">
                <button className="btn-sec" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-pri" onClick={handleApplyMetadata}>Create</button>
              </div>
            </div>
          </div>
        )
        }
      </div >
    );
  }

  return (
    <div className="builder-viewport">
      <ReactFlowProvider>
        <ComponentLibrary
          stackName={currentStack?.name}
          onBack={() => setView('dashboard')}
          onOpenChat={() => setChatOpen(true)}
          onEditTitle={() => openMetaDialog(currentStack)}
        />
        <WorkflowCanvas
          initialNodes={currentStack?.nodes || []}
          initialEdges={currentStack?.edges || []}
          onSaveRequest={handleSaveToDB}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
        />
      </ReactFlowProvider>

      {modalOpen && (
        <div className="m-overlay">
          <div className="m-card">
            <div className="m-header"><h3>Edit Details</h3><X className="m-close" onClick={() => setModalOpen(false)} /></div>
            <div className="m-body">
              <div className="m-field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="m-field"><label>Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
            </div>
            <div className="m-footer">
              <button className="btn-pri" onClick={handleApplyMetadata}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;