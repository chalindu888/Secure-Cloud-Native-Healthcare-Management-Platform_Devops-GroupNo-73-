import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Avatar from '../../components/Avatar';
import { BedDouble, Stethoscope, Calendar, Clock, CheckCircle, FileText, CheckCircle2, CalendarCheck } from 'lucide-react';
import { PendingFoldersIcon, ConfirmedQueueIcon, TreatedPatientsIcon, FeeGrowthIcon } from '../../components/StatIcons';

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const doctorName = (user?.name || '').replace(/^dr\.?\s*/i, '').trim();
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todaysQueue = confirmedQueue.filter((apt) => apt.date === todayKey);

  const handleOpenCompleteModal = (apt) => {
    setActiveConsultation(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (activeConsultation) {
      const result = await updateAppointmentStatus(activeConsultation.id, 'completed', diagnosisNotes, prescriptionText);
      if (!result.success) {
        window.alert(result.message);
        return;
      }
      setActiveConsultation(null);
    }
  };

  return (
    <div className="page-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="hero-banner hero-doctor animate-fade-up" style={{ marginBottom: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(15,23,42,0.06)' }}>
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
          {/* The doctor's own profile photo (initials until one is added) */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ padding: '4px', borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #6366f1)', boxShadow: '0 10px 28px rgba(20,184,166,0.3)' }}>
              <div style={{ padding: '3px', borderRadius: '50%', background: '#ffffff' }}>
                <Avatar name={user?.name} src={user?.photo} size="6.5rem" gradient="linear-gradient(135deg, #14b8a6, #6366f1)" />
              </div>
            </div>
            <span title="Online" style={{ position: 'absolute', right: '0.6rem', bottom: '0.6rem', width: '1.05rem', height: '1.05rem', borderRadius: '50%', background: '#22c55e', border: '3px solid #ffffff' }} />
          </div>

          <div style={{ minWidth: 0, flex: '1 1 16rem' }}>
            <div className="badge" style={{ marginBottom: '0.6rem', display: 'inline-flex', background: '#f1f5f9', borderColor: '#e2e8f0' }}>
              <Stethoscope size={13} style={{ marginRight: '0.35rem' }} />
              {user?.specialty || 'Physician'} · Clinical Portal
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, marginBottom: '0.4rem', overflowWrap: 'anywhere' }}>
              {greeting}, Dr. {doctorName}!
            </h1>
            <p style={{ fontSize: '0.95rem', maxWidth: '34rem' }}>
              {pendingRequests.length > 0
                ? <>You have <strong>{pendingRequests.length} new appointment {pendingRequests.length === 1 ? 'request' : 'requests'}</strong> waiting for your reply.</>
                : 'You are all caught up. There are no new appointment requests.'}
              {todaysQueue.length > 0 && <> <strong>{todaysQueue.length} {todaysQueue.length === 1 ? 'patient is' : 'patients are'}</strong> booked in for today.</>}
            </p>
            {!user?.photo && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                <Link to="/doctor/profile" style={{ fontWeight: 700, color: '#4338ca' }}>Add your photo</Link> so patients can recognise you.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative' }}>
          <Link to="/doctor/appointments" className="btn" style={{ background: '#4f46e5', color: '#fff', border: 'none', boxShadow: '0 6px 18px rgba(79,70,229,0.3)' }}>
            <CalendarCheck size={18} />
            {pendingRequests.length > 0 ? `Review ${pendingRequests.length} ${pendingRequests.length === 1 ? 'request' : 'requests'}` : 'View appointments'}
          </Link>
          <Link to="/doctor/admissions" className="btn" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <BedDouble size={18} />
            Admitted patients
          </Link>
          <Link to="/doctor/schedule" className="btn" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <Clock size={17} />
            My schedule
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
          <div className="stat-icon" style={{ width: '64px', height: '64px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <PendingFoldersIcon color="#e6a21a" />
          </div>
          <div>
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value" style={{ color: '#fbbf24' }}>{pendingRequests.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <ConfirmedQueueIcon color="#6366f1" />
          </div>
          <div>
            <p className="stat-label">Confirmed Queue</p>
            <p className="stat-value" style={{ color: '#818cf8' }}>{confirmedQueue.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ width: '64px', height: '64px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <TreatedPatientsIcon color="#10b981" />
          </div>
          <div>
            <p className="stat-label">Treated Patients</p>
            <p className="stat-value" style={{ color: '#34d399' }}>{completedVisits.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ width: '64px', height: '64px', background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <FeeGrowthIcon color="#0ea5c6" />
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
