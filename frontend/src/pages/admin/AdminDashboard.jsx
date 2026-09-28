import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Users, Stethoscope, Calendar, ShieldCheck, Server, ArrowRight, Cpu, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { users, appointments, auditLogs } = useData();

  const totalPatients = users.filter((u) => u.role === 'patient').length;
  const totalDoctors = users.filter((u) => u.role === 'doctor').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="page-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="hero-banner hero-admin animate-fade-up" style={{ marginBottom: '2rem' }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px',
          background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div className="badge badge-success" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            <span className="badge-dot animate-pulse"></span>
            Cloud Infrastructure & Security Admin
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
            HealthOps Operations Command
          </h1>
          <p style={{ color: 'rgba(209,250,229,0.8)', fontSize: '0.9rem', maxWidth: '480px' }}>
            Real-time control plane for user access governance, healthcare appointment metrics, and DevSecOps observability.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative' }}>
          <Link to="/admin/devops" className="btn btn-primary btn-lg" style={{ background: '#10b981', color: '#022c22', border: 'none', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#34d399'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            <Server size={18} />
            DevSecOps Telemetry
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            <Users size={17} />
            Manage Users
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div
        className="animate-fade-up-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Users size={22} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="stat-label">Total Users</p>
            <p className="stat-value" style={{ color: '#818cf8' }}>{users.length}</p>
            <p className="stat-sub">{totalPatients} Patients • {totalAdmins} Admin</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <Stethoscope size={22} style={{ color: '#67e8f9' }} />
          </div>
          <div>
            <p className="stat-label">Active Doctors</p>
            <p className="stat-value" style={{ color: '#67e8f9' }}>{totalDoctors}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <Calendar size={22} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <p className="stat-label">Total Appointments</p>
            <p className="stat-value" style={{ color: '#fbbf24' }}>{appointments.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <Cpu size={22} style={{ color: '#34d399' }} />
          </div>
          <div>
            <p className="stat-label">System Uptime</p>
            <p className="stat-value" style={{ color: '#34d399' }}>99.98%</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div
        className="animate-fade-up-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Col: Pipeline & DevSecOps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--bdr-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0f6fc' }}>Appointment Pipeline</h3>
              <span className="badge badge-muted">{appointments.length} Total</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#c7d2fe', marginBottom: '0.4rem' }}>
                  <span>Completed Consultations</span>
                  <span>{completedAppointments}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(completedAppointments / (appointments.length || 1)) * 100}%`, background: '#818cf8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#6ee7b7', marginBottom: '0.4rem' }}>
                  <span>Confirmed & Scheduled</span>
                  <span>{confirmedAppointments}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(confirmedAppointments / (appointments.length || 1)) * 100}%`, background: '#34d399' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#fcd34d', marginBottom: '0.4rem' }}>
                  <span>Pending Triage Review</span>
                  <span>{pendingAppointments}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(pendingAppointments / (appointments.length || 1)) * 100}%`, background: '#fbbf24' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr-subtle)', textAlign: 'right' }}>
              <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>
                View All Records <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="card-strong" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={18} style={{ color: '#34d399' }} />
              DevSecOps Compliance Baseline
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bdr-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Vulnerability Scan</span>
                <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>0 Critical (Trivy)</strong>
              </div>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bdr-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>SonarQube Gate</span>
                <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>Passed (A)</strong>
              </div>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bdr-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Deployment Engine</span>
                <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>Argo CD GitOps</strong>
              </div>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bdr-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Cluster Resilience</span>
                <strong style={{ fontSize: '0.85rem', color: '#67e8f9' }}>Multi-Replica Pods</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Audit Logs */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--bdr-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0f6fc' }}>Recent Security Logs</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Audit trail of critical mutations</p>
            </div>
            <Link to="/admin/audit-logs" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>Full Trail →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.08)', color: '#f0f6fc' }}>
                    {log.action}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>{log.target}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--txt-muted)' }}>Actor: {log.actor}</span>
                  <span style={{ fontWeight: 700, color: log.status === 'SUCCESS' ? '#34d399' : log.status === 'SYNCED' ? '#67e8f9' : '#fb7185' }}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
