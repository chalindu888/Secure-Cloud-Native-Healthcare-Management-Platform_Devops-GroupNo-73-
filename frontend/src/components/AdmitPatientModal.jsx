import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import HospitalMap, { OccupancyLegend, floorName } from './HospitalMap';
import api from '../services/api';
import { errorText } from '../hooks/useAmbulanceData';

// Admit a patient (choose the patient, the room on the map and a bed), or move an admitted
// patient to a different room / bed.
const fieldStyle = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.7rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem' };
const labelStyle = { display: 'block', marginBottom: '0.35rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' };

export const FloorTabs = ({ floors, floor, onChange, counts = {} }) => (
  <div role="tablist" aria-label="Floors" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
    {floors.map((f) => {
      const active = f === floor;
      return (
        <button
          key={f} type="button" role="tab" aria-selected={active} onClick={() => onChange(f)}
          style={{
            padding: '0.45rem 0.95rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            border: `1px solid ${active ? '#4f46e5' : '#cbd5e1'}`, background: active ? '#4f46e5' : '#ffffff', color: active ? '#ffffff' : '#475569',
          }}
        >
          {floorName(f)}{counts[f] ? ` · ${counts[f]}` : ''}
        </button>
      );
    })}
  </div>
);

// mode: 'admit' | 'move'. For 'move', admission is the patient's current admission.
const AdmitPatientModal = ({ mode, admission, rooms, patients, onClose, onDone }) => {
  const isOpen = !!mode;
  const floors = useMemo(() => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b), [rooms]);

  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [floor, setFloor] = useState(floors[0] || 1);
  const [roomId, setRoomId] = useState(null);
  const [bedNo, setBedNo] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mode) return;
    setPatientId(''); setReason(''); setError(''); setBedNo(null);
    setRoomId(null);
    setFloor(mode === 'move' && admission ? admission.floor : floors[0] || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, admission?.id]);

  // When moving, the patient's own bed counts as free
  const pickable = useMemo(() => rooms.map((r) => (
    mode === 'move' && admission && r.id === admission.roomId
      ? { ...r, occupiedBeds: r.occupiedBeds.filter((b) => b !== admission.bedNo) }
      : r
  )), [rooms, mode, admission]);

  const room = pickable.find((r) => r.id === roomId) || null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'admit' && !patientId) { setError('Please choose the patient.'); return; }
    if (mode === 'admit' && !reason.trim()) { setError('Please enter the reason for admission.'); return; }
    if (!room) { setError('Please click a room on the map.'); return; }
    if (!bedNo) { setError('Please choose a bed.'); return; }
    setSaving(true);
    try {
      if (mode === 'admit') {
        await api.post('/admissions', { patientId: Number(patientId), roomId: room.id, bedNo, reason });
      } else {
        await api.patch(`/admissions/${admission.id}`, { roomId: room.id, bedNo });
      }
      await onDone?.();
      onClose();
    } catch (err) {
      setError(errorText(err, 'Unable to save.'));
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'move' ? `Move ${admission?.patientName || 'patient'}` : 'Admit a patient'} maxWidth="48rem">
      {isOpen && (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <p role="alert" style={{ padding: '0.7rem 0.9rem', borderRadius: '0.7rem', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

          {mode === 'move' && admission && (
            <p style={{ fontSize: '0.88rem', color: '#475569' }}>
              {admission.admissionNumber} is now in <strong>Room {admission.roomCode}, bed {admission.bedNo}</strong> ({floorName(admission.floor)}). Choose the new room and bed.
            </p>
          )}

          {mode === 'admit' && (
            <>
              <div>
                <label htmlFor="adm-patient" style={labelStyle}>Patient *</label>
                <select id="adm-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} style={fieldStyle}>
                  <option value="">Choose one of your patients</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {patients.length === 0 && <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>No patients available. Patients appear after they book with you, and patients already admitted are not listed.</p>}
              </div>
              <div>
                <label htmlFor="adm-reason" style={labelStyle}>Reason for admission *</label>
                <textarea id="adm-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={2} placeholder="Diagnosis or why the patient needs a bed" style={{ ...fieldStyle, resize: 'vertical' }} />
              </div>
            </>
          )}

          <div>
            <span style={labelStyle}>Room and bed *</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <FloorTabs floors={floors} floor={floor} onChange={(f) => { setFloor(f); setRoomId(null); setBedNo(null); }} />
              <HospitalMap rooms={pickable} floor={floor} showOccupancy selectedRoomId={roomId} onSelectRoom={(r) => { setRoomId(r.id); setBedNo(null); }} markers={mode === 'move' && admission ? [{ roomId: admission.roomId, label: admission.bedNo, color: '#64748b' }] : []} />
              <OccupancyLegend />
            </div>
          </div>

          {room ? (
            <div style={{ padding: '0.9rem 1rem', borderRadius: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Room {room.code} · {room.name} <span style={{ fontWeight: 500, color: '#64748b' }}>({room.roomType}, {floorName(room.floor)})</span></p>
              <div role="group" aria-label="Choose a bed" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.7rem' }}>
                {Array.from({ length: room.beds }, (_, i) => i + 1).map((n) => {
                  const taken = room.occupiedBeds.includes(n);
                  const active = bedNo === n;
                  return (
                    <button
                      key={n} type="button" disabled={taken} aria-pressed={active} onClick={() => setBedNo(n)}
                      style={{
                        minWidth: '4.2rem', padding: '0.5rem 0.7rem', borderRadius: '0.6rem', fontSize: '0.82rem', fontWeight: 700, cursor: taken ? 'not-allowed' : 'pointer',
                        border: `1px solid ${active ? '#4f46e5' : taken ? '#fecaca' : '#cbd5e1'}`, background: active ? '#4f46e5' : taken ? '#fee2e2' : '#ffffff',
                        color: active ? '#ffffff' : taken ? '#b91c1c' : '#0f172a',
                      }}
                    >
                      Bed {n}{taken ? ' (taken)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Click a room on the map to see its beds.</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : mode === 'move' ? 'Move patient' : 'Admit patient'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AdmitPatientModal;
