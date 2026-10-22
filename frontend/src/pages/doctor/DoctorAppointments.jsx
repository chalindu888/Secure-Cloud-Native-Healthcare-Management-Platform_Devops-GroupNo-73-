import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  Calendar,
  Clock,
  Stethoscope,
  Search,
  CheckCircle,
  FileText,
  CheckCircle2,
  X,
  Pill,
  ClipboardList,
  Pencil
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses flex/grid `gap` and inline padding instead.

const FILTER_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

// Pending requests need action first, then upcoming confirmed visits
const STATUS_ORDER = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [decliningId, setDecliningId] = useState(null);

  // Complete/Prescribe Modal state
  const [activeModalApt, setActiveModalApt] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all'
      ? docAppointments.length
      : docAppointments.filter((apt) => apt.status === tab).length;
    return acc;
  }, {});

  const filtered = docAppointments
    .filter((apt) => {
      if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          apt.patientName.toLowerCase().includes(q) ||
          apt.patientEmail.toLowerCase().includes(q) ||
          apt.reason.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const byStatus = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      if (byStatus !== 0) return byStatus;
      return `${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`);
    });

  const handleOpenCompleteModal = (apt) => {
    setActiveModalApt(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (activeModalApt) {
      updateAppointmentStatus(
        activeModalApt.id,
        'completed',
        diagnosisNotes,
        prescriptionText,
        user?.email
      );
      setActiveModalApt(null);
    }
  };

  const handleDecline = (aptId) => {
    updateAppointmentStatus(aptId, 'cancelled', '', '', user?.email);
    setDecliningId(null);
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearch('');
  };

  return (
    <div className="page-wrapper flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Clinical Appointments</h1>
          <p className="page-subtitle">
            Review new requests, confirm visits, and record diagnoses and prescriptions.
          </p>
        </div>
        {counts.pending > 0 && (
          <button
            onClick={() => setActiveFilter('pending')}
            className="badge badge-warning self-start md:self-auto"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <span className="badge-dot"></span>
            {counts.pending} request{counts.pending > 1 ? 's' : ''} awaiting your response
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-strong flex flex-col lg:flex-row gap-4 justify-between lg:items-center"
        style={{ padding: '1rem' }}
      >
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab)}
                className={`inline-flex items-center gap-2 rounded-full text-sm font-semibold capitalize transition border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                }`}
                style={{ padding: '0.45rem 0.9rem' }}
              >
                {tab}
                <span
                  className={`rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                  style={{ padding: '0.05rem 0.5rem' }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className="absolute text-slate-400 pointer-events-none"
            style={{ left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, email or symptoms"
            aria-label="Search appointments"
            style={{ paddingLeft: '2.6rem', paddingRight: search ? '2.6rem' : undefined }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute text-slate-400 hover:text-slate-700 rounded-full"
              style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex flex-col gap-5">
        {filtered.length > 0 ? (
          filtered.map((apt) => (
            <article
              key={apt.id}
              className={`card-strong flex flex-col gap-5 border-l-4 ${
                apt.status === 'pending'
                  ? 'border-l-amber-400'
                  : apt.status === 'confirmed'
                  ? 'border-l-emerald-500'
                  : apt.status === 'completed'
                  ? 'border-l-indigo-500'
                  : 'border-l-slate-300'
              }`}
              style={{ padding: '1.5rem' }}
            >
              {/* Patient + Status */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {getInitials(apt.patientName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg text-slate-900 truncate">{apt.patientName}</h3>
                    <p className="text-sm text-slate-500 truncate">{apt.patientEmail}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={apt.status} />
                  <span className="text-xs text-slate-400">Ref #{apt.id}</span>
                </div>
              </div>

              {/* When & What */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Calendar, label: 'Date', value: formatDate(apt.date) },
                  { icon: Clock, label: 'Time', value: apt.timeSlot },
                  { icon: Stethoscope, label: 'Specialty', value: apt.doctorSpecialty }
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100"
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    <Icon size={18} className="text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason for Visit */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for visit</p>
                <p className="text-sm text-slate-800">{apt.reason}</p>
              </div>

              {/* Existing Notes or Prescriptions */}
              {(apt.notes || apt.prescription) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {apt.notes && (
                    <div
                      className="flex gap-3 rounded-xl bg-indigo-50 border border-indigo-100"
                      style={{ padding: '0.9rem 1rem' }}
                    >
                      <ClipboardList size={18} className="text-indigo-600 shrink-0" style={{ marginTop: '0.1rem' }} />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Diagnosis</p>
                        <p className="text-sm text-slate-800">{apt.notes}</p>
                      </div>
                    </div>
                  )}
                  {apt.prescription && (
                    <div
                      className="flex gap-3 rounded-xl bg-emerald-50 border border-emerald-100"
                      style={{ padding: '0.9rem 1rem' }}
                    >
                      <Pill size={18} className="text-emerald-600 shrink-0" style={{ marginTop: '0.1rem' }} />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Prescription</p>
                        <p className="text-sm text-slate-800 whitespace-pre-line">{apt.prescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {apt.status !== 'cancelled' && (
                <div
                  className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100"
                  style={{ paddingTop: '1rem' }}
                >
                  {apt.status === 'pending' && (
                    decliningId === apt.id ? (
                      <>
                        <span className="text-sm text-slate-600 mr-auto">
                          Decline this request? The patient will be notified.
                        </span>
                        <button onClick={() => setDecliningId(null)} className="btn btn-secondary btn-sm">
                          Keep Request
                        </button>
                        <button onClick={() => handleDecline(apt.id)} className="btn btn-danger btn-sm">
                          Yes, Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setDecliningId(apt.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--c-rose)' }}
                        >
                          <X size={16} />
                          Decline
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed', '', '', user?.email)}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={16} />
                          Accept Appointment
                        </button>
                      </>
                    )
                  )}

                  {apt.status === 'confirmed' && (
                    <button onClick={() => handleOpenCompleteModal(apt)} className="btn btn-primary btn-sm">
                      <FileText size={16} />
                      Complete Visit & Write Prescription
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <button onClick={() => handleOpenCompleteModal(apt)} className="btn btn-secondary btn-sm">
                      <Pencil size={16} />
                      Edit Notes / Prescription
                    </button>
                  )}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="card-strong empty-state">
            <div className="empty-state-icon">
              <Calendar size={28} />
            </div>
            <h3 className="text-lg text-slate-800">No appointments found</h3>
            <p className="text-sm text-slate-500">
              {search || activeFilter !== 'all'
                ? 'Nothing matches your current filter or search.'
                : 'You have no appointments yet.'}
            </p>
            {(search || activeFilter !== 'all') && (
              <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal to Write / Edit Prescription */}
      <Modal
        isOpen={!!activeModalApt}
        onClose={() => setActiveModalApt(null)}
        title={`Clinical Record: ${activeModalApt?.patientName}`}
      >
        <form onSubmit={handleSaveModal} className="flex flex-col gap-5" style={{ padding: '1.5rem' }}>
          <div
            className="flex flex-col gap-1 text-sm rounded-xl bg-slate-50 border border-slate-200"
            style={{ padding: '0.9rem 1rem' }}
          >
            <p><strong>Patient:</strong> {activeModalApt?.patientName} ({activeModalApt?.patientEmail})</p>
            <p><strong>Reason for visit:</strong> {activeModalApt?.reason}</p>
            <p><strong>When:</strong> {formatDate(activeModalApt?.date)} at {activeModalApt?.timeSlot}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="diagnosis-notes" className="text-sm font-bold text-slate-700">
              Diagnosis & clinical notes
            </label>
            <textarea
              id="diagnosis-notes"
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="e.g. Patient presents with acute bronchitis. Lungs show wheezing..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="prescription-text" className="text-sm font-bold text-slate-700">
              Prescription (Rx)
            </label>
            <textarea
              id="prescription-text"
              rows={4}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder={'e.g. 1. Amoxicillin 500mg (1 tablet every 8h for 7 days)\n2. Salbutamol Inhaler as needed'}
              required
            />
            <p className="text-xs text-slate-500">Put each medicine on its own line.</p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100" style={{ paddingTop: '1rem' }}>
            <button type="button" onClick={() => setActiveModalApt(null)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={16} />
              Save & Complete Visit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
