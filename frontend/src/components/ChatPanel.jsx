import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import hospitalIcon from '../assets/hospital-icon.png';
import { ArrowUp, Paperclip, X, ShieldCheck, Stethoscope, ImageIcon, Activity } from 'lucide-react';

// Free-text chat with the HealthOps assistant (POST /api/chat). Inline styles are used because
// the global reset in index.css zeroes Tailwind spacing utilities.

const TEAL = '#1f93a8';
const INK = '#16232b';
const MUTED = '#5b6b75';
const LINE = '#d6e0e5';

const SUGGESTIONS = [
  'How do I book an appointment?',
  'Which doctors do you have?',
  'What services and centres do you offer?',
  'How can I contact the hospital?',
  'I need an ambulance',
];

const CARDS = [
  { icon: ShieldCheck, title: 'Professional support', text: 'Clear answers designed for a hospital help desk experience.' },
  { icon: Stethoscope, title: 'Hospital knowledge', text: 'Answers based on our services, centres, doctors and contact details.' },
  { icon: ImageIcon, title: 'Image input', text: 'Attach a photo or prescription and ask about it.' },
];

// Shrink a photo before upload: max 1024px, JPEG, small enough for the API
const prepareImage = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) { reject(new Error('Please choose an image file.')); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    let quality = 0.8;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length > 700000 && quality > 0.3) { quality -= 0.15; dataUrl = canvas.toDataURL('image/jpeg', quality); }
    if (dataUrl.length > 700000) { reject(new Error('That image is too large. Please choose a smaller one.')); return; }
    resolve({ mediaType: 'image/jpeg', data: dataUrl.split(',')[1], preview: dataUrl });
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
  img.src = url;
});

