import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Stethoscope, Calendar, Clock, CheckCircle, FileText, CheckCircle2, CalendarCheck, Activity } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  const [activeConsultation, setActiveConsultation] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const pendingRequests = docAppointments.filter((apt) => apt.status === 'pending');
  const confirmedQueue = docAppointments.filter((apt) => apt.status === 'confirmed');
  const completedVisits = docAppointments.filter((apt) => apt.status === 'completed');

  const handleOpenCompleteModal = (apt) => {
    setActiveConsultation(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveConsultation = (e) => {
    e.preventDefault();
    if (activeConsultation) {
      updateAppointmentStatus(activeConsultation.id, 'completed', diagnosisNotes, prescriptionText, user?.email);
      setActiveConsultation(null);
    }
  };

  return (
    <div className="page-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="hero-banner hero-doctor animate-fade-up" style={{ marginBottom: '2rem' }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.3)', marginBottom: '0.75rem', display: 'inline-flex' }}>
            <Stethoscope size={13} style={{ marginRight: '0.35rem' }} />
            Physician Clinical Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
            Welcome, {user?.name}!
          </h1>
          <p style={{ color: 'rgba(199,210,254,0.8)', fontSize: '0.9rem', maxWidth: '480px' }}>
            Specialist in {user?.specialty || 'Clinical Medicine'}. You have{' '}
            <strong style={{ color: '#fff', textDecoration: 'underline' }}>{pendingRequests.length} pending appointment request(s)</strong> awaiting review today.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative' }}>
          <Link to="/doctor/appointments" className="btn" style={{ background: '#fff', color: '#4338ca', border: 'none', boxShadow: '0 4px 16px rgba(255,255,255,0.1)' }}>
            <CalendarCheck size={18} />
            Manage All Appointments
          </Link>
          <Link to="/doctor/schedule" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <Clock size={17} />
            Set Schedule Slots
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
          <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <Clock size={22} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value" style={{ color: '#fbbf24' }}>{pendingRequests.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Calendar size={22} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="stat-label">Confirmed Queue</p>
            <p className="stat-value" style={{ color: '#818cf8' }}>{confirmedQueue.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <CheckCircle2 size={22} style={{ color: '#34d399' }} />
          </div>
          <div>
            <p className="stat-label">Treated Patients</p>
            <p className="stat-value" style={{ color: '#34d399' }}>{completedVisits.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <Activity size={22} style={{ color: '#67e8f9' }} />
          </div>
          <div>
            <p className="stat-label">Consultation Fee</p>
            <p className="stat-value" style={{ color: '#67e8f9' }}>${user?.consultationFee || 120}</p>
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
        {/* Left Column: Pending Action Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f6fc' }}>Pending Patient Requests</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Approve or decline consultation requests</p>
            </div>
            <span className="badge badge-warning">{pendingRequests.length} to review</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((apt) => (
                <div key={apt.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f6fc' }}>{apt.patientName}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{apt.patientEmail}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--bdr-subtle)', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--txt-muted)', display: 'block', marginBottom: '0.15rem' }}>Date:</span>
                      <p style={{ fontWeight: 700, color: 'var(--txt-secondary)' }}>{apt.date}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--txt-muted)', display: 'block', marginBottom: '0.15rem' }}>Time Slot:</span>
                      <p style={{ fontWeight: 700, color: 'var(--txt-secondary)' }}>{apt.timeSlot}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--txt-primary)' }}>Reason:</strong> {apt.reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--bdr-subtle)' }}>
                    <button onClick={() => updateAppointmentStatus(apt.id, 'cancelled', '', '', user?.email)} className="btn btn-sm" style={{ color: 'var(--c-rose)', background: 'transparent', border: '1px solid rgba(244,63,94,0.3)' }}>
                      Decline
                    </button>
                    <button onClick={() => updateAppointmentStatus(apt.id, 'confirmed', '', '', user?.email)} className="btn btn-sm btn-success">
                      <CheckCircle size={14} /> Accept Request
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card empty-state" style={{ padding: '2rem 1.5rem' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--c-emerald)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f6fc' }}>All caught up!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>No pending appointment requests need your review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Confirmed Active Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f6fc' }}>Active Queue</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Ready for consultation</p>
            </div>
            <Link to="/doctor/appointments" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {confirmedQueue.length > 0 ? (
              confirmedQueue.map((apt) => (
                <div key={apt.id} className="card-strong" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyItems: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f6fc' }}>{apt.patientName}</h4>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>{apt.timeSlot} • {apt.date}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--bdr-subtle)', marginBottom: '0.75rem' }}>
                    {apt.reason}
                  </p>

                  <div style={{ paddingTop: '0.25rem' }}>
                    <button onClick={() => handleOpenCompleteModal(apt)} className="btn btn-sm btn-primary w-full">
                      <FileText size={14} /> Complete & Issue Prescription
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card empty-state" style={{ padding: '2rem 1.5rem' }}>
                <Calendar size={32} style={{ color: 'var(--txt-muted)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>No confirmed appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Consultation & Prescription Modal */}
      <Modal isOpen={!!activeConsultation} onClose={() => setActiveConsultation(null)} title={`Consultation Notes — ${activeConsultation?.patientName}`}>
        <form onSubmit={handleSaveConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--bdr-subtle)', fontSize: '0.8rem', color: 'var(--txt-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <p><strong style={{ color: 'var(--txt-primary)' }}>Patient:</strong> {activeConsultation?.patientName} ({activeConsultation?.patientEmail})</p>
            <p><strong style={{ color: 'var(--txt-primary)' }}>Reason:</strong> {activeConsultation?.reason}</p>
            <p><strong style={{ color: 'var(--txt-primary)' }}>Date & Time:</strong> {activeConsultation?.date} at {activeConsultation?.timeSlot}</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Physician Diagnosis & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="Enter patient diagnosis, findings, clinical assessment..."
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Official Digital Prescription & Regimen
            </label>
            <textarea
              rows={3}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg tid x 7 days, rest, hydration..."
              className="input-field"
              style={{ fontFamily: 'monospace' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr-subtle)' }}>
            <button type="button" onClick={() => setActiveConsultation(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Sign & Mark Completed
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
