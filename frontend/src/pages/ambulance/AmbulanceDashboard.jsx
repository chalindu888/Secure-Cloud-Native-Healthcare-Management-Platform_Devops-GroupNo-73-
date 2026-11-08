import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAmbulanceData, AMBULANCE_STATUS, errorText } from '../../hooks/useAmbulanceData';
import AmbulanceRequestList, { StatusPill } from '../../components/AmbulanceRequestList';
import { Ambulance, Save } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = { background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)' };
const labelStyle = { display: 'block', marginBottom: '0.35rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' };

const AmbulanceDashboard = () => {
  const { updateProfile } = useAuth();
  const { requests, loading, error, refresh } = useAmbulanceData();

  const [ambulance, setAmbulance] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadOwn = useCallback(async () => {
    try {
      const { data } = await api.get('/ambulance/me');
      setAmbulance(data.ambulance);
      setForm((prev) => prev || {
        driverName: data.ambulance.driverName || '',
        phone: data.ambulance.phone || '',
        vehicleType: data.ambulance.vehicleType || '',
        baseLocation: data.ambulance.baseLocation || '',
        status: data.ambulance.manualStatus === 'offline' ? 'offline' : 'available',
      });
    } catch (err) {
      setFeedback({ ok: false, text: errorText(err, 'Unable to load your ambulance details.') });
    }
  }, []);

  useEffect(() => { loadOwn(); }, [loadOwn]);

  // Keep the displayed status (available / on a trip) current when requests change
  const onChanged = async () => { await Promise.all([refresh(), loadOwn()]); };
  useEffect(() => { loadOwn(); }, [requests, loadOwn]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const { data } = await api.put('/ambulance/me', form);
      setAmbulance(data.ambulance);
      updateProfile({ name: data.ambulance.driverName, phone: data.ambulance.phone });
      setFeedback({ ok: true, text: 'Your ambulance details were saved.' });
    } catch (err) {
      setFeedback({ ok: false, text: errorText(err, 'Unable to save your details.') });
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = { width: '100%' };
  const active = requests.filter((r) => ['requested', 'accepted', 'on_the_way'].includes(r.status));
  const past = requests.filter((r) => !['requested', 'accepted', 'on_the_way'].includes(r.status));

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#dc2626' }}>Ambulance Portal</span>
        <h1 className="page-title">Ambulance Dashboard</h1>
        <p className="page-subtitle">Keep your details and availability up to date. Everyone on HealthOps can see your listing.</p>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem', alignItems: 'start', marginBottom: '2.25rem' }}>
        {/* ID card */}
        <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <span style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}><Ambulance size={28} /></span>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)' }}>Ambulance ID</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{ambulance?.ambulanceNumber || '...'}</p>
            </div>
          </div>
          {ambulance && (
            <>
              <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)' }}>Vehicle number: <strong style={{ color: 'var(--txt-primary)' }}>{ambulance.vehicleNumber}</strong></p>
              <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)' }}>Status shown to everyone: <StatusPill map={AMBULANCE_STATUS} status={ambulance.status} /></p>
              {ambulance.status === 'busy' && <p style={{ fontSize: '0.82rem', color: 'var(--txt-muted)' }}>You show as "On a trip" while you have an accepted trip. Mark it completed to become available again.</p>}
            </>
          )}
        </div>

        {/* Details form */}
        <form onSubmit={save} style={{ ...cardStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Your details</h2>
          {form ? (
            <>
              <div><label htmlFor="amb-name" style={labelStyle}>Driver / service name</label><input id="amb-name" value={form.driverName} onChange={set('driverName')} maxLength={255} style={fieldStyle} /></div>
              <div><label htmlFor="amb-phone" style={labelStyle}>Contact phone</label><input id="amb-phone" value={form.phone} onChange={set('phone')} maxLength={50} style={fieldStyle} /></div>
              <div>
                <label htmlFor="amb-type" style={labelStyle}>Ambulance type</label>
                <select id="amb-type" value={form.vehicleType} onChange={set('vehicleType')} style={fieldStyle}>
                  {['', 'Basic Life Support', 'Advanced Life Support', 'Patient Transport', 'Neonatal'].map((t) => <option key={t} value={t}>{t || 'Not specified'}</option>)}
                </select>
              </div>
              <div><label htmlFor="amb-base" style={labelStyle}>Base location</label><input id="amb-base" value={form.baseLocation} onChange={set('baseLocation')} maxLength={255} style={fieldStyle} /></div>
              <div>
                <label htmlFor="amb-status" style={labelStyle}>Availability</label>
                <select id="amb-status" value={form.status} onChange={set('status')} style={fieldStyle}>
                  <option value="available">Available for requests</option>
                  <option value="offline">Offline (hidden from requests)</option>
                </select>
              </div>
              {feedback && <p role="status" style={{ padding: '0.7rem 0.9rem', borderRadius: '0.7rem', fontSize: '0.85rem', fontWeight: 600, color: feedback.ok ? '#047857' : '#b91c1c', background: feedback.ok ? '#d1fae5' : '#fee2e2' }}>{feedback.text}</p>}
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={17} /> {saving ? 'Saving...' : 'Save details'}</button>
            </>
          ) : (
            <p style={{ color: 'var(--txt-secondary)' }}>Loading...</p>
          )}
        </form>
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '1rem' }}>Trip requests</h2>
      {loading ? <p style={{ color: 'var(--txt-secondary)' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AmbulanceRequestList requests={active} role="ambulance" onChanged={onChanged} emptyText="No active requests right now. New requests appear here automatically." />
          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)', marginBottom: '0.8rem' }}>Past trips</h3>
              <AmbulanceRequestList requests={past} role="ambulance" onChanged={onChanged} emptyText="" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AmbulanceDashboard;
