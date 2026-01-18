import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import './ChatPanel.css';

const ChatPanel = ({ nodes, edges, onClose }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading]);

  const onSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: msg, workflow: { nodes, edges } })
      });
      const data = await res.json();

      // Check if the answer contains the 429 error string
      if (data.answer.includes("429") || data.answer.includes("Quota Exceeded")) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⚠️ Google API Rate Limit reached. Please wait 60 seconds and try again."
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-backdrop">
      <div className="chat-window">
        <div className="chat-win-header">
          <div className="chat-brand">
            <img src="/logo.png" alt="Logo" className="logo-img-sm" />
            <span>GenAI Stack Chat</span>
          </div>
          <X size={20} className="chat-close" onClick={onClose} />
        </div>

        <div className="chat-win-body">
          {messages.length === 0 ? (
            <div className="chat-empty-msg">
              <img src="/logo.png" alt="Logo" className="logo-img-lg" />
              <h3>GenAI Stack Chat</h3>
              <p>Start a conversation to test your stack.</p>
            </div>
          ) : (
            <div className="chat-msg-list">
              {messages.map((m, i) => (
                <div key={i} className={`chat-line ${m.role}`}>
                  <div className={`chat-av ${m.role}`}>
                    {m.role === 'assistant' ? <img src="/logo.png" alt="Logo" style={{ width: '20px' }} /> : '👤'}
                  </div>
                  <div className="chat-bubble-text">{m.content}</div>
                </div>
              ))}
              {loading && <div className="chat-line assistant"><div className="chat-av assistant"><img src="/logo.png" alt="Logo" style={{ width: '20px' }} /></div><div className="chat-bubble-text typing">Thinking...</div></div>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="chat-win-footer">
          <div className="chat-input-bar">
            <input type="text" placeholder="Send a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} />
            <Send size={18} className={`send-btn ${input ? 'active' : ''}`} onClick={onSend} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPanel;