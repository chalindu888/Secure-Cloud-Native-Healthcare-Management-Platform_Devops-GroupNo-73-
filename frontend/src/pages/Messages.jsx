import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../hooks/useAmbulanceData';
import Avatar from '../components/Avatar';
import { MessageCircle, Send, Check, CheckCheck, CalendarPlus, AlertTriangle } from 'lucide-react';

// Online chat between a patient and a doctor they have an appointment with.
// New messages arrive by checking the server every few seconds while this page is open.
// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' };
const THREAD_POLL_MS = 3000;
const LIST_POLL_MS = 8000;

const clock = (value) => new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const dayLabel = (value) => {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};
const shortTime = (value) => {
  const d = new Date(value);
  return d.toDateString() === new Date().toDateString() ? clock(value) : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const Messages = () => {
  const { role } = useAuth();
  const isPatient = role === 'patient';
  const [params, setParams] = useSearchParams();
  const wantedId = Number(params.get('with')) || null;

  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [activeId, setActiveId] = useState(wantedId);

  const [thread, setThread] = useState({ other: null, messages: [], seenUpTo: 0 });
  const [threadError, setThreadError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const bottomRef = useRef(null);
  const stickToBottom = useRef(true);
  const lastIdRef = useRef(0);

  const loadList = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations || []);
      setListError('');
    } catch (err) {
      setListError(errorText(err, 'Unable to load your conversations.'));
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
    const timer = setInterval(() => { if (!document.hidden) loadList(); }, LIST_POLL_MS);
    return () => clearInterval(timer);
  }, [loadList]);

  // Start on the requested person, otherwise on the most recent conversation
  useEffect(() => {
    if (activeId || conversations.length === 0) return;
    setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  // Load a conversation and then keep it fresh
  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    setThread({ other: null, messages: [], seenUpTo: 0 });
    setThreadError('');
    setSendError('');
    lastIdRef.current = 0;
    stickToBottom.current = true;

    const poll = async (initial) => {
      try {
        const { data } = await api.get(`/messages/with/${activeId}`, { params: { after: initial ? 0 : lastIdRef.current } });
        if (cancelled) return;
        setThreadError('');
        setThread((prev) => {
          const known = new Set(prev.messages.map((m) => m.id));
          const fresh = data.messages.filter((m) => !known.has(m.id));
          return { other: data.other, seenUpTo: data.seenUpTo, messages: fresh.length ? [...prev.messages, ...fresh] : prev.messages };
        });
        if (data.messages.length) lastIdRef.current = data.messages[data.messages.length - 1].id;
        if (data.messages.some((m) => !m.mine)) loadList();
      } catch (err) {
        if (!cancelled) setThreadError(errorText(err, 'Unable to load this conversation.'));
      }
    };
    poll(true);
    const timer = setInterval(() => { if (!document.hidden) poll(false); }, THREAD_POLL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [activeId, loadList]);

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.messages.length]);

  const choose = (id) => {
    setActiveId(id);
    setDraft('');
    setParams({ with: String(id) }, { replace: true });
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !activeId) return;
    setSending(true);
    setSendError('');
    try {
      const { data } = await api.post(`/messages/with/${activeId}`, { body: text });
      stickToBottom.current = true;
      setDraft('');
      setThread((prev) => (prev.messages.some((m) => m.id === data.message.id) ? prev : { ...prev, messages: [...prev.messages, data.message] }));
      lastIdRef.current = Math.max(lastIdRef.current, data.message.id);
      loadList();
    } catch (err) {
      setSendError(errorText(err, 'Unable to send your message.'));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const lastMine = [...thread.messages].reverse().find((m) => m.mine);
  const gradient = isPatient ? 'linear-gradient(135deg, #14b8a6, #0ea5e9)' : 'linear-gradient(135deg, #3b82f6, #6366f1)';
  const nameOf = (c) => (isPatient && !/^dr\.?\s/i.test(c.name || '') ? `Dr. ${c.name}` : c.name);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>{isPatient ? 'Patient Portal' : 'Doctor Portal'}</span>
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">{isPatient ? 'Chat online with the doctors you have booked.' : 'Chat online with your patients.'}</p>
      </div>

      <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.9rem', background: '#fef3c7', color: '#92400e', fontSize: '0.84rem', fontWeight: 600 }}>
        <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <span>Doctors may not reply straight away. For an emergency call 0912525256 or request an <Link to="/ambulances" style={{ color: '#92400e', textDecoration: 'underline' }}>ambulance</Link>.</span>
      </p>

      {listError && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{listError}</p>}

      {!listLoading && conversations.length === 0 ? (
        <div style={{ ...card, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <MessageCircle size={40} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>No one to chat with yet</h3>
          <p style={{ margin: '0.35rem auto 1rem', maxWidth: '26rem', fontSize: '0.88rem', color: '#64748b' }}>
            {isPatient ? 'You can message a doctor once you have booked an appointment with them.' : 'You can message a patient once they have booked an appointment with you.'}
          </p>
          {isPatient && <Link to="/patient/book" className="btn btn-primary"><CalendarPlus size={17} /> Book an appointment</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'stretch' }}>
          {/* People */}
          <aside aria-label="Conversations" style={{ ...card, flex: '0 0 20rem', maxWidth: '100%', padding: '0.6rem', alignSelf: 'flex-start', maxHeight: '36rem', overflowY: 'auto' }}>
            {listLoading && <p style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>Loading...</p>}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: 0, padding: 0, listStyle: 'none' }}>
              {conversations.map((c) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button" onClick={() => choose(c.id)} aria-current={active ? 'true' : undefined}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.75rem', textAlign: 'left', cursor: 'pointer', borderRadius: '0.9rem', border: `1px solid ${active ? '#c7d2fe' : 'transparent'}`, background: active ? '#eef2ff' : 'transparent' }}
                    >
                      <Avatar name={c.name} size="2.8rem" gradient={gradient} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nameOf(c)}</span>
                          {c.lastAt && <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>{shortTime(c.lastAt)}</span>}
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '0.78rem', color: c.unread ? '#0f172a' : '#64748b', fontWeight: c.unread ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.lastBody ? `${c.lastIsMine ? 'You: ' : ''}${c.lastBody}` : (c.specialty || 'Start a conversation')}
                          </span>
                          {c.unread > 0 && <span aria-label={`${c.unread} unread`} style={{ minWidth: '1.2rem', height: '1.2rem', padding: '0 0.35rem', borderRadius: '999px', background: '#4f46e5', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Conversation */}
          <section aria-label="Conversation" style={{ ...card, flex: '1 1 26rem', minWidth: 0, display: 'flex', flexDirection: 'column', height: 'min(36rem, 75vh)', overflow: 'hidden' }}>
            {thread.other ? (
              <>
                <header style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.85rem 1.1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <Avatar name={thread.other.name} size="2.6rem" gradient={gradient} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nameOf(thread.other)}</p>
                    <p style={{ fontSize: '0.76rem', color: '#64748b' }}>{isPatient ? (thread.other.specialty || 'Doctor') : 'Patient'}</p>
                  </div>
                </header>

                <div onScroll={onScroll} role="log" aria-live="polite" aria-label="Messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#ffffff' }}>
                  {thread.messages.length === 0 && (
                    <p style={{ margin: 'auto', textAlign: 'center', fontSize: '0.88rem', color: '#94a3b8' }}>No messages yet. Say hello below.</p>
                  )}
                  {thread.messages.map((m, i) => {
                    const prev = thread.messages[i - 1];
                    const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                    return (
                      <React.Fragment key={m.id}>
                        {newDay && <p style={{ alignSelf: 'center', margin: '0.5rem 0', padding: '0.15rem 0.7rem', borderRadius: '999px', background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>{dayLabel(m.createdAt)}</p>}
                        <div style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
                          <div style={{ padding: '0.55rem 0.85rem', borderRadius: m.mine ? '1.1rem 1.1rem 0.3rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.3rem', background: m.mine ? '#4f46e5' : '#f1f5f9', color: m.mine ? '#ffffff' : '#0f172a', fontSize: '0.92rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                            <span style={{ color: m.mine ? '#ffffff' : '#0f172a' }}>{m.body}</span>
                          </div>
                          <p style={{ marginTop: '0.15rem', display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                            {clock(m.createdAt)}
                            {m.mine && lastMine && m.id === lastMine.id && (
                              m.id <= thread.seenUpTo
                                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', color: '#4f46e5', fontWeight: 700 }}><CheckCheck size={13} /> Seen</span>
                                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}><Check size={13} /> Sent</span>
                            )}
                          </p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {(threadError || sendError) && <p role="alert" style={{ margin: '0 1.1rem 0.5rem', padding: '0.55rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{sendError || threadError}</p>}

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <textarea
                    value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown}
                    rows={1} maxLength={2000} aria-label="Type your message" placeholder="Type a message. Press Enter to send."
                    style={{ flex: 1, resize: 'none', maxHeight: '7rem', padding: '0.65rem 0.9rem', borderRadius: '1rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.92rem', lineHeight: 1.4 }}
                  />
                  <button type="button" onClick={send} disabled={sending || !draft.trim()} aria-label="Send message"
                    style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', border: 'none', cursor: draft.trim() ? 'pointer' : 'not-allowed', background: draft.trim() ? '#4f46e5' : '#c7d2fe', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            ) : (
              <p style={{ margin: 'auto', color: '#94a3b8', fontSize: '0.92rem' }}>{threadError || (activeId ? 'Loading...' : 'Choose someone to chat with.')}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Messages;
