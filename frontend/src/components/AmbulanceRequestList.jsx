import React, { useState } from 'react';
import { Ambulance, MapPin, Navigation, Phone, User, Stethoscope, Clock, FileText } from 'lucide-react';
import api from '../services/api';
import { REQUEST_STATUS, errorText } from '../hooks/useAmbulanceData';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = {
  background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)',
};

export const StatusPill = ({ map, status }) => {
  const s = map[status] || { label: status, color: '#475569', bg: '#e2e8f0' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
};

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const Line = ({ icon: Icon, children, color = 'var(--txt-secondary)' }) => (
  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.86rem', color, overflowWrap: 'anywhere' }}>
    <Icon size={15} style={{ marginTop: '0.18rem', flexShrink: 0, color: 'var(--txt-muted)' }} />
    <span>{children}</span>
  </p>
);

// Cards for ambulance requests. `role` decides which details and buttons are shown.
const AmbulanceRequestList = ({ requests, role, onChanged, emptyText }) => {
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const update = async (request, status) => {
    setBusyId(request.id);
    setMessage('');
    try {
      await api.patch(`/ambulance-requests/${request.id}`, { status });
      await onChanged?.();
    } catch (err) {
      setMessage(errorText(err, 'Unable to update the request.'));
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div style={{ ...cardStyle, padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Ambulance size={38} style={{ margin: '0 auto 0.75rem', color: 'var(--txt-disabled)' }} />
        <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)' }}>{emptyText}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {message && (
        <p role="alert" style={{ padding: '0.8rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{message}</p>
      )}
      {requests.map((r) => {
        const isAmbulance = role === 'ambulance';
        const canCancel = !isAmbulance && (r.status === 'requested' || r.status === 'accepted');
        const nextActions = isAmbulance
          ? ({
              requested: [{ status: 'accepted', label: 'Accept', primary: true }, { status: 'declined', label: 'Decline' }],
              accepted: [{ status: 'on_the_way', label: 'On the way', primary: true }, { status: 'completed', label: 'Mark completed' }],
              on_the_way: [{ status: 'completed', label: 'Mark completed', primary: true }],
            }[r.status] || [])
          : [];

        return (
          <div key={r.id} style={{ ...cardStyle, padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>
                <Ambulance size={18} style={{ color: '#dc2626' }} />
                {r.ambulanceNumber} <span style={{ fontWeight: 600, color: 'var(--txt-muted)' }}>· {r.vehicleNumber}</span>
              </p>
              <StatusPill map={REQUEST_STATUS} status={r.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.5rem 1.5rem' }}>
              <Line icon={MapPin}><strong>Pickup:</strong> {r.pickupLocation}</Line>
              <Line icon={Navigation}><strong>Destination:</strong> {r.destination}</Line>
              <Line icon={User}><strong>Patient:</strong> {r.patientName}{r.patientPhone ? ` · ${r.patientPhone}` : ''}</Line>
              {r.doctorName && <Line icon={Stethoscope}><strong>Doctor:</strong> {r.doctorName}</Line>}
              {!isAmbulance && <Line icon={Phone}><strong>Driver:</strong> {r.driverName}{r.ambulancePhone ? ` · ${r.ambulancePhone}` : ''}</Line>}
              <Line icon={Clock}>{formatWhen(r.createdAt)} · requested by {r.requestedBy}</Line>
            </div>
            {r.reason && <Line icon={FileText}><strong>Reason:</strong> {r.reason}</Line>}

            {(canCancel || nextActions.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', paddingTop: '0.8rem', borderTop: '1px solid var(--bdr-default)' }}>
                {nextActions.map((a) => (
                  <button key={a.status} type="button" disabled={busyId === r.id} onClick={() => update(r, a.status)} className={`btn btn-sm ${a.primary ? 'btn-primary' : 'btn-secondary'}`}>
                    {a.label}
                  </button>
                ))}
                {canCancel && (
                  <button type="button" disabled={busyId === r.id} onClick={() => update(r, 'cancelled')} className="btn btn-secondary btn-sm">
                    Cancel request
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AmbulanceRequestList;
