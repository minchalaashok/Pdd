import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, PhoneCall, HeartHandshake } from 'lucide-react';
import { fetchApi } from '../services/api';

export const AiChatbotModal = ({ isOpen, onClose, onOpenSos }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '👋 Hello! I am **LifeLink AI Medical Assistant**. How can I assist you with organ matching, emergency blood requests, or donor eligibility today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    const res = await fetchApi('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: userMsg })
    });

    if (res.success && res.answer) {
      setMessages(prev => [...prev, { sender: 'ai', text: res.answer }]);
    } else {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to assist with organ donation rules, blood group compatibility, and emergency SOS requests!' }]);
    }
    setLoading(false);
  };

  const handleChipClick = (chipText) => {
    setInput(chipText);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="glass-card modal-content" style={{ width: '90%', maxWidth: 520, height: 600, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: '50%' }}>
              <Bot size={22} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>LifeLink AI Assistant</h3>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> 24/7 Intelligent Donor & Triage Guidance
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, overflowX: 'auto' }}>
          <button className="badge badge-info" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => handleChipClick('Blood donation eligibility guidelines')}>
            🩸 Eligibility Rules
          </button>
          <button className="badge badge-danger" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => handleChipClick('Check blood group compatibility')}>
            💉 Blood Compatibility
          </button>
          <button className="badge badge-success" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => handleChipClick('Organ donation consent info')}>
            🫀 Organ Registry
          </button>
          <button className="badge badge-warning" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => handleChipClick('Trigger emergency SOS assistance')}>
            🚨 Emergency SOS
          </button>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: m.sender === 'user' ? 'white' : 'var(--text-main)',
                padding: '12px 16px',
                borderRadius: 16,
                fontSize: '0.9rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🤖 Thinking & analyzing medical query...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about organ matching, blood stock, or emergency..."
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 18px' }} disabled={loading}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};
