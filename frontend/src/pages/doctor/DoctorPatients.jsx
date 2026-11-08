import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Avatar from '../../components/Avatar';
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Pill,
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const SORTS = [
  { key: 'recent', label: 'Recently seen' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'visits', label: 'Most visits' },
];

const todayString = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #ffffff',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--shdw-md)',
};

const SummaryTile = ({ icon: Icon, label, value, color, background }) => (
  <div style={{ ...cardStyle, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ width: '2.9rem', height: '2.9rem', borderRadius: '0.9rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, background }}>
      <Icon size={22} />
    </span>
    <div>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--txt-primary)' }}>{value}</p>
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--txt-muted)' }}>{label}</p>
    </div>
  </div>
);

const Stat = ({ value, label }) => (
  <div style={{ flex: 1, padding: '0.6rem 0.25rem', borderRadius: 'var(--r-sm)', background: 'var(--bg-surface)', textAlign: 'center' }}>
    <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{value}</p>
    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--txt-muted)' }}>{label}</p>
  </div>
);

const DoctorPatients = () => {
  const { user } = useAuth();
  const { appointments, patientPhotos } = useData();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);

  // One entry per patient, built from this doctor's appointments
  const patients = useMemo(() => {
    const today = todayString();
    const mine = appointments.filter(
      (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
    );
    const byPatient = new Map();

    mine.forEach((apt) => {
      const key = apt.patientId || apt.patientEmail;
      if (!byPatient.has(key)) {
        byPatient.set(key, { id: key, name: apt.patientName, email: apt.patientEmail, phone: apt.patientPhone, hasPhoto: apt.patientHasPhoto, visits: [] });
      }
      byPatient.get(key).visits.push(apt);
    });

    return [...byPatient.values()].map((p) => {
      const visits = [...p.visits].sort((a, b) => b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot));
      const upcoming = visits
        .filter((v) => (v.status === 'pending' || v.status === 'confirmed') && v.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
      const seen = visits.filter((v) => v.status === 'completed');

      return {
        ...p,
        visits,
        nextVisit: upcoming[0],
        lastSeen: seen[0]?.date,
        lastActivity: visits[0]?.date || '',
        completedCount: seen.length,
        upcomingCount: upcoming.length,
      };
    });
  }, [appointments, user]);

  const q = search.trim().toLowerCase();
  const filtered = patients
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.phone || '').includes(q))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'visits') return b.visits.length - a.visits.length || a.name.localeCompare(b.name);
      return b.lastActivity.localeCompare(a.lastActivity);
    });

  const selected = patients.find((p) => p.id === selectedId);
  const totalUpcoming = patients.reduce((sum, p) => sum + p.upcomingCount, 0);
  const totalCompleted = patients.reduce((sum, p) => sum + p.completedCount, 0);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>
          Doctor Portal
        </span>
        <h1 className="page-title">Patient History</h1>
        <p className="page-subtitle">
          Review each patient you have treated, including appointment history, diagnoses and prescriptions.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <SummaryTile icon={Users} label="Total patients" value={patients.length} color="var(--c-primary)" background="var(--c-primary-pale)" />
        <SummaryTile icon={CalendarCheck} label="Upcoming visits" value={totalUpcoming} color="var(--c-amber)" background="var(--c-amber-pale)" />
        <SummaryTile icon={CheckCircle2} label="Completed visits" value={totalCompleted} color="var(--c-emerald)" background="var(--c-emerald-pale)" />
      </div>

      {/* Search + sort */}
      <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="group" aria-label="Sort patients" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ marginRight: '0.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' }}>Sort</span>
          {SORTS.map(({ key, label }) => {
            const active = sort === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setSort(key)}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                  border: `1px solid ${active ? 'var(--c-primary)' : 'var(--bdr-default)'}`,
                  background: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.7)',
                  color: active ? '#ffffff' : 'var(--txt-secondary)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: '1 1 16rem', maxWidth: '22rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            aria-label="Search patients"
            style={{ paddingLeft: '2.6rem', borderRadius: 'var(--r-pill)' }}
          />
        </div>
      </div>

      {/* Patient cards */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              aria-label={`View ${p.name}'s visit history`}
              style={{
                ...cardStyle, padding: '1.25rem', textAlign: 'left', cursor: 'pointer', width: '100%',
                display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shdw-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shdw-md)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <Avatar name={p.name} src={p.hasPhoto ? patientPhotos[p.id] : ''} size="3.5rem" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{p.name}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                    <Mail size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</span>
                  </p>
                  {p.phone && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                      <Phone size={13} style={{ flexShrink: 0 }} /> {p.phone}
                    </p>
                  )}
                </div>
                <ChevronRight size={18} style={{ color: 'var(--txt-disabled)', flexShrink: 0 }} />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Stat value={p.visits.length} label="Visits" />
                <Stat value={p.completedCount} label="Completed" />
                <Stat value={p.upcomingCount} label="Upcoming" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.85rem', borderTop: '1px solid var(--bdr-default)', fontSize: '0.82rem' }}>
                {p.nextVisit ? (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 700 }}>
                    <CalendarCheck size={15} style={{ flexShrink: 0 }} />
                    Next: {formatDate(p.nextVisit.date)} · {p.nextVisit.timeSlot}
                  </p>
                ) : (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--txt-muted)' }}>
                    <CalendarCheck size={15} style={{ flexShrink: 0 }} /> No upcoming visit
                  </p>
                )}
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--txt-secondary)' }}>
                  <Calendar size={15} style={{ flexShrink: 0 }} />
                  {p.lastSeen ? `Last seen ${formatDate(p.lastSeen)}` : 'Not seen yet'}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Users size={40} style={{ color: 'var(--txt-disabled)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>
            {patients.length === 0 ? 'No patients yet' : 'No patients match your search'}
          </h3>
          <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
            {patients.length === 0
              ? 'Patients appear here once they book an appointment with you.'
              : 'Try a different name, email or phone number.'}
          </p>
          {patients.length === 0 ? (
            <Link to="/doctor/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Complete your profile so patients can find you
            </Link>
          ) : (
            <button type="button" onClick={() => setSearch('')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Visit history */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? selected.name : ''}
        maxWidth="42rem"
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar name={selected.name} src={selected.hasPhoto ? patientPhotos[selected.id] : ''} size="4.5rem" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#334155', minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', overflowWrap: 'anywhere' }}><Mail size={14} /> {selected.email}</span>
                {selected.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} /> {selected.phone}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Stat value={selected.visits.length} label="Visits" />
              <Stat value={selected.completedCount} label="Completed" />
              <Stat value={selected.upcomingCount} label="Upcoming" />
            </div>

            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
              Visit history
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {selected.visits.map((v) => (
                <div key={v.id} style={{ padding: '1rem 1.1rem', borderRadius: '0.9rem', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <p style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={15} style={{ color: '#4f46e5' }} /> {formatDate(v.date)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={15} style={{ color: '#4f46e5' }} /> {v.timeSlot}</span>
                    </p>
                    <StatusBadge status={v.status} />
                  </div>

                  <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.88rem', color: '#334155', overflowWrap: 'anywhere' }}>
                    <ClipboardList size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#94a3b8' }} />
                    <span><strong>Reason:</strong> {v.reason}</span>
                  </p>
                  {v.notes && (
                    <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.88rem', color: '#334155', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                      <FileText size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#4f46e5' }} />
                      <span><strong>Diagnosis:</strong> {v.notes}</span>
                    </p>
                  )}
                  {v.prescription && (
                    <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.88rem', color: '#334155', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                      <Pill size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#059669' }} />
                      <span><strong>Prescription:</strong> {v.prescription}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <Link to="/doctor/appointments" className="btn btn-primary btn-sm">
                Manage appointments
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
