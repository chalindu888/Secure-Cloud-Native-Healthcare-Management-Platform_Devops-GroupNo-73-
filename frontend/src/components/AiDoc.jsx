import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  SYMPTOMS, BODY_AREAS, DURATIONS, SEVERITIES, RED_FLAGS, symptomLabel, analyse,
} from '../data/aiDoc';
import {
  Bot, X, Check, Activity, User, Stethoscope, FlaskConical, ClipboardList, Crosshair, RotateCcw, ArrowLeft, ArrowRight,
  AlertTriangle, Phone, Siren, CalendarPlus, ShieldCheck, MessageCircle,
} from 'lucide-react';

// Floating "AI DOC" button (above the WhatsApp button) that opens a step-by-step symptom assistant.
// It is rule-based, gives general guidance only and never diagnoses. Inline styles are used because
// the global reset in index.css zeroes Tailwind spacing utilities.

const TEAL = '#1f93a8';
const TEAL_DARK = '#0f6f82';
const TEAL_PALE = '#e3f3f6';
const INK = '#16232b';
const MUTED = '#5b6b75';
const LINE = '#d6e0e5';

const STEPS = [
  { label: 'Symptoms', icon: Activity },
  { label: 'Body Area', icon: Crosshair },
  { label: 'Patient Info', icon: User },
  { label: 'Questions', icon: ClipboardList },
  { label: 'Lab Tests', icon: FlaskConical },
  { label: 'Next Steps', icon: Stethoscope },
];

const emptyAnswers = () => ({
  symptoms: [],
  areas: {},
  name: '', age: '', gender: '', contact: '',
  duration: '', severity: '', redFlags: [],
});

const fieldStyle = {
  width: '100%', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: `1px solid ${LINE}`,
  background: '#ffffff', color: INK, fontSize: '0.95rem',
};
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: INK };

// Simple front-view body. Each region toggles its body area.
const REGION_SHAPES = {
  head: <ellipse cx="100" cy="42" rx="27" ry="32" />,
  neck: <rect x="89" y="72" width="22" height="18" rx="6" />,
  chest: <rect x="62" y="92" width="76" height="66" rx="14" />,
  abdomen: <rect x="66" y="160" width="68" height="50" rx="12" />,
  pelvis: <rect x="66" y="212" width="68" height="36" rx="14" />,
  rightArm: <rect x="26" y="94" width="30" height="140" rx="15" />,
  leftArm: <rect x="144" y="94" width="30" height="140" rx="15" />,
  rightLeg: <rect x="66" y="252" width="32" height="150" rx="16" />,
  leftLeg: <rect x="102" y="252" width="32" height="150" rx="16" />,
};

const BodyMap = ({ selected, onToggle }) => (
  <svg viewBox="0 0 200 410" role="group" aria-label="Body diagram" style={{ width: '100%', maxWidth: '15rem', height: 'auto', display: 'block', margin: '0 auto' }}>
    {Object.entries(REGION_SHAPES).map(([id, shape]) => {
      const on = selected.includes(id) || selected.includes('whole');
      const label = BODY_AREAS.find((a) => a.id === id)?.label;
      return (
        <g
          key={id}
          role="button"
          tabIndex={0}
          aria-pressed={on}
          aria-label={label}
          onClick={() => onToggle(id)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(id); } }}
          style={{ cursor: 'pointer', fill: on ? TEAL : '#cfdde3', stroke: on ? TEAL_DARK : '#9db3bd', strokeWidth: 2, outline: 'none' }}
        >
          <title>{label}</title>
          {shape}
        </g>
      );
    })}
  </svg>
);

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    style={{
      padding: '0.45rem 0.9rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
      border: `1px solid ${active ? TEAL : LINE}`, background: active ? TEAL : '#ffffff', color: active ? '#ffffff' : INK,
    }}
  >
    {children}
  </button>
);

