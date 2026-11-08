import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { errorText } from '../hooks/useAmbulanceData';

// Request form. Patients ask for themselves (and may name their doctor);
// doctors choose one of their own patients.
const fieldStyle = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.7rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem' };
const labelStyle = { display: 'block', marginBottom: '0.35rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' };

const RequestAmbulanceModal = ({ ambulance, onClose, onCreated }) => {
  const { user, role } = useAuth();
  const { appointments, doctors } = useData();

  const [form, setForm] = useState({ patientId: '', doctorId: '', pickupLocation: '', destination: '', reason: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ patientId: '', doctorId: '', pickupLocation: '', destination: '', reason: '' });
    setError('');
  }, [ambulance]);

  // A doctor's patients are the people who have booked with them
  const myPatients = useMemo(() => {
    if (role !== 'doctor') return [];
    const seen = new Map();
    appointments.forEach((a) => {
      if (a.doctorId === user?.id && !seen.has(a.patientId)) seen.set(a.patientId, a.patientName);
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments, role, user]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (role === 'doctor' && !form.patientId) { setError('Please choose the patient.'); return; }
    setSaving(true);
    try {
      await api.post('/ambulance-requests', {
        ambulanceId: ambulance.id,
        patientId: role === 'doctor' ? Number(form.patientId) : undefined,
        doctorId: role === 'patient' && form.doctorId ? Number(form.doctorId) : undefined,
        pickupLocation: form.pickupLocation,
        destination: form.destination,
        reason: form.reason,
      });
      await onCreated?.();
      onClose();
    } catch (err) {
      setError(errorText(err, 'Unable to send the request.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!ambulance} onClose={onClose} title={ambulance ? `Request ${ambulance.ambulanceNumber}` : ''} maxWidth="34rem">
      {ambulance && (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.88rem', color: '#475569' }}>
            {ambulance.vehicleType || 'Ambulance'} · {ambulance.vehicleNumber} · driver {ambulance.driverName}
          </p>

          {error && <p role="alert" style={{ padding: '0.7rem 0.9rem', borderRadius: '0.7rem', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

          {role === 'doctor' && (
            <div>
              <label htmlFor="amb-patient" style={labelStyle}>Patient *</label>
              <select id="amb-patient" value={form.patientId} onChange={set('patientId')} style={fieldStyle}>
                <option value="">Choose one of your patients</option>
                {myPatients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {myPatients.length === 0 && <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>You have no patients yet. Patients appear after they book with you.</p>}
            </div>
          )}

          {role === 'patient' && (
            <div>
              <label htmlFor="amb-doctor" style={labelStyle}>Your doctor (optional)</label>
              <select id="amb-doctor" value={form.doctorId} onChange={set('doctorId')} style={fieldStyle}>
                <option value="">No doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="amb-pickup" style={labelStyle}>Pickup location *</label>
            <input id="amb-pickup" value={form.pickupLocation} onChange={set('pickupLocation')} maxLength={255} placeholder="Address where the patient is" style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="amb-destination" style={labelStyle}>Destination *</label>
            <input id="amb-destination" value={form.destination} onChange={set('destination')} maxLength={255} placeholder="Hospital or place to go" style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="amb-reason" style={labelStyle}>Reason / notes</label>
            <textarea id="amb-reason" value={form.reason} onChange={set('reason')} maxLength={1000} rows={3} placeholder="What does the crew need to know?" style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Sending...' : 'Send request'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default RequestAmbulanceModal;
