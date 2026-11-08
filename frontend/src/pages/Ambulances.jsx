import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAmbulanceData, AMBULANCE_STATUS } from '../hooks/useAmbulanceData';
import { StatusPill } from '../components/AmbulanceRequestList';
import RequestAmbulanceModal from '../components/RequestAmbulanceModal';
import { Ambulance, Search, Phone, MapPin, Truck, User, Siren } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const cardStyle = { background: 'var(--bg-card)', border: '1px solid #ffffff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shdw-md)' };
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'busy', label: 'On a trip' },
  { key: 'offline', label: 'Offline' },
];

// Every registered ambulance, visible to everyone
const Ambulances = () => {
  const { isAuthenticated, role } = useAuth();
  const { ambulances, requests, loading, error, refresh } = useAmbulanceData();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const canRequest = role === 'patient' || role === 'doctor';
  const q = search.trim().toLowerCase();

  const visible = useMemo(
    () => ambulances.filter((a) => (filter === 'all' || a.status === filter)
      && (!q || [a.ambulanceNumber, a.vehicleNumber, a.driverName, a.baseLocation, a.vehicleType].some((v) => (v || '').toLowerCase().includes(q)))),
    [ambulances, filter, q]
  );
  const count = (key) => (key === 'all' ? ambulances.length : ambulances.filter((a) => a.status === key).length);
  const openRequest = requests.find((r) => ['requested', 'accepted', 'on_the_way'].includes(r.status));

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#dc2626' }}>Emergency transport</span>
        <h1 className="page-title">Ambulance Service</h1>
        <p className="page-subtitle">All ambulances registered with HealthOps. Each has its own ID number, and a live status that the crew keeps up to date.</p>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      {openRequest && (
        <p style={{ ...cardStyle, marginBottom: '1.25rem', padding: '0.9rem 1.2rem', fontSize: '0.9rem', color: 'var(--txt-primary)' }}>
          You have an ambulance request in progress ({openRequest.ambulanceNumber}).{' '}
          <Link to={role === 'doctor' ? '/doctor/ambulance-requests' : '/patient/ambulance'} style={{ fontWeight: 800, color: 'var(--c-primary)' }}>View it</Link>
        </p>
      )}

      <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="group" aria-label="Filter ambulances" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button key={key} type="button" aria-pressed={active} onClick={() => setFilter(key)}
                style={{ padding: '0.45rem 0.9rem', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${active ? 'var(--c-primary)' : 'var(--bdr-default)'}`, background: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.7)', color: active ? '#ffffff' : 'var(--txt-secondary)' }}>
                {label} ({count(key)})
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flex: '1 1 16rem', maxWidth: '22rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, vehicle, driver or location..." aria-label="Search ambulances" style={{ paddingLeft: '2.6rem', borderRadius: 'var(--r-pill)' }} />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading ambulances...</p>
      ) : visible.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {visible.map((a) => (
            <div key={a.id} style={{ ...cardStyle, padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>
                  <span style={{ width: '2.4rem', height: '2.4rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}><Ambulance size={20} /></span>
                  {a.ambulanceNumber}
                </p>
                <StatusPill map={AMBULANCE_STATUS} status={a.status} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><Truck size={15} /> {a.vehicleNumber}{a.vehicleType ? ` · ${a.vehicleType}` : ''}</span>
                <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><User size={15} /> {a.driverName}</span>
                {a.baseLocation && <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><MapPin size={15} /> {a.baseLocation}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--bdr-default)' }}>
                {a.phone && <a href={`tel:${a.phone}`} className="btn btn-secondary btn-sm"><Phone size={15} /> {a.phone}</a>}
                {canRequest && (
                  <button type="button" className="btn btn-primary btn-sm" disabled={a.status !== 'available'} onClick={() => setSelected(a)}>
                    <Siren size={15} /> {a.status === 'available' ? 'Request' : 'Not available'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Ambulance size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--txt-disabled)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{ambulances.length === 0 ? 'No ambulances registered yet' : 'No ambulances match'}</h3>
          <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
            {ambulances.length === 0 ? 'Ambulance crews can register on the sign-up page and will appear here straight away.' : 'Try a different filter or search.'}
          </p>
        </div>
      )}

      {!isAuthenticated && (
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--txt-secondary)' }}>
          <Link to="/login" style={{ fontWeight: 800, color: 'var(--c-primary)' }}>Sign in</Link> as a patient or doctor to request an ambulance, or{' '}
          <Link to="/register" style={{ fontWeight: 800, color: 'var(--c-primary)' }}>register your ambulance</Link>.
        </p>
      )}

      <RequestAmbulanceModal ambulance={selected} onClose={() => setSelected(null)} onCreated={refresh} />
    </div>
  );
};

export default Ambulances;
