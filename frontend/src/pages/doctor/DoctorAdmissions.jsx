import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAdmissions } from '../../hooks/useAdmissions';
import { errorText } from '../../hooks/useAmbulanceData';
import api from '../../services/api';
import HospitalMap, { describeRoom, floorName } from '../../components/HospitalMap';
import AdmitPatientModal, { FloorTabs } from '../../components/AdmitPatientModal';
import Modal from '../../components/Modal';
import { BedDouble, Plus, MapPin, ArrowRightLeft, LogOut, FileText, Clock } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = { background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)' };
const fmt = (value) => new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const DoctorAdmissions = () => {
  const { user } = useAuth();
  const { appointments } = useData();
  const { rooms, admissions, loading, error, refresh } = useAdmissions();

  const [floor, setFloor] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [modal, setModal] = useState({ mode: null, admission: null });
  const [discharging, setDischarging] = useState(null);
  const [dischargeNote, setDischargeNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const current = admissions.filter((a) => a.status === 'admitted');
  const past = admissions.filter((a) => a.status !== 'admitted');
  const floors = useMemo(() => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b), [rooms]);
  const activeFloor = floor ?? current[0]?.floor ?? floors[0] ?? 1;

  // The doctor's patients (people who booked with them) who are not already in a bed
  const admittable = useMemo(() => {
    const busyIds = new Set(current.map((a) => a.patientId));
    const seen = new Map();
    appointments.forEach((a) => {
      if (a.doctorId === user?.id && !busyIds.has(a.patientId) && !seen.has(a.patientId)) seen.set(a.patientId, a.patientName);
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments, current, user]);

  const floorCounts = current.reduce((acc, a) => ({ ...acc, [a.floor]: (acc[a.floor] || 0) + 1 }), {});
  const markers = current.filter((a) => a.floor === activeFloor).map((a) => ({
    roomId: a.roomId, label: a.bedNo, color: a.id === highlightId ? '#dc2626' : '#4f46e5',
  }));
  const totalBeds = rooms.reduce((n, r) => n + r.beds, 0);
  const takenBeds = rooms.reduce((n, r) => n + r.occupiedBeds.length, 0);

  const showOnMap = (a) => {
    setFloor(a.floor);
    setHighlightId(a.id);
    document.getElementById('admission-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const discharge = async () => {
    setBusy(true);
    setActionError('');
    try {
      await api.patch(`/admissions/${discharging.id}`, { status: 'discharged', dischargeNote });
      setDischarging(null);
      setDischargeNote('');
      await refresh();
    } catch (err) {
      setActionError(errorText(err, 'Unable to discharge.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>Doctor Portal</span>
          <h1 className="page-title">Admitted Patients</h1>
          <p className="page-subtitle">Admit a patient to a bed, see exactly where each one is in the building, and move or discharge them.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'admit', admission: null })}><Plus size={18} /> Admit a patient</button>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}
      {actionError && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{actionError}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {[[current.length, 'Your admitted patients'], [takenBeds, 'Beds in use (whole hospital)'], [totalBeds - takenBeds, 'Beds free']].map(([value, label]) => (
              <div key={label} style={{ ...cardStyle, flex: '1 1 10rem', padding: '0.9rem 1.1rem' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{value}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--txt-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Map */}
          <section id="admission-map" aria-label="Hospital map" style={{ ...cardStyle, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Where your patients are</h2>
              <FloorTabs floors={floors} floor={activeFloor} onChange={(f) => { setFloor(f); setHighlightId(null); }} counts={floorCounts} />
            </div>
            <HospitalMap rooms={rooms} floor={activeFloor} markers={markers} />
            <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Each blue dot is one of your patients; the number is the bed. Tabs show how many of your patients are on each floor.</p>
          </section>

          {/* Current admissions */}
          <section aria-label="Current admissions" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Currently admitted</h2>
            {current.length === 0 ? (
              <div style={{ ...cardStyle, padding: '3rem 1.5rem', textAlign: 'center' }}>
                <BedDouble size={38} style={{ margin: '0 auto 0.7rem', color: 'var(--txt-disabled)' }} />
                <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)' }}>None of your patients is admitted right now.</p>
              </div>
            ) : current.map((a) => (
              <article key={a.id} style={{ ...cardStyle, padding: '1.1rem 1.3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: `4px solid ${a.id === highlightId ? '#dc2626' : '#4f46e5'}` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{a.patientName}</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>{a.admissionNumber}</p>
                  </div>
                  <p style={{ padding: '0.35rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, color: '#3730a3', background: '#e0e7ff' }}>
                    {floorName(a.floor)} · Room {a.roomCode} · Bed {a.bedNo}
                  </p>
                </div>
                <p style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><FileText size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#94a3b8' }} /><span><strong>Reason:</strong> {a.reason}</span></p>
                <p style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}><MapPin size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#94a3b8' }} /><span>{a.roomName} ({a.roomType}). {describeRoom(a)}</span></p>
                <p style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}><Clock size={14} style={{ marginTop: '0.15rem', flexShrink: 0 }} /><span>Admitted {fmt(a.admittedAt)}{a.moves.length > 1 ? ` · moved ${a.moves.length - 1} ${a.moves.length === 2 ? 'time' : 'times'}` : ''}</span></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => showOnMap(a)}><MapPin size={16} /> Show on map</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal({ mode: 'move', admission: a })}><ArrowRightLeft size={16} /> Move room / bed</button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setDischarging(a); setDischargeNote(''); setActionError(''); }}><LogOut size={16} /> Discharge</button>
                </div>
              </article>
            ))}
          </section>

          {past.length > 0 && (
            <section aria-label="Past admissions" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Discharged</h2>
              {past.map((a) => (
                <div key={a.id} style={{ ...cardStyle, padding: '0.85rem 1.2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.88rem', color: '#334155' }}>
                  <span><strong>{a.patientName}</strong> · {a.admissionNumber} · last bed: Room {a.roomCode}, bed {a.bedNo}</span>
                  <span style={{ color: '#64748b' }}>{fmt(a.admittedAt)} to {fmt(a.dischargedAt)}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      <AdmitPatientModal
        mode={modal.mode}
        admission={modal.admission}
        rooms={rooms}
        patients={admittable}
        onClose={() => setModal({ mode: null, admission: null })}
        onDone={refresh}
      />

      <Modal isOpen={!!discharging} onClose={() => setDischarging(null)} title={discharging ? `Discharge ${discharging.patientName}` : ''} maxWidth="30rem">
        {discharging && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>This frees bed {discharging.bedNo} in Room {discharging.roomCode} ({discharging.admissionNumber}).</p>
            <div>
              <label htmlFor="discharge-note" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>Discharge note (optional)</label>
              <textarea id="discharge-note" value={dischargeNote} onChange={(e) => setDischargeNote(e.target.value)} maxLength={1000} rows={3} style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.7rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', resize: 'vertical' }} />
            </div>
            {actionError && <p role="alert" style={{ padding: '0.7rem 0.9rem', borderRadius: '0.7rem', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{actionError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDischarging(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={discharge}>{busy ? 'Saving...' : 'Discharge patient'}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAdmissions;
