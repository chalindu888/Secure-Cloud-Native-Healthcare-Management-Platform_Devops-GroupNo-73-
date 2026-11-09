import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminFetch, timeAgo, ROLE_STYLE } from '../../hooks/useAdminData';
import Avatar from '../../components/Avatar';
import {
  Users, Stethoscope, Ambulance, BedDouble, Calendar, ClipboardList, ShieldCheck, Server, ArrowRight, UserPlus, AlertTriangle,
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' };

const StatCard = ({ icon: Icon, color, bg, label, value, hint, to }) => {
  const body = (
    <div style={{ ...card, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
      <span style={{ width: '3.4rem', height: '3.4rem', borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={26} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{label}</p>
        <p style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.15, color }}>{value}</p>
        {hint && <p style={{ fontSize: '0.76rem', color: '#64748b' }}>{hint}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>{body}</Link> : body;
};

const PIPELINE = [
  ['pending', 'Waiting for the doctor', '#f59e0b'],
  ['confirmed', 'Confirmed', '#3b82f6'],
  ['completed', 'Completed', '#10b981'],
  ['cancelled', 'Cancelled', '#94a3b8'],
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data, loading, error } = useAdminFetch('/admin/overview');

  const roles = data?.users.byRole || {};
  const count = (role) => roles[role]?.total || 0;
  const fresh = (role) => roles[role]?.newThisWeek || 0;
  const newThisWeek = fresh('patient') + fresh('doctor') + fresh('ambulance');
  const apt = data?.appointments;

  return (
    <div className="page-wrapper">
      {/* Welcome */}
      <div className="animate-fade-up" style={{ ...card, padding: '1.75rem 2rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0e7490' }}>Hospital administration</span>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
            Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '34rem' }}>
            {loading ? 'Loading the latest numbers...' : newThisWeek > 0
              ? <><strong style={{ color: '#0f172a' }}>{newThisWeek} new {newThisWeek === 1 ? 'person has' : 'people have'} registered</strong> in the last 7 days.</>
              : 'No new registrations in the last 7 days.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
          <Link to="/admin/users" className="btn" style={{ background: '#4f46e5', color: '#ffffff', border: 'none', boxShadow: '0 6px 18px rgba(79,70,229,0.28)' }}>
            <Users size={18} /> Manage users
          </Link>
          <Link to="/admin/audit-logs" className="btn" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <ClipboardList size={18} /> Activity log
          </Link>
        </div>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      {data && data.users.suspended > 0 && (
        <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', padding: '0.8rem 1rem', borderRadius: '0.9rem', background: '#fef3c7', color: '#92400e', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>
          <AlertTriangle size={18} /> {data.users.suspended} {data.users.suspended === 1 ? 'account is' : 'accounts are'} suspended. Review them <ArrowRight size={15} />
        </Link>
      )}

      {/* Live numbers */}
      <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard icon={Users} color="#4f46e5" bg="#eef2ff" label="Registered patients" value={count('patient')} hint={`${fresh('patient')} new this week`} to="/admin/users?role=patient" />
        <StatCard icon={Stethoscope} color="#0f766e" bg="#ccfbf1" label="Registered doctors" value={count('doctor')} hint={`${fresh('doctor')} new this week`} to="/admin/users?role=doctor" />
        <StatCard icon={Ambulance} color="#b91c1c" bg="#fee2e2" label="Ambulances" value={data?.ambulances.total ?? 0} hint={`${data?.ambulances.activeTrips ?? 0} on a trip or requested`} to="/admin/users?role=ambulance" />
        <StatCard icon={BedDouble} color="#7c3aed" bg="#ede9fe" label="Patients in hospital" value={data?.hospital.admitted ?? 0} hint={`of ${data?.hospital.totalBeds ?? 0} beds`} />
        <StatCard icon={Calendar} color="#b45309" bg="#fef3c7" label="Appointments today" value={apt?.today ?? 0} hint={`${apt?.total ?? 0} booked in total`} />
      </div>

      <div className="animate-fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
        {/* Recently registered */}
        <section aria-label="Recently registered" style={{ ...card, padding: '1.4rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}><UserPlus size={19} style={{ color: '#4f46e5' }} /> Recently registered</h2>
            <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>See everyone <ArrowRight size={14} /></Link>
          </div>
          {data && data.recentUsers.length === 0 && <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Nobody has registered yet.</p>}
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: 0, padding: 0, listStyle: 'none' }}>
            {(data?.recentUsers || []).map((u) => {
              const r = ROLE_STYLE[u.role] || ROLE_STYLE.patient;
              return (
                <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.2rem', borderBottom: '1px solid #f1f5f9' }}>
                  <Avatar name={u.name || u.email} size="2.5rem" gradient={r.gradient} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || u.email}</span>
                    <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, color: r.color, background: r.bg }}>{r.label}</span>
                    <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.72rem', color: '#64748b' }}>{timeAgo(u.createdAt)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Appointments */}
        <section aria-label="Appointments" style={{ ...card, padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}><Calendar size={19} style={{ color: '#4f46e5' }} /> Appointments</h2>
          {PIPELINE.map(([status, label, color]) => {
            const n = apt?.byStatus[status] || 0;
            const pct = apt?.total ? (n / apt.total) * 100 : 0;
            return (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  <span>{label}</span><span>{n}</span>
                </div>
                <div style={{ height: '0.6rem', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: color }} />
                </div>
              </div>
            );
          })}
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{apt?.total ?? 0} {apt?.total === 1 ? 'appointment' : 'appointments'} booked in total.</p>
        </section>
      </div>

      {/* Shortcuts */}
      <div className="animate-fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {[
          { to: '/admin/users', icon: Users, title: 'Users', text: 'Patients, doctors and ambulances' },
          { to: '/ambulances', icon: Ambulance, title: 'Ambulance directory', text: 'What patients see' },
          { to: '/admin/audit-logs', icon: ShieldCheck, title: 'Activity log', text: 'Registrations and admin actions' },
          { to: '/admin/devops', icon: Server, title: 'System health', text: 'Servers and deployments' },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} style={{ ...card, display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.95rem 1.1rem', textDecoration: 'none' }}>
            <span style={{ display: 'flex', padding: '0.6rem', borderRadius: '0.8rem', background: '#f1f5f9', color: '#334155' }}><Icon size={20} /></span>
            <span><span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{title}</span><span style={{ fontSize: '0.76rem', color: '#64748b' }}>{text}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
