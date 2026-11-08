import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import PrescriptionFiles from '../../components/PrescriptionFiles';
import { 
  Calendar, Clock, User, PlusCircle, AlertCircle,
  CheckCircle2, ArrowRight, Activity, Heart, ChevronRight
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useData();

  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === user?.id || apt.patientEmail === user?.email
  );
  const upcomingAppointments = patientAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending'
  );
  const completedAppointments = patientAppointments.filter(
    (apt) => apt.status === 'completed'
  );

  const withPrescription = patientAppointments.filter(
    (apt) => apt.status !== 'cancelled' && (apt.prescription || apt.prescriptionFileCount > 0)
  );

  const stats = [
    {
      label: 'Total Appointments',
      value: patientAppointments.length,
      icon: Calendar,
      color: '#4f46e5',
      bg: 'rgba(99,102,241,0.15)',
      border: 'rgba(99,102,241,0.25)',
    },
    {
      label: 'Upcoming / Pending',
      value: upcomingAppointments.length,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.15)',
      border: 'rgba(251,191,36,0.25)',
    },
    {
      label: 'Completed Visits',
      value: completedAppointments.length,
      icon: CheckCircle2,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.15)',
      border: 'rgba(52,211,153,0.25)',
    },
    {
      label: 'Blood Group',
      value: user?.bloodGroup || 'O+',
      icon: Activity,
      color: '#fb7185',
      bg: 'rgba(251,113,133,0.15)',
      border: 'rgba(251,113,133,0.25)',
    },
  ];

  return (
    <div className="page-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="hero-banner hero-patient animate-fade-up" style={{ marginBottom: '2rem' }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            <Heart size={11} style={{ fill: '#fb7185', color: '#fb7185' }} />
            Patient Health Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: 'rgba(199,210,254,0.8)', fontSize: '0.9rem', maxWidth: '480px' }}>
            Track your consultations, view prescriptions, and schedule your next appointment.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative' }}>
          <Link to="/patient/book" className="btn btn-primary btn-lg" style={{ background: 'white', color: '#4f46e5', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f0ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <PlusCircle size={18} />
            Book Appointment
          </Link>
          <Link to="/patient/profile" className="btn btn-secondary">
            <User size={17} />
            My Profile
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="animate-fade-up-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <Icon size={22} style={{ color: s.color }} />
              </div>
              <div>
                <p className="stat-label">{s.label}</p>
                <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Content ── */}
      <div
        className="animate-fade-up-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Upcoming Appointments */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                Upcoming Appointments
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>Your scheduled and pending consultations</p>
            </div>
            <Link to="/patient/appointments" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '0.75rem',
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem', color: '#4f46e5',
                      }}>
                        {apt.doctorSpecialty?.slice(0, 2).toUpperCase() || 'DR'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{apt.doctorName}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>{apt.doctorSpecialty}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: '0.625rem',
                    background: '#f8fafc', border: '1px solid #f8fafc',
                    marginBottom: '0.875rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--txt-secondary)' }}>
                      <Calendar size={14} style={{ color: 'var(--txt-muted)' }} />
                      <span><strong style={{ color: '#0f172a' }}>{apt.date}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--txt-secondary)' }}>
                      <Clock size={14} style={{ color: 'var(--txt-muted)' }} />
                      <span><strong style={{ color: '#0f172a' }}>{apt.timeSlot}</strong></span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--txt-secondary)', marginBottom: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Reason:</span> {apt.reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--bdr-subtle)' }}>
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button
                        onClick={() => cancelAppointment(apt.id, user?.email)}
                        className="btn btn-sm"
                        style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}
                      >
                        Cancel
                      </button>
                    )}
                    <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="card empty-state">
                <div className="empty-state-icon">
                  <Calendar size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No upcoming appointments</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', maxWidth: '300px' }}>
                  You don't have any consultations scheduled. Book one now!
                </p>
                <Link to="/patient/book" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  <PlusCircle size={15} />
                  Book Consultation
                </Link>
              </div>
            )}
          </div>

          {/* Prescriptions from the doctor: typed notes and uploaded papers (PDF / picture) */}
          <section aria-label="My prescriptions" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>My Prescriptions</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Prescriptions your doctors have given you</p>
              </div>
              <Link to="/patient/appointments" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>
                All records <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {withPrescription.length > 0 ? withPrescription.map((apt) => (
                <div key={apt.id} style={{ padding: '1.1rem 1.25rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    {apt.doctorName} <span style={{ fontWeight: 500, color: '#64748b' }}>· {apt.doctorSpecialty} · {apt.date}</span>
                  </p>
                  {apt.prescription && (
                    <p style={{ fontSize: '0.86rem', color: '#334155', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{apt.prescription}</p>
                  )}
                  {apt.prescriptionFileCount > 0 && <PrescriptionFiles appointmentId={apt.id} />}
                </div>
              )) : (
                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#64748b', textAlign: 'center' }}>
                  No prescriptions yet. When your doctor writes or uploads one, it will appear here.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Profile Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Medical Profile Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--bdr-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Medical Profile</h3>
              <Link to="/patient/profile" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>Edit →</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Allergies', value: user?.allergies || 'None specified' },
                { label: 'Emergency Contact', value: user?.emergencyContact || 'Not recorded' },
                { label: 'Phone', value: user?.phone || '+1 (555) 000-0000' },
                { label: 'Email', value: user?.email },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)', marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="alert alert-info" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>
              <AlertCircle size={15} />
              Privacy Protected
            </div>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: '#475569' }}>
              All PHI is transmitted over TLS with JWT RBAC isolation — your health data is safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