const ChatPanel = ({ onNavigate, onOpenChecker }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiOn, setAiOn] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/chat/status').then(({ data }) => setAiOn(Boolean(data.ai))).catch(() => setAiOn(null));
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages, loading]);

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const attached = image;
    const nextMessages = [...messages, { role: 'user', content: text, preview: attached?.preview }];
    setMessages(nextMessages);
    setInput('');
    setImage(null);
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat', {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        image: attached ? { mediaType: attached.mediaType, data: attached.data } : undefined,
      }, { timeout: 60000 });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, links: data.links, suggestChecker: data.suggestChecker }]);
    } catch (err) {
      setError(err.response?.data?.error || (err.response ? 'Something went wrong. Please try again.' : 'Cannot connect to the server. Please try again, or call us.'));
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try { setImage(await prepareImage(file)); setError(''); } catch (err) { setError(err.message); }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const empty = messages.length === 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#f8fafb' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.25rem clamp(1rem, 3vw, 2rem)' }} aria-live="polite">
        {empty ? (
          <div style={{ maxWidth: '40rem', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '999px', background: '#e8eef2', fontSize: '0.8rem', fontWeight: 800, color: INK }}>Healthcare guidance with hospital context</span>
            <div style={{ width: '4.5rem', height: '4.5rem', margin: '1rem auto', borderRadius: '1.2rem', background: '#fff', boxShadow: '0 6px 20px rgba(15,23,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={hospitalIcon} alt="" style={{ width: '3.2rem', height: '3.2rem', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: INK, lineHeight: 1.15 }}>How can I assist you today?</h2>
            <p style={{ margin: '0.6rem auto 1.4rem', maxWidth: '30rem', color: MUTED, lineHeight: 1.6 }}>Ask about services, centres, doctors, appointments and ambulances, or attach a photo to ask about it.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11.5rem, 1fr))', gap: '0.7rem', textAlign: 'left', marginBottom: '1.25rem' }}>
              {CARDS.map(({ icon: Icon, title, text }) => (
                <div key={title} style={{ padding: '0.9rem 1rem', borderRadius: '1.1rem', background: '#eef2f5', border: `1px solid ${LINE}` }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.92rem', color: INK }}><Icon size={17} /> {title}</p>
                  <p style={{ marginTop: '0.3rem', fontSize: '0.8rem', lineHeight: 1.5, color: MUTED }}>{text}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} style={{ padding: '0.5rem 0.95rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, border: `1px solid ${LINE}`, background: '#fff', color: INK }}>{s}</button>
              ))}
            </div>
            <button type="button" onClick={onOpenChecker} style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', border: 'none', background: 'transparent', color: TEAL, fontWeight: 800, fontSize: '0.88rem' }}>
              <Activity size={16} /> Check my symptoms step by step
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: '44rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {messages.map((m, i) => {
              const mine = m.role === 'user';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: mine ? '1.1rem 1.1rem 0.3rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.3rem', background: mine ? TEAL : '#ffffff', color: mine ? '#ffffff' : INK, border: mine ? 'none' : `1px solid ${LINE}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                    {m.preview && <img src={m.preview} alt="Attached" style={{ display: 'block', maxWidth: '100%', maxHeight: '12rem', borderRadius: '0.7rem', marginBottom: '0.5rem' }} />}
                    <p style={{ fontSize: '0.93rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: mine ? '#ffffff' : INK }}>{m.content}</p>
                    {(m.links?.length > 0 || m.suggestChecker) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {m.links?.map((l) => (
                          <Link key={l.to} to={l.to} onClick={onNavigate} className="btn btn-secondary btn-sm">{l.label}</Link>
                        ))}
                        {m.suggestChecker && <button type="button" onClick={onOpenChecker} className="btn btn-primary btn-sm" style={{ background: TEAL }}>Open Symptom Checker</button>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{ padding: '0.85rem 1.1rem', borderRadius: '1.1rem 1.1rem 1.1rem 0.3rem', background: '#fff', border: `1px solid ${LINE}`, display: 'flex', gap: '0.3rem' }} aria-label="The assistant is typing">
                  {[0, 1, 2].map((d) => <span key={d} className="aidoc-dot" style={{ animationDelay: `${d * 0.18}s` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{ padding: '0.75rem clamp(1rem, 3vw, 2rem) 0.9rem', background: '#ffffff', borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          {error && <p role="alert" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: '#991b1b', background: '#fee2e2' }}>{error}</p>}
          {image && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
              <img src={image.preview} alt="Attached preview" style={{ height: '4rem', borderRadius: '0.6rem', display: 'block' }} />
              <button type="button" onClick={() => setImage(null)} aria-label="Remove image" style={{ position: 'absolute', top: '-0.4rem', right: '-0.4rem', width: '1.4rem', height: '1.4rem', borderRadius: '50%', cursor: 'pointer', border: 'none', background: INK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '0.5rem 0.5rem 0.5rem 1rem', borderRadius: '1.3rem', border: `1px solid ${LINE}`, background: '#fbfcfd' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="Message HealthOps AI"
              aria-label="Message HealthOps AI"
              style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent', color: INK, fontSize: '0.95rem', lineHeight: 1.5, padding: '0.45rem 0', maxHeight: '7rem', fontFamily: 'inherit' }}
            />
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach an image" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', cursor: 'pointer', border: `1px solid ${LINE}`, background: '#e9eff3', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Paperclip size={18} /></button>
            <button type="button" onClick={() => send()} disabled={loading || !input.trim()} aria-label="Send message" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', cursor: loading || !input.trim() ? 'default' : 'pointer', border: 'none', background: loading || !input.trim() ? '#dde5e9' : TEAL, color: loading || !input.trim() ? '#8a99a3' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={19} /></button>
          </div>
          <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.72rem', lineHeight: 1.5, color: MUTED }}>
            {aiOn === false ? 'Answers come from hospital information. ' : ''}General guidance only, not a diagnosis. In an emergency call 0912525256.
          </p>
        </div>
      </div>

      <style>{`
        .aidoc-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: ${TEAL}; opacity: 0.4; animation: aidoc-bounce 1s infinite ease-in-out; }
        @keyframes aidoc-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .aidoc-dot { animation: none; opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default ChatPanel;
