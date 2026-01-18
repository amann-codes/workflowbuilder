const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  // Workflow CRUD
  getWorkflows: () => fetch(`${API_BASE_URL}/workflows`).then(res => res.json()),
  
  createWorkflow: (data: any) => fetch(`${API_BASE_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  updateWorkflow: (id: number, data: any) => fetch(`${API_BASE_URL}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // File Upload
  uploadFile: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: fd
    }).then(res => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
    });
  },

  // Execution
  runWorkflow: (query: string, nodes: any[], edges: any[]) => fetch(`${API_BASE_URL}/run-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, workflow: { nodes, edges } })
  }).then(res => res.json())
};