import React, { useEffect, useState } from 'react';
import PrescriptionFiles from '../../components/PrescriptionFiles';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Avatar from '../../components/Avatar';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  Pill,
  Check,
  X,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_ACCENT = {
  pending: '#d97706',
  confirmed: '#059669',
  completed: '#4f46e5',
  cancelled: '#e11d48',
};

// Needs attention first, then soonest upcoming visits; finished and cancelled last (newest first)
const STATUS_ORDER = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
const sortAppointments = (a, b) => {
  const byStatus = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
  if (byStatus !== 0) return byStatus;
  const byDate = a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot);
  return a.status === 'pending' || a.status === 'confirmed' ? byDate : -byDate;
};

const parseDate = (date) => new Date(`${date}T00:00:00`);

const formatDate = (date) =>
  parseDate(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

// "Today", "Tomorrow", "In 3 days", "2 days ago"
const relativeDay = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((parseDate(date) - today) / 86400000);
  if (diff === 0) return { text: 'Today', tone: 'now' };
  if (diff === 1) return { text: 'Tomorrow', tone: 'soon' };
  if (diff > 1) return { text: `In ${diff} days`, tone: 'later' };
  return { text: diff === -1 ? 'Yesterday' : `${-diff} days ago`, tone: 'past' };
};

const RELATIVE_COLORS = {
  now: { color: '#047857', background: 'rgba(5,150,105,0.12)' },
  soon: { color: '#b45309', background: 'rgba(217,119,6,0.12)' },
  later: { color: 'var(--txt-muted)', background: 'rgba(0,0,0,0.05)' },
  past: { color: 'var(--txt-muted)', background: 'rgba(0,0,0,0.05)' },
};

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #ffffff',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--shdw-md)',
};

const modalLabelStyle = {
  display: 'block', marginBottom: '0.4rem', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569',
};

const Detail = ({ icon: Icon, label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
    <span
      style={{
        width: '2.1rem', height: '2.1rem', borderRadius: '0.65rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--c-primary-pale)', color: 'var(--c-primary)',
      }}
    >
      <Icon size={16} />
    </span>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)' }}>{label}</p>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>{children}</div>
    </div>
  </div>
);

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { appointments, patientPhotos, updateAppointmentStatus } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Complete/Prescribe Modal state
  const [activeModalApt, setActiveModalApt] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [filesVersion, setFilesVersion] = useState(0);
  // Re-read the file lists on the cards after the clinical-record dialog closes
  useEffect(() => { if (!activeModalApt) setFilesVersion((v) => v + 1); }, [activeModalApt]);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const countFor = (key) =>
    key === 'all' ? docAppointments.length : docAppointments.filter((apt) => apt.status === key).length;

  const q = search.trim().toLowerCase();
  const filtered = docAppointments
    .filter((apt) => {
      if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
      if (!q) return true;
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientEmail.toLowerCase().includes(q) ||
        (apt.reason || '').toLowerCase().includes(q)
      );
    })
    .sort(sortAppointments);

  const runAction = async (apt, status) => {
    setActionError('');
    setBusyId(apt.id);
    const result = await updateAppointmentStatus(apt.id, status);
    setBusyId(null);
    if (!result.success) setActionError(result.message);
  };

  const handleDecline = (apt) => {
    if (window.confirm(`Decline the request from ${apt.patientName} on ${formatDate(apt.date)} at ${apt.timeSlot}?`)) {
      runAction(apt, 'cancelled');
    }
  };

  const handleOpenCompleteModal = (apt) => {
    setActiveModalApt(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
    setModalError('');
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!activeModalApt) return;

    setModalError('');
    setIsSaving(true);
    const result = await updateAppointmentStatus(activeModalApt.id, 'completed', diagnosisNotes, prescriptionText);
    setIsSaving(false);

    if (!result.success) {
      setModalError(result.message);
      return;
    }
    setActiveModalApt(null);
  };

  const pendingCount = countFor('pending');

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>
          Doctor Portal
        </span>
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">
          Review requests, confirm visits, and record diagnoses and prescriptions.
        </p>
      </div>

      {/* Pending attention banner */}
      {pendingCount > 0 && activeFilter !== 'pending' && (
        <button
          type="button"
          onClick={() => setActiveFilter('pending')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', marginBottom: '1.25rem',
            padding: '0.9rem 1.1rem', borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer',
            background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', color: '#92400e',
            fontSize: '0.88rem', fontWeight: 600,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            You have {pendingCount} appointment request{pendingCount === 1 ? '' : 's'} waiting for your response.
          </span>
          <span style={{ marginLeft: 'auto', fontWeight: 800, whiteSpace: 'nowrap' }}>Review →</span>
        </button>
      )}

      {/* Filter + search */}
      <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="tablist" aria-label="Filter appointments by status" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {FILTERS.map(({ key, label }) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.5rem 0.95rem', borderRadius: 'var(--r-pill)', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 700, transition: 'all 180ms ease',
                  border: `1px solid ${active ? 'var(--c-primary)' : 'var(--bdr-default)'}`,
                  background: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.7)',
                  color: active ? '#ffffff' : 'var(--txt-secondary)',
                }}
              >
                {label}
                <span
                  style={{
                    minWidth: '1.3rem', padding: '0.05rem 0.4rem', borderRadius: 'var(--r-pill)', textAlign: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    color: active ? '#ffffff' : 'var(--txt-muted)',
                  }}
                >
                  {countFor(key)}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: '1 1 16rem', maxWidth: '22rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, email or reason..."
            aria-label="Search appointments"
            style={{ paddingLeft: '2.6rem', borderRadius: 'var(--r-pill)' }}
          />
        </div>
      </div>

      {actionError && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--c-rose-pale)', border: '1px solid var(--c-rose-border)', color: 'var(--c-rose)', fontSize: '0.85rem', fontWeight: 600 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {actionError}
        </div>
      )}

      {/* Appointments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length > 0 ? (
          filtered.map((apt) => {
            const day = relativeDay(apt.date);
            const isBusy = busyId === apt.id;
            return (
              <article
                key={apt.id}
                style={{
                  ...cardStyle, padding: '1.25rem 1.5rem', borderLeft: `5px solid ${STATUS_ACCENT[apt.status] || '#94a3b8'}`,
                  display: 'flex', flexDirection: 'column', gap: '1.1rem',
                }}
              >
                {/* Patient + status */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
                    <Avatar name={apt.patientName} src={apt.patientHasPhoto ? patientPhotos[apt.patientId] : ''} size="3.25rem" />
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{apt.patientName}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {apt.patientEmail}</span>
                        {apt.patientPhone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {apt.patientPhone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={apt.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>#{apt.id}</span>
                  </div>
                </div>

                {/* When */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', padding: '0.9rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)' }}>
                  <Detail icon={Calendar} label="Date">
                    {formatDate(apt.date)}
                    <span style={{ padding: '0.1rem 0.5rem', borderRadius: 'var(--r-pill)', fontSize: '0.68rem', fontWeight: 800, ...RELATIVE_COLORS[day.tone] }}>
                      {day.text}
                    </span>
                  </Detail>
                  <Detail icon={Clock} label="Time">{apt.timeSlot}</Detail>
                </div>

                {/* Reason */}
                <div>
                  <p style={{ marginBottom: '0.3rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)' }}>
                    Reason for visit
                  </p>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{apt.reason}</p>
                </div>

                {/* Clinical record */}
                {(apt.notes || apt.prescription) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)' }}>
                    {apt.notes && (
                      <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--txt-primary)' }}>
                        <FileText size={16} style={{ marginTop: '0.15rem', flexShrink: 0, color: 'var(--c-primary)' }} />
                        <p style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}><strong>Diagnosis:</strong> {apt.notes}</p>
                      </div>
                    )}
                    {apt.prescription && (
                      <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--txt-primary)' }}>
                        <Pill size={16} style={{ marginTop: '0.15rem', flexShrink: 0, color: 'var(--c-emerald)' }} />
                        <p style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}><strong>Prescription:</strong> {apt.prescription}</p>
                      </div>
                    )}
                  </div>
                )}

                {apt.status !== 'pending' && apt.status !== 'cancelled' && (
                  <PrescriptionFiles key={`${apt.id}-${filesVersion}`} appointmentId={apt.id} />
                )}

                {/* Actions */}
                {apt.status !== 'cancelled' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr-default)' }}>
                    {apt.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDecline(apt)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--c-rose)' }}
                        >
                          <X size={15} /> Decline
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => runAction(apt, 'confirmed')}
                          className="btn btn-success btn-sm"
                        >
                          <Check size={15} /> {isBusy ? 'Confirming...' : 'Accept appointment'}
                        </button>
                      </>
                    )}

                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDecline(apt)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--c-rose)' }}
                        >
                          <X size={15} /> Cancel visit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCompleteModal(apt)}
                          className="btn btn-primary btn-sm"
                        >
                          <FileText size={15} /> Complete &amp; write prescription
                        </button>
                      </>
                    )}

                    {apt.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleOpenCompleteModal(apt)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FileText size={15} /> Edit notes / prescription
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div style={{ ...cardStyle, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <ClipboardList size={40} style={{ color: 'var(--txt-disabled)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>
              {docAppointments.length === 0 ? 'No appointments yet' : 'No appointments match'}
            </h3>
            <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
              {docAppointments.length === 0
                ? 'When patients book a visit with you, their requests will appear here.'
                : 'Try a different status or clear your search.'}
            </p>
            {docAppointments.length > 0 && (activeFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Show all appointments
              </button>
            )}
          </div>
        )}
      </div>

      {/* Write / edit prescription */}
      <Modal
        isOpen={!!activeModalApt}
        onClose={() => setActiveModalApt(null)}
        title={`Clinical record — ${activeModalApt?.patientName || ''}`}
      >
        <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155' }}>
            <p><strong>Patient:</strong> {activeModalApt?.patientName} ({activeModalApt?.patientEmail})</p>
            <p><strong>Visit:</strong> {activeModalApt && formatDate(activeModalApt.date)} at {activeModalApt?.timeSlot}</p>
            <p style={{ overflowWrap: 'anywhere' }}><strong>Reason:</strong> {activeModalApt?.reason}</p>
          </div>

          {modalError && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.9rem', borderRadius: '0.75rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: '0.82rem', fontWeight: 600 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {modalError}
            </div>
          )}

          <div>
            <label htmlFor="apt-diagnosis" style={modalLabelStyle}>Diagnosis &amp; clinical notes *</label>
            <textarea
              id="apt-diagnosis"
              rows={4}
              maxLength={2000}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="e.g. Acute bronchitis. Wheezing on auscultation, no fever."
              required
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label htmlFor="apt-rx" style={modalLabelStyle}>Prescription (optional)</label>
            <textarea
              id="apt-rx"
              rows={4}
              maxLength={2000}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder={'e.g. 1. Amoxicillin 500mg, 1 tablet every 8 hours for 7 days\n2. Salbutamol inhaler as needed'}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {activeModalApt && (
            <PrescriptionFiles appointmentId={activeModalApt.id} canEdit />
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setActiveModalApt(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              <CheckCircle2 size={16} /> {isSaving ? 'Saving...' : 'Save record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