const AiDoc = () => {
  const { user, isAuthenticated, role } = useAuth();
  const { doctors } = useData();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('chat');
  const [step, setStep] = useState(0);
  const [a, setA] = useState(emptyAnswers);
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [error, setError] = useState('');

  // Close with Escape; stop the page behind from scrolling while open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  // Prefill from the signed-in patient the first time the assistant opens
  useEffect(() => {
    if (open && role === 'patient' && user) {
      setA((prev) => ({ ...prev, name: prev.name || user.name || '', contact: prev.contact || user.phone || '' }));
    }
  }, [open, role, user]);

  const chosenSymptoms = useMemo(() => SYMPTOMS.filter((s) => a.symptoms.includes(s.id)), [a.symptoms]);
  const current = activeSymptom && a.symptoms.includes(activeSymptom) ? activeSymptom : chosenSymptoms[0]?.id;
  const result = useMemo(() => (step >= 4 ? analyse(a) : null), [step, a]);

  const set = (key, value) => { setA((prev) => ({ ...prev, [key]: value })); setError(''); };
  const toggleIn = (key, id) => set(key, a[key].includes(id) ? a[key].filter((x) => x !== id) : [...a[key], id]);

  const toggleArea = (areaId) => {
    if (!current) return;
    setA((prev) => {
      const list = prev.areas[current] || [];
      let next;
      if (areaId === 'whole') next = list.includes('whole') ? [] : ['whole'];
      else next = list.includes(areaId) ? list.filter((x) => x !== areaId) : [...list.filter((x) => x !== 'whole'), areaId];
      return { ...prev, areas: { ...prev.areas, [current]: next } };
    });
    setError('');
  };

  const validate = () => {
    if (step === 0 && a.symptoms.length === 0) return 'Please choose at least one symptom.';
    if (step === 1 && chosenSymptoms.some((s) => !(a.areas[s.id]?.length))) return 'Please choose at least one body area for every symptom.';
    if (step === 2) {
      const age = Number(a.age);
      if (!Number.isFinite(age) || age < 0 || age > 120 || a.age === '') return 'Please enter a valid age (0 to 120).';
      if (!a.gender) return 'Please select a gender.';
    }
    if (step === 3 && (!a.duration || !a.severity)) return 'Please tell us how long it has lasted and how severe it is.';
    return '';
  };

  const next = () => {
    const problem = validate();
    if (problem) { setError(problem); return; }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };
  const restart = () => { setA(emptyAnswers()); setStep(0); setError(''); setActiveSymptom(null); };

  const matchingDoctors = useMemo(() => {
    if (!result) return [];
    const wanted = result.specialties.map((s) => s.toLowerCase());
    return doctors.filter((d) => wanted.some((w) => d.specialty.toLowerCase().includes(w))).slice(0, 3);
  }, [result, doctors]);

  const bookTo = (doctorId) => (isAuthenticated
    ? (role === 'patient' ? `/patient/book${doctorId ? `?doctor=${doctorId}` : ''}` : '/doctors')
    : '/register');

  const urgencyBox = {
    emergency: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', title: 'Get urgent medical help now', text: 'Your answers include warning signs. Go to the nearest emergency department, or call an ambulance, right away. Do not wait for an appointment.' },
    soon: { bg: '#fef3c7', border: '#fcd34d', color: '#92400e', title: 'See a doctor soon', text: 'Please arrange to see a doctor in the next day or two, especially if you are getting worse.' },
    routine: { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46', title: 'A routine visit is suitable', text: 'Rest, drink plenty of fluids and book a visit if symptoms continue or you are worried.' },
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the AI DOC symptom assistant"
        style={{
          position: 'fixed', right: '1.25rem', bottom: '6.25rem', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <span style={{ width: '3.75rem', height: '3.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: `2px solid ${TEAL}`, color: TEAL, boxShadow: '0 0 0 5px rgba(251,191,36,0.35), 0 0 26px rgba(251,146,60,0.55)' }}>
          <Bot size={30} />
        </span>
        <span style={{ padding: '0.15rem 0.6rem', borderRadius: '999px', background: '#ffffff', color: INK, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.03em', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>AI DOC</span>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
          <div style={{ position: 'fixed', inset: 0 }} onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI DOC symptom assistant"
            style={{ position: 'relative', width: '100%', maxWidth: '58rem', maxHeight: '100%', height: mode === 'chat' ? 'min(46rem, 100%)' : undefined, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafb', borderRadius: '1.25rem', boxShadow: '0 30px 80px rgba(15,23,42,0.4)', color: INK }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1.25rem', background: '#ffffff', borderBottom: `1px solid ${LINE}` }}>
              <span style={{ width: '2.8rem', height: '2.8rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: TEAL, color: '#fff' }}><Stethoscope size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>Smart hospital assistant</p>
                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: INK }}>HealthOps AI</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ width: '2.3rem', height: '2.3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${LINE}`, background: '#fff', color: INK }}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Assistant mode" style={{ display: 'flex', gap: '0.4rem', padding: '0.55rem 1.25rem', background: '#ffffff', borderBottom: `1px solid ${LINE}` }}>
              {[['chat', 'Ask a question', MessageCircle], ['checker', 'Symptom Checker', Activity]].map(([id, label, Icon]) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, border: 'none', background: mode === id ? TEAL : '#eef2f5', color: mode === id ? '#fff' : INK }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <div style={{ display: mode === 'checker' ? 'contents' : 'none' }}>
            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '1.25rem clamp(1rem, 3vw, 2rem) 1.5rem' }}>
              {/* Stepper */}
              <ol style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '1.5rem' }}>
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={s.label} aria-current={active ? 'step' : undefined} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                      <span style={{ width: '2.1rem', height: '2.1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: done || active ? '#fff' : MUTED, background: done ? '#2aa876' : active ? TEAL : '#dde5e9' }}>
                        {done ? <Check size={16} /> : i + 1}
                      </span>
                      <span className="aidoc-step-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: active ? TEAL_DARK : MUTED, textAlign: 'center' }}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>

              {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#991b1b', background: '#fee2e2' }}>{error}</p>}

              {/* STEP 1: symptoms */}
              {step === 0 && (
                <section>
                  <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>Select Your Symptoms</h2>
                  <p style={{ textAlign: 'center', margin: '0.4rem 0 1.25rem', color: MUTED }}>Choose all symptoms you are currently experiencing</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.8rem' }}>
                    {SYMPTOMS.map((s) => {
                      const on = a.symptoms.includes(s.id);
                      return (
                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1rem', borderRadius: '0.9rem', cursor: 'pointer', background: on ? TEAL_PALE : '#ffffff', border: `1.5px solid ${on ? TEAL : LINE}` }}>
                          <input type="checkbox" checked={on} onChange={() => toggleIn('symptoms', s.id)} style={{ width: '1.2rem', height: '1.2rem', accentColor: TEAL, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.95rem', color: INK }}>{symptomLabel(s)}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* STEP 2: body area */}
              {step === 1 && (
                <section>
                  <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>Select Body Area</h2>
                  <p style={{ textAlign: 'center', margin: '0.4rem 0 1.25rem', color: MUTED }}>Choose where you feel each selected symptom.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 15rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>Selected symptoms</p>
                      {chosenSymptoms.map((s) => {
                        const on = s.id === current;
                        const areas = a.areas[s.id] || [];
                        return (
                          <button key={s.id} type="button" onClick={() => setActiveSymptom(s.id)} aria-pressed={on}
                            style={{ textAlign: 'left', padding: '0.7rem 0.9rem', borderRadius: '0.8rem', cursor: 'pointer', background: '#fff', border: `1.5px solid ${on ? TEAL : LINE}`, color: INK }}>
                            <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700 }}>{symptomLabel(s)}</span>
                            <span style={{ display: 'block', fontSize: '0.78rem', color: areas.length ? TEAL_DARK : MUTED }}>
                              {areas.length ? areas.map((id) => BODY_AREAS.find((b) => b.id === id)?.label).join(', ') : 'No area selected'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ flex: '1 1 16rem' }}>
                      <p style={{ marginBottom: '0.6rem', fontSize: '0.92rem', color: MUTED, textAlign: 'center' }}>
                        Click the body area for: <strong style={{ color: TEAL_DARK }}>{SYMPTOMS.find((s) => s.id === current)?.en}</strong>
                      </p>
                      <BodyMap selected={a.areas[current] || []} onToggle={toggleArea} />
                    </div>
                    <div style={{ flex: '1 1 13rem' }}>
                      <p style={{ marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: 800 }}>Body areas</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {BODY_AREAS.map((b) => <Chip key={b.id} active={(a.areas[current] || []).includes(b.id)} onClick={() => toggleArea(b.id)}>{b.label}</Chip>)}
                      </div>
                      <button type="button" onClick={() => current && setA((p) => ({ ...p, areas: { ...p.areas, [current]: [] } }))}
                        style={{ marginTop: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '999px', cursor: 'pointer', border: `1px solid ${LINE}`, background: '#fff', color: INK, fontSize: '0.82rem', fontWeight: 700 }}>
                        <RotateCcw size={14} /> Clear
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 3: patient info */}
              {step === 2 && (
                <section style={{ maxWidth: '34rem', margin: '0 auto' }}>
                  <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>Patient Information</h2>
                  <p style={{ textAlign: 'center', margin: '0.4rem 0 1.25rem', color: MUTED }}>Age and gender help us give better guidance. Your answers stay in this window and are not saved.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
                    <div><label htmlFor="aidoc-name" style={labelStyle}>Name (optional)</label><input id="aidoc-name" value={a.name} onChange={(e) => set('name', e.target.value)} maxLength={100} style={fieldStyle} /></div>
                    <div><label htmlFor="aidoc-contact" style={labelStyle}>Contact no (optional)</label><input id="aidoc-contact" value={a.contact} onChange={(e) => set('contact', e.target.value)} maxLength={20} placeholder="e.g. 0771234567" style={fieldStyle} /></div>
                    <div><label htmlFor="aidoc-age" style={labelStyle}>Age *</label><input id="aidoc-age" type="number" min="0" max="120" value={a.age} onChange={(e) => set('age', e.target.value)} style={fieldStyle} /></div>
                    <div>
                      <label htmlFor="aidoc-gender" style={labelStyle}>Gender *</label>
                      <select id="aidoc-gender" value={a.gender} onChange={(e) => set('gender', e.target.value)} style={fieldStyle}>
                        <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 4: questions */}
              {step === 3 && (
                <section style={{ maxWidth: '40rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  <div>
                    <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>A Few Questions</h2>
                    <p style={{ textAlign: 'center', marginTop: '0.4rem', color: MUTED }}>These help us judge how soon you should be seen.</p>
                  </div>
                  <div>
                    <p style={labelStyle}>How long have you had these symptoms? *</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>{DURATIONS.map((d) => <Chip key={d} active={a.duration === d} onClick={() => set('duration', d)}>{d}</Chip>)}</div>
                  </div>
                  <div>
                    <p style={labelStyle}>How severe is it? *</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.6rem' }}>
                      {SEVERITIES.map((s) => (
                        <button key={s.id} type="button" aria-pressed={a.severity === s.id} onClick={() => set('severity', s.id)}
                          style={{ textAlign: 'left', padding: '0.75rem 0.9rem', borderRadius: '0.8rem', cursor: 'pointer', background: a.severity === s.id ? TEAL_PALE : '#fff', border: `1.5px solid ${a.severity === s.id ? TEAL : LINE}`, color: INK }}>
                          <span style={{ display: 'block', fontWeight: 800 }}>{s.label}</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: MUTED }}>{s.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={labelStyle}>Do any of these apply right now?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {RED_FLAGS.map((f) => {
                        const on = a.redFlags.includes(f.id);
                        return (
                          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: '0.8rem', cursor: 'pointer', background: on ? '#fee2e2' : '#fff', border: `1.5px solid ${on ? '#f87171' : LINE}` }}>
                            <input type="checkbox" checked={on} onChange={() => toggleIn('redFlags', f.id)} style={{ width: '1.1rem', height: '1.1rem', accentColor: '#dc2626', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem', color: INK }}>{f.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 5: lab tests */}
              {step === 4 && result && (
                <section style={{ maxWidth: '42rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>Suggested Lab Tests</h2>
                    <p style={{ textAlign: 'center', marginTop: '0.4rem', color: MUTED }}>Tests doctors often use for these symptoms. Your doctor decides which ones you actually need.</p>
                  </div>
                  <div role="status" style={{ padding: '1rem 1.2rem', borderRadius: '0.9rem', background: urgencyBox[result.urgency].bg, border: `1px solid ${urgencyBox[result.urgency].border}`, color: urgencyBox[result.urgency].color }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}><AlertTriangle size={18} /> {urgencyBox[result.urgency].title}</p>
                    <p style={{ marginTop: '0.3rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{urgencyBox[result.urgency].text}</p>
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {result.tests.map((t) => (
                      <li key={t.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '0.85rem', background: '#fff', border: `1px solid ${LINE}` }}>
                        <FlaskConical size={18} style={{ marginTop: '0.15rem', flexShrink: 0, color: TEAL }} />
                        <span>
                          <span style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem' }}>{t.name}</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: MUTED }}>Because of: {t.because.join(', ')}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* STEP 6: next steps */}
              {step === 5 && result && (
                <section style={{ maxWidth: '42rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>Your Next Steps</h2>
                    <p style={{ textAlign: 'center', marginTop: '0.4rem', color: MUTED }}>{a.name ? `${a.name}, here` : 'Here'} is what we suggest.</p>
                  </div>

                  {result.urgency === 'emergency' && (
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '0.9rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}><Siren size={18} /> This may be an emergency</p>
                      <p style={{ margin: '0.3rem 0 0.8rem', fontSize: '0.9rem', lineHeight: 1.6 }}>Call for help now, or go to the nearest emergency department.</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <a href="tel:0912525256" className="btn btn-primary btn-sm"><Phone size={15} /> Call 0912525256</a>
                        <Link to="/ambulances" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Find an ambulance</Link>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1rem 1.2rem', borderRadius: '0.9rem', background: '#fff', border: `1px solid ${LINE}` }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED }}>Suggested specialty</p>
                    <p style={{ marginTop: '0.3rem', fontSize: '1.15rem', fontWeight: 800, color: TEAL_DARK }}>{result.specialties.join(' or ')}</p>
                    {matchingDoctors.length > 0 ? (
                      <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {matchingDoctors.map((d) => (
                          <div key={d.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: '0.7rem', background: '#f1f7f9' }}>
                            <span><strong>{d.name}</strong> <span style={{ color: MUTED, fontSize: '0.85rem' }}>· {d.specialty}</span></span>
                            <Link to={bookTo(d.id)} onClick={() => setOpen(false)} className="btn btn-primary btn-sm"><CalendarPlus size={15} /> Book</Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ marginTop: '0.6rem', fontSize: '0.88rem', color: MUTED }}>No registered doctor matches yet. You can still browse all our doctors.</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <Link to={bookTo()} onClick={() => setOpen(false)} className="btn btn-primary"><CalendarPlus size={17} /> {isAuthenticated ? 'Book an appointment' : 'Register to book'}</Link>
                    <Link to="/doctors" onClick={() => setOpen(false)} className="btn btn-secondary"><Stethoscope size={17} /> Find a doctor</Link>
                    <button type="button" onClick={restart} className="btn btn-secondary"><RotateCcw size={17} /> Start again</button>
                  </div>
                </section>
              )}

              <p style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', maxWidth: '42rem', margin: '1.5rem auto 0', fontSize: '0.78rem', lineHeight: 1.6, color: MUTED }}>
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                AI-DOC gives general guidance only. It is not a diagnosis and does not replace a doctor. In an emergency, call for help straight away.
              </p>
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.85rem 1.25rem', background: '#ffffff', borderTop: `1px solid ${LINE}` }}>
              <button type="button" onClick={back} disabled={step === 0} className="btn btn-secondary" style={{ opacity: step === 0 ? 0.5 : 1 }}><ArrowLeft size={17} /> Back</button>
              {step < STEPS.length - 1 && (
                <button type="button" onClick={next} className="btn btn-primary" style={{ background: TEAL }}>{step === 3 ? 'See suggestions' : 'Next'} <ArrowRight size={17} /></button>
              )}
            </div>
            </div>

            <div style={{ display: mode === 'chat' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
              <ChatPanel onNavigate={() => setOpen(false)} onOpenChecker={() => setMode('checker')} />
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 560px) { .aidoc-step-label { display: none; } }`}</style>
    </>
  );
};

export default AiDoc;
