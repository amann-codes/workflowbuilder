import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowCanvas from './WorkflowCanvas';
import ComponentLibrary from './ComponentLibrary';
import Dashboard from './Dashboard';
import { api } from './api'; // Import our new service
import { X } from 'lucide-react';
import './App.css';

const App = () => {
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [stacks, setStacks] = useState([]);
  const [currentStack, setCurrentStack] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    try {
        const data = await api.getWorkflows();
        setStacks(data);
    } catch (err) {
        console.error("Failed to load stacks", err);
    }
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
      setCurrentStack({ name, description: desc, nodes: [], edges: [] });
      setView('builder');
    } else {
      setCurrentStack({ ...currentStack, name, description: desc });
    }
    setModalOpen(false);
  };

  const handleSaveToDB = async (nodes: any[], edges: any[]) => {
    const payload = { ...currentStack, nodes, edges };
    const res = currentStack.id 
        ? await api.updateWorkflow(currentStack.id, payload)
        : await api.createWorkflow(payload);

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
                <h3>Create New Stack</h3>
                <X className="m-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="m-body">
                <div className="m-field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="m-field"><label>Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
              </div>
              <div className="m-footer">
                <button className="btn-pri" onClick={handleApplyMetadata}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div >
    );
  }

  return (
    <div className="builder-viewport">
      <ReactFlowProvider>
        <ComponentLibrary stackName={currentStack?.name} onBack={() => setView('dashboard')} onOpenChat={() => setChatOpen(true)} onEditTitle={() => openMetaDialog(currentStack)} />
        <WorkflowCanvas initialNodes={currentStack?.nodes || []} initialEdges={currentStack?.edges || []} onSaveRequest={handleSaveToDB} chatOpen={chatOpen} setChatOpen={setChatOpen} />
      </ReactFlowProvider>
    </div>
  );
};
export default App;