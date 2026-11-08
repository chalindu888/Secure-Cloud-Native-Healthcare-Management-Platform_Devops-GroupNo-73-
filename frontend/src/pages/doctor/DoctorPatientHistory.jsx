import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAmbulanceData, REQUEST_STATUS } from '../../hooks/useAmbulanceData';
import { StatusPill } from '../../components/AmbulanceRequestList';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import {
  Search, Users, Mail, Phone, Calendar, Clock, FileText, Pill, ClipboardList, Ambulance, MapPin, Navigation, History,
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = { background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)' };
const FILTERS = [
  { key: 'all', label: 'Everything' },
  { key: 'visit', label: 'Visits' },
  { key: 'ambulance', label: 'Ambulance trips' },
];

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const formatStamp = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const Note = ({ icon: Icon, color, label, children }) => (
  <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.88rem', color: '#334155', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
    <Icon size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color }} />
    <span><strong>{label}:</strong> {children}</span>
  </p>
);

// Each of the doctor's patients, with their complete history: every visit (reason, diagnosis,
// prescription) and every ambulance trip, newest first.
const DoctorPatientHistory = () => {
  const { user } = useAuth();
  const { appointments, patientPhotos } = useData();
  const { requests: ambulanceRequests } = useAmbulanceData();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const patients = useMemo(() => {
    const byPatient = new Map();
    appointments
      .filter((apt) => apt.doctorId === user?.id || apt.doctorName === user?.name)
      .forEach((apt) => {
        if (!byPatient.has(apt.patientId)) {
          byPatient.set(apt.patientId, { id: apt.patientId, name: apt.patientName, email: apt.patientEmail, phone: apt.patientPhone, hasPhoto: apt.patientHasPhoto, visits: [] });
        }
        byPatient.get(apt.patientId).visits.push(apt);
      });
    return [...byPatient.values()]
      .map((p) => ({ ...p, lastActivity: p.visits.reduce((latest, v) => (v.date > latest ? v.date : latest), '') }))
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }, [appointments, user]);

  const q = search.trim().toLowerCase();
  const filtered = patients.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q));

  const selectedId = Number(params.get('patient')) || filtered[0]?.id || null;
  const selected = patients.find((p) => p.id === selectedId) || null;

  const timeline = useMemo(() => {
    if (!selected) return [];
    const visits = selected.visits.map((v) => ({ kind: 'visit', key: `v${v.id}`, sort: `${v.date} ${v.timeSlot}`, data: v }));
    const trips = ambulanceRequests
      .filter((r) => r.patientId === selected.id)
      .map((r) => ({ kind: 'ambulance', key: `a${r.id}`, sort: r.createdAt, data: r }));
    return [...visits, ...trips].sort((a, b) => String(b.sort).localeCompare(String(a.sort)));
  }, [selected, ambulanceRequests]);

  const shown = timeline.filter((item) => filter === 'all' || item.kind === filter);
  const completed = selected ? selected.visits.filter((v) => v.status === 'completed').length : 0;
  const trips = timeline.filter((item) => item.kind === 'ambulance').length;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>Doctor Portal</span>
        <h1 className="page-title">Patient History</h1>
        <p className="page-subtitle">Choose a patient to read their full history with you: visits, diagnoses, prescriptions and ambulance trips.</p>
      </div>

      {patients.length === 0 ? (
        <div style={{ ...cardStyle, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Users size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--txt-disabled)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>No patient history yet</h3>
          <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>A patient's history starts when they book an appointment with you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Patient list */}
          <aside style={{ ...cardStyle, flex: '0 0 19rem', maxWidth: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." aria-label="Search patients" style={{ paddingLeft: '2.6rem', borderRadius: 'var(--r-pill)' }} />
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '32rem', overflowY: 'auto' }}>
              {filtered.map((p) => {
                const active = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => setParams({ patient: String(p.id) })}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', textAlign: 'left', cursor: 'pointer', borderRadius: '0.8rem',
                        border: `1px solid ${active ? 'var(--c-primary)' : 'transparent'}`, background: active ? 'var(--c-primary-pale)' : 'transparent',
                      }}
                    >
                      <Avatar name={p.name} src={p.hasPhoto ? patientPhotos[p.id] : ''} size="2.6rem" />
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{p.visits.length} {p.visits.length === 1 ? 'visit' : 'visits'}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && <li style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>No patients match.</li>}
            </ul>
          </aside>

          {/* History */}
          <section style={{ flex: '1 1 30rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selected ? (
              <>
                <div style={{ ...cardStyle, padding: '1.25rem 1.4rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.1rem' }}>
                  <Avatar name={selected.name} src={selected.hasPhoto ? patientPhotos[selected.id] : ''} size="4.5rem" />
                  <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{selected.name}</h2>
                    <p style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1.2rem', marginTop: '0.3rem', fontSize: '0.84rem', color: 'var(--txt-secondary)' }}>
                      {selected.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={14} /> {selected.email}</span>}
                      {selected.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={14} /> {selected.phone}</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {[[selected.visits.length, 'Visits'], [completed, 'Completed'], [trips, 'Ambulance']].map(([value, label]) => (
                      <div key={label} style={{ minWidth: '4.6rem', padding: '0.55rem 0.5rem', borderRadius: 'var(--r-sm)', background: 'var(--bg-surface)', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{value}</p>
                        <p style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--txt-muted)' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div role="group" aria-label="Filter history" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {FILTERS.map(({ key, label }) => {
                    const active = filter === key;
                    return (
                      <button key={key} type="button" aria-pressed={active} onClick={() => setFilter(key)}
                        style={{ padding: '0.45rem 0.9rem', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${active ? 'var(--c-primary)' : 'var(--bdr-default)'}`, background: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.7)', color: active ? '#ffffff' : 'var(--txt-secondary)' }}>
                        {label}
                      </button>
                    );
                  })}
                </div>

                {shown.length === 0 ? (
                  <div style={{ ...cardStyle, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                    <History size={34} style={{ margin: '0 auto 0.6rem', color: 'var(--txt-disabled)' }} />
                    <p style={{ fontSize: '0.92rem', color: 'var(--txt-secondary)' }}>Nothing to show for this filter.</p>
                  </div>
                ) : (
                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', paddingLeft: '1.25rem', borderLeft: '2px solid var(--bdr-default)' }}>
                    {shown.map((item) => (
                      <li key={item.key} style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 'calc(-1.25rem - 7px)', top: '1.2rem', width: '12px', height: '12px', borderRadius: '50%', background: item.kind === 'visit' ? 'var(--c-primary)' : '#dc2626', border: '2px solid #fff' }} />
                        {item.kind === 'visit' ? (
                          <div style={{ ...cardStyle, padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <p style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 1rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={15} style={{ color: '#4f46e5' }} /> {formatDate(item.data.date)}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={15} style={{ color: '#4f46e5' }} /> {item.data.timeSlot}</span>
                              </p>
                              <StatusBadge status={item.data.status} />
                            </div>
                            <Note icon={ClipboardList} color="#94a3b8" label="Reason">{item.data.reason}</Note>
                            {item.data.notes && <Note icon={FileText} color="#4f46e5" label="Diagnosis">{item.data.notes}</Note>}
                            {item.data.prescription && <Note icon={Pill} color="#059669" label="Prescription">{item.data.prescription}</Note>}
                            {!item.data.notes && !item.data.prescription && item.data.status !== 'cancelled' && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>No diagnosis or prescription recorded yet. <Link to="/doctor/appointments" style={{ fontWeight: 700, color: 'var(--c-primary)' }}>Add one</Link></p>
                            )}
                          </div>
                        ) : (
                          <div style={{ ...cardStyle, padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '4px solid #dc2626' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                <Ambulance size={16} style={{ color: '#dc2626' }} /> {item.data.ambulanceNumber} · {formatStamp(item.data.createdAt)}
                              </p>
                              <StatusPill map={REQUEST_STATUS} status={item.data.status} />
                            </div>
                            <Note icon={MapPin} color="#94a3b8" label="Pickup">{item.data.pickupLocation}</Note>
                            <Note icon={Navigation} color="#94a3b8" label="Destination">{item.data.destination}</Note>
                            {item.data.reason && <Note icon={FileText} color="#94a3b8" label="Reason">{item.data.reason}</Note>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : (
              <div style={{ ...cardStyle, padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--txt-secondary)' }}>Choose a patient from the list.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientHistory;
