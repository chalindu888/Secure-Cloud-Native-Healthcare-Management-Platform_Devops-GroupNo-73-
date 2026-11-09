import React, { useState } from 'react';
import { useAdminFetch, timeAgo } from '../../hooks/useAdminData';
import { Search, UserPlus, BedDouble, LogOut, ShieldAlert, ShieldCheck, ClipboardList } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' };

const EVENTS = {
  USER_REGISTERED: { label: 'New registration', icon: UserPlus, color: '#4f46e5', bg: '#eef2ff', group: 'registrations' },
  PATIENT_ADMITTED: { label: 'Patient admitted', icon: BedDouble, color: '#7c3aed', bg: '#ede9fe', group: 'hospital' },
  PATIENT_DISCHARGED: { label: 'Patient discharged', icon: LogOut, color: '#0f766e', bg: '#ccfbf1', group: 'hospital' },
  USER_SUSPENDED: { label: 'Account suspended', icon: ShieldAlert, color: '#b91c1c', bg: '#fee2e2', group: 'admin' },
  USER_REACTIVATED: { label: 'Account reactivated', icon: ShieldCheck, color: '#047857', bg: '#d1fae5', group: 'admin' },
};
const TABS = [['all', 'Everything'], ['registrations', 'Registrations'], ['hospital', 'Admissions'], ['admin', 'Admin actions']];

const AuditLogs = () => {
  const { data, loading, error } = useAdminFetch('/admin/audit-logs');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const logs = data?.logs || [];
  const q = search.trim().toLowerCase();
  const shown = logs.filter((log) => {
    const ev = EVENTS[log.action];
    if (tab !== 'all' && ev?.group !== tab) return false;
    return !q || log.target.toLowerCase().includes(q) || log.actor.toLowerCase().includes(q);
  });

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ marginBottom: '1.5rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0e7490' }}>Hospital administration</span>
        <h1 className="page-title">Activity log</h1>
        <p className="page-subtitle" style={{ maxWidth: '40rem' }}>What has happened on the website: new registrations, patients admitted or discharged, and actions taken by administrators. Newest first.</p>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      <div className="animate-fade-up-1" style={{ ...card, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="tablist" aria-label="Filter activity" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {TABS.map(([key, label]) => {
            const active = tab === key;
            return (
              <button key={key} type="button" role="tab" aria-selected={active} onClick={() => setTab(key)}
                style={{ padding: '0.5rem 0.95rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, border: `1px solid ${active ? '#4f46e5' : '#cbd5e1'}`, background: active ? '#4f46e5' : '#ffffff', color: active ? '#ffffff' : '#475569' }}>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flex: '1 1 16rem', maxWidth: '22rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." aria-label="Search activity" style={{ paddingLeft: '2.5rem', borderRadius: '999px' }} />
        </div>
      </div>

      <div className="animate-fade-up-2" style={{ ...card, padding: '0.5rem 1.25rem' }}>
        {loading ? (
          <p style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>Loading...</p>
        ) : shown.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 0.6rem', color: '#cbd5e1' }} />
            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>Nothing to show.</p>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {shown.map((log) => {
              const ev = EVENTS[log.action] || { label: log.action, icon: ClipboardList, color: '#475569', bg: '#f1f5f9' };
              const Icon = ev.icon;
              return (
                <li key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: ev.bg, color: ev.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: ev.color }}>{ev.label}</span>
                    <span style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', overflowWrap: 'anywhere' }}>{log.target}</span>
                    {log.action !== 'USER_REGISTERED' && <span style={{ fontSize: '0.76rem', color: '#64748b' }}>by {log.actor}</span>}
                  </span>
                  <span title={new Date(log.timestamp).toLocaleString()} style={{ flexShrink: 0, fontSize: '0.78rem', color: '#64748b' }}>{timeAgo(log.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
