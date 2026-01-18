import { Plus, ExternalLink } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  stacks: any[];
  onSelect: (stack: any) => void;
  onCreateNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stacks, onSelect, onCreateNew }) => {
  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <div className="dash-brand">
          <img src="/logo.png" alt="Logo" className="logo-img-sm" />
          <span>GenAI Stack</span>
        </div>
      </header>

      <main className="dash-body">
        <div className="dash-title-section">
          <h1>My Stacks</h1>
          <button className="btn-add" onClick={onCreateNew}>
            <Plus size={18} /> New Stack
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="dash-empty-container">
            <div className="dash-empty-card">
              <img src="/logo.png" alt="Logo" className="logo-img-lg" />
              <h2>Create New Stack</h2>
              <p>Start building your generative AI apps with our essential tools and frameworks</p>
              <button className="btn-add-large" onClick={onCreateNew}>
                <Plus size={18} /> New Stack
              </button>
            </div>
          </div>
        ) : (
          <div className="stacks-grid">
            {stacks.map((s) => (
              <div key={s.id} className="stack-card">
                <div className="stack-card-content">
                  <h3>{s.name}</h3>
                  <p>{s.description || "No description"}</p>
                </div>
                <div className="stack-card-footer">
                  <button className="btn-edit" onClick={() => onSelect(s)}>
                    Edit Stack <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;