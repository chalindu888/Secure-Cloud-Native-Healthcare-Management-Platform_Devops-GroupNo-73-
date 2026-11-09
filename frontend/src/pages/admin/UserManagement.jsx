import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { errorText } from '../../hooks/useAmbulanceData';
import { useAdminFetch, formatDate, timeAgo, ROLE_STYLE } from '../../hooks/useAdminData';
import Avatar from '../../components/Avatar';
import { Search, CheckCircle2, Phone, Users } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' };
const TABS = [['all', 'Everyone'], ['patient', 'Patients'], ['doctor', 'Doctors'], ['ambulance', 'Ambulances'], ['admin', 'Admins']];

const detailsOf = (u) => {
  if (u.role === 'patient') return [u.bloodGroup ? `Blood group ${u.bloodGroup}` : null, `${u.appointmentCount} ${u.appointmentCount === 1 ? 'appointment' : 'appointments'}`];
  if (u.role === 'doctor') return [u.specialty || 'Doctor', `${u.appointmentCount} ${u.appointmentCount === 1 ? 'appointment' : 'appointments'}`];
  if (u.role === 'ambulance') return [u.ambulanceNumber, u.vehicleNumber];
  return ['Hospital administrator'];
};

const UserManagement = () => {
  const { data, loading, error, refresh } = useAdminFetch('/admin/users');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [busyId, setBusyId] = useState(null);

  const tab = TABS.some(([key]) => key === params.get('role')) ? params.get('role') : 'all';
  const users = useMemo(() => data?.users || [], [data]);

  const counts = useMemo(() => {
    const result = { all: users.length };
    users.forEach((u) => { result[u.role] = (result[u.role] || 0) + 1; });
    return result;
  }, [users]);

  const q = search.trim().toLowerCase();
  const shown = users.filter((u) => {
    if (tab !== 'all' && u.role !== tab) return false;
    if (!q) return true;
    return [u.name, u.email, u.phone, u.specialty, u.vehicleNumber, u.ambulanceNumber].some((v) => (v || '').toLowerCase().includes(q));
  });

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: '', text: '' }), 4000);
  };

  const toggle = async (u) => {
    const suspending = u.isActive;
    const ok = window.confirm(suspending
      ? `Suspend ${u.name || u.email}? They will not be able to sign in until you reactivate the account.`
      : `Reactivate ${u.name || u.email}?`);
    if (!ok) return;
    setBusyId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}`, { isActive: !suspending });
      flash('ok', suspending ? `${u.name || u.email} has been suspended.` : `${u.name || u.email} can sign in again.`);
      await refresh();
    } catch (err) {
      flash('error', errorText(err, 'Unable to change this account.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ marginBottom: '1.5rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0e7490' }}>Hospital administration</span>
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle" style={{ maxWidth: '40rem' }}>Everyone who has registered on the website: patients, doctors and ambulance services. New registrations appear here automatically.</p>
      </div>

      {notice.text && (
        <p role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: '0.8rem', fontSize: '0.88rem', fontWeight: 700, color: notice.type === 'ok' ? '#047857' : '#b91c1c', background: notice.type === 'ok' ? '#d1fae5' : '#fee2e2' }}>
          {notice.type === 'ok' && <CheckCircle2 size={17} />} {notice.text}
        </p>
      )}
      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      <div className="animate-fade-up-1" style={{ ...card, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="tablist" aria-label="Filter by role" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {TABS.map(([key, label]) => {
            const active = tab === key;
            return (
              <button
                key={key} type="button" role="tab" aria-selected={active}
                onClick={() => (key === 'all' ? setParams({}) : setParams({ role: key }))}
                style={{ padding: '0.5rem 0.95rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, border: `1px solid ${active ? '#4f46e5' : '#cbd5e1'}`, background: active ? '#4f46e5' : '#ffffff', color: active ? '#ffffff' : '#475569' }}
              >
                {label} <span style={{ opacity: 0.75, fontWeight: 600 }}>{counts[key] || 0}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flex: '1 1 16rem', maxWidth: '22rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." aria-label="Search users" style={{ paddingLeft: '2.5rem', borderRadius: '999px' }} />
        </div>
      </div>

      <div className="animate-fade-up-2" style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</p>
        ) : shown.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Users size={38} style={{ margin: '0 auto 0.7rem', color: '#cbd5e1' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>{users.length === 0 ? 'Nobody has registered yet.' : 'No one matches your search.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '52rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Person', 'Role', 'Details', 'Joined', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '0.8rem 1.1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((u) => {
                  const r = ROLE_STYLE[u.role] || ROLE_STYLE.patient;
                  const [line1, line2] = detailsOf(u);
                  return (
                    <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9', opacity: u.isActive ? 1 : 0.7 }}>
                      <td style={{ padding: '0.8rem 1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <Avatar name={u.name || u.email} size="2.6rem" gradient={r.gradient} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{u.name || '(no name)'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                            {u.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#94a3b8' }}><Phone size={11} /> {u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem 1.1rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, color: r.color, background: r.bg }}>{r.label}</span>
                      </td>
                      <td style={{ padding: '0.8rem 1.1rem', fontSize: '0.82rem', color: '#334155' }}>
                        <div>{line1}</div>
                        {line2 && <div style={{ color: '#64748b' }}>{line2}</div>}
                      </td>
                      <td style={{ padding: '0.8rem 1.1rem', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' }}>
                        <div>{formatDate(u.createdAt)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{timeAgo(u.createdAt)}</div>
                      </td>
                      <td style={{ padding: '0.8rem 1.1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, color: u.isActive ? '#047857' : '#b91c1c', background: u.isActive ? '#d1fae5' : '#fee2e2' }}>
                          <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: u.isActive ? '#10b981' : '#ef4444' }} />
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1.1rem', textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button
                            type="button" disabled={busyId === u.id} onClick={() => toggle(u)}
                            style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${u.isActive ? '#fecaca' : '#a7f3d0'}`, background: u.isActive ? '#fff1f2' : '#ecfdf5', color: u.isActive ? '#b91c1c' : '#047857' }}
                          >
                            {busyId === u.id ? 'Saving...' : u.isActive ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && shown.length > 0 && <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#64748b' }}>Showing {shown.length} of {users.length} people.</p>}
    </div>
  );
};

export default UserManagement;
