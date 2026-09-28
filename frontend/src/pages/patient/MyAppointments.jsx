import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Calendar, Clock, FileText, PlusCircle, Stethoscope, FileCheck, Search } from 'lucide-react';

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeModalAppointment, setActiveModalAppointment] = useState(null);

  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === user?.id || apt.patientEmail === user?.email
  );

  const filtered = patientAppointments.filter((apt) => {
    if (activeFilter === 'upcoming') {
      return apt.status === 'confirmed' || apt.status === 'pending';
    }
    if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        apt.doctorName.toLowerCase().includes(q) ||
        apt.doctorSpecialty.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">My Consultations & History</h1>
          <p className="page-subtitle" style={{ maxWidth: '600px' }}>
            View upcoming doctor appointments, cancel bookings, and review completed medical prescriptions.
          </p>
        </div>
        <Link to="/patient/book" className="btn btn-primary">
          <PlusCircle size={16} />
          New Appointment
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card animate-fade-up-1" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: 'var(--r-md)' }}>
            {['all', 'upcoming', 'pending', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                  background: activeFilter === tab ? 'var(--c-primary-pale)' : 'transparent',
                  color: activeFilter === tab ? 'var(--c-primary-light)' : 'var(--txt-secondary)',
                  border: `1px solid ${activeFilter === tab ? 'var(--c-primary-border)' : 'transparent'}`,
                  transition: 'all 200ms ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="animate-fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.length > 0 ? (
          filtered.map((apt) => (
            <div key={apt.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--bdr-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--r-md)',
                    background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-primary-light)',
                  }}>
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0f6fc' }}>{apt.doctorName}</h3>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-primary-light)' }}>{apt.doctorSpecialty}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <StatusBadge status={apt.status} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)' }}>Ref: {apt.id}</span>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                  <Calendar size={15} style={{ color: 'var(--txt-muted)' }} />
                  <span>Date: <strong style={{ color: '#f0f6fc' }}>{apt.date}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                  <Clock size={15} style={{ color: 'var(--txt-muted)' }} />
                  <span>Time: <strong style={{ color: '#f0f6fc' }}>{apt.timeSlot}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                  <FileText size={15} style={{ color: 'var(--txt-muted)' }} />
                  <span>Booked: <strong style={{ color: '#f0f6fc' }}>{new Date(apt.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)' }}>
                  <strong style={{ color: 'var(--txt-primary)' }}>Reason for Visit:</strong> {apt.reason}
                </p>
              </div>

              {(apt.notes || apt.prescription) && (
                <div style={{
                  padding: '1rem', borderRadius: 'var(--r-md)', background: 'var(--c-cyan-pale)', border: '1px solid rgba(34,211,238,0.2)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--c-cyan)' }}>
                    <FileCheck size={18} style={{ marginTop: '0.1rem' }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Medical Notes & Prescription Available</span>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(34,211,238,0.7)' }}>{apt.prescription || apt.notes}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModalAppointment(apt)} className="btn btn-sm btn-accent" style={{ flexShrink: 0 }}>
                    View Prescription
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr-subtle)' }}>
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button onClick={() => cancelAppointment(apt.id, user?.email)} className="btn btn-sm btn-danger">
                    Cancel Appointment
                  </button>
                )}
                {(apt.notes || apt.prescription) && (
                  <button onClick={() => setActiveModalAppointment(apt)} className="btn btn-sm btn-primary">
                    Medical Report
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card empty-state">
            <div className="empty-state-icon"><Calendar size={32} /></div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0f6fc' }}>No appointments found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', maxWidth: '400px' }}>
              No appointments match the selected filter. Schedule a new consultation with one of our certified specialists.
            </p>
            <Link to="/patient/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <PlusCircle size={16} />
              Book Appointment
            </Link>
          </div>
        )}
      </div>

      <Modal isOpen={!!activeModalAppointment} onClose={() => setActiveModalAppointment(null)} title="Consultation Record & Prescription">
        {activeModalAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--txt-primary)' }}>
            
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r-md)', border: '1px solid var(--bdr-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt-secondary)' }}>Doctor:</span>
                <span style={{ fontWeight: 700 }}>{activeModalAppointment.doctorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt-secondary)' }}>Specialty:</span>
                <span style={{ fontWeight: 700, color: 'var(--c-primary-light)' }}>{activeModalAppointment.doctorSpecialty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt-secondary)' }}>Date & Time:</span>
                <span style={{ fontWeight: 700 }}>{activeModalAppointment.date} ({activeModalAppointment.timeSlot})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt-secondary)' }}>Appointment ID:</span>
                <span style={{ fontWeight: 700, color: 'var(--txt-muted)' }}>{activeModalAppointment.id}</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Physician Clinical Notes</h4>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {activeModalAppointment.notes || 'No doctor clinical notes recorded.'}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Official Medical Prescription</h4>
              <div style={{ padding: '1rem', background: 'var(--c-emerald-pale)', border: '1px solid var(--c-emerald-border)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--c-emerald)', whiteSpace: 'pre-wrap' }}>
                {activeModalAppointment.prescription || 'No medications prescribed.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--bdr-subtle)' }}>
              <button onClick={() => setActiveModalAppointment(null)} className="btn btn-secondary">
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
