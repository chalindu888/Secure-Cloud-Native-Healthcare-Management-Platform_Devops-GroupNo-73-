import React from 'react';
import { useAdmissions } from '../../hooks/useAdmissions';
import HospitalMap, { describeRoom, floorName } from '../../components/HospitalMap';
import { BedDouble, MapPin, Stethoscope, Clock, FileText } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = { background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)' };
const fmt = (value) => new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Fact = ({ label, children }) => (
  <div style={{ flex: '1 1 8rem', padding: '0.7rem 0.9rem', borderRadius: 'var(--r-sm)', background: 'var(--bg-surface)' }}>
    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' }}>{label}</p>
    <p style={{ marginTop: '0.15rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{children}</p>
  </div>
);

// A patient's own admission: admission number, room, bed, doctor and a map of where to go.
const PatientAdmission = () => {
  const { rooms, admissions, loading, error } = useAdmissions();
  const current = admissions.find((a) => a.status === 'admitted') || null;
  const past = admissions.filter((a) => a.status !== 'admitted');

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>Patient Portal</span>
        <h1 className="page-title">My Admission</h1>
        <p className="page-subtitle">Your admission number, your room and bed, and a map showing where to find them.</p>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {current ? (
            <>
              <section aria-label="Current admission" style={{ ...cardStyle, padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.9rem' }}>
                  <span style={{ display: 'flex', padding: '0.7rem', borderRadius: '0.9rem', background: '#e0e7ff', color: '#4f46e5' }}><BedDouble size={26} /></span>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)' }}>Admission number</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5' }}>{current.admissionNumber}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
                  <Fact label="Floor">{current.floor}</Fact>
                  <Fact label="Room">{current.roomCode}</Fact>
                  <Fact label="Bed">{current.bedNo}</Fact>
                </div>
                <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.92rem', color: '#334155' }}><MapPin size={16} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#4f46e5' }} /><span><strong>{current.roomName}</strong> ({current.roomType}). {describeRoom(current)}</span></p>
                {current.doctorName && <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.92rem', color: '#334155' }}><Stethoscope size={16} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#4f46e5' }} /><span>Doctor in charge: <strong>{current.doctorName}</strong></span></p>}
                <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.92rem', color: '#334155', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><FileText size={16} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#4f46e5' }} /><span><strong>Reason:</strong> {current.reason}</span></p>
                <p style={{ display: 'flex', gap: '0.55rem', fontSize: '0.85rem', color: '#64748b' }}><Clock size={15} style={{ marginTop: '0.1rem', flexShrink: 0 }} /><span>Admitted {fmt(current.admittedAt)}</span></p>
              </section>

              <section aria-label="Map" style={{ ...cardStyle, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Your room on {floorName(current.floor)}</h2>
                <HospitalMap rooms={rooms} floor={current.floor} markers={[{ roomId: current.roomId, label: current.bedNo, color: '#dc2626' }]} />
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>The red dot is your bed (number {current.bedNo}) in Room {current.roomCode}. The lift is on the left of the map.</p>
              </section>

              {current.moves.length > 1 && (
                <section aria-label="Room changes" style={{ ...cardStyle, padding: '1.1rem 1.3rem' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.6rem' }}>Where you have stayed</h2>
                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: 0, padding: 0, listStyle: 'none', fontSize: '0.88rem', color: '#334155' }}>
                    {current.moves.map((m, i) => (
                      <li key={`${m.movedAt}-${i}`}>{fmt(m.movedAt)}: {floorName(m.floor)}, Room {m.roomCode}, bed {m.bedNo}{i === current.moves.length - 1 ? ' (now)' : ''}</li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          ) : (
            <div style={{ ...cardStyle, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <BedDouble size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--txt-disabled)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>You are not admitted right now</h3>
              <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>If your doctor admits you to the hospital, your admission number, room and bed will appear here.</p>
            </div>
          )}

          {past.length > 0 && (
            <section aria-label="Past admissions" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Past admissions</h2>
              {past.map((a) => (
                <div key={a.id} style={{ ...cardStyle, padding: '0.85rem 1.2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.88rem', color: '#334155' }}>
                  <span><strong>{a.admissionNumber}</strong> · Room {a.roomCode}, bed {a.bedNo}{a.doctorName ? ` · ${a.doctorName}` : ''}</span>
                  <span style={{ color: '#64748b' }}>{fmt(a.admittedAt)} to {fmt(a.dischargedAt)}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientAdmission;
