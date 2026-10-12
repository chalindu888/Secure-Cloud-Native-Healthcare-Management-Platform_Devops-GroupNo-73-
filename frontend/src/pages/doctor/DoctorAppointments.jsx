import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  CheckCircle, 
  FileText, 
  CheckCircle2,
  X,
  Layers,
  XCircle,
  RotateCcw,
  Edit3
} from 'lucide-react';

const formatAppointmentDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Complete/Prescribe Modal state
  const [activeModalApt, setActiveModalApt] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const filtered = docAppointments.filter((apt) => {
    if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        apt.patientName?.toLowerCase().includes(q) ||
        apt.patientEmail?.toLowerCase().includes(q) ||
        apt.reason?.toLowerCase().includes(q)
      );
    }
    return true;
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

  const filterTabs = [
    {
      id: 'all',
      label: 'All',
      icon: Layers,
      count: docAppointments.length,
      activeStyle: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        color: '#ffffff',
        border: '1.5px solid #4338ca',
        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
      },
      inactiveStyle: {
        background: '#ffffff',
        color: '#334155',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      activeBadgeStyle: {
        background: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      },
      inactiveBadgeStyle: {
        background: '#f1f5f9',
        color: '#475569',
      },
      iconColor: '#4f46e5',
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      count: docAppointments.filter((apt) => apt.status === 'pending').length,
      activeStyle: {
        background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        color: '#ffffff',
        border: '1.5px solid #b45309',
        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
      },
      inactiveStyle: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1.5px solid #fcd34d',
        boxShadow: '0 1px 3px rgba(217, 119, 6, 0.08)',
      },
      activeBadgeStyle: {
        background: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      },
      inactiveBadgeStyle: {
        background: '#fef3c7',
        color: '#92400e',
      },
      iconColor: '#d97706',
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle2,
      count: docAppointments.filter((apt) => apt.status === 'confirmed').length,
      activeStyle: {
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        color: '#ffffff',
        border: '1.5px solid #047857',
        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
      },
      inactiveStyle: {
        background: '#ecfdf5',
        color: '#065f46',
        border: '1.5px solid #86efac',
        boxShadow: '0 1px 3px rgba(5, 150, 105, 0.08)',
      },
      activeBadgeStyle: {
        background: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      },
      inactiveBadgeStyle: {
        background: '#d1fae5',
        color: '#065f46',
      },
      iconColor: '#059669',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: docAppointments.filter((apt) => apt.status === 'completed').length,
      activeStyle: {
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: '#ffffff',
        border: '1.5px solid #1d4ed8',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
      },
      inactiveStyle: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1.5px solid #93c5fd',
        boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
      },
      activeBadgeStyle: {
        background: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      },
      inactiveBadgeStyle: {
        background: '#dbeafe',
        color: '#1e40af',
      },
      iconColor: '#2563eb',
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      icon: XCircle,
      count: docAppointments.filter((apt) => apt.status === 'cancelled').length,
      activeStyle: {
        background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
        color: '#ffffff',
        border: '1.5px solid #be123c',
        boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
      },
      inactiveStyle: {
        background: '#fff1f2',
        color: '#9f1239',
        border: '1.5px solid #fecdd3',
        boxShadow: '0 1px 3px rgba(225, 29, 72, 0.08)',
      },
      activeBadgeStyle: {
        background: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      },
      inactiveBadgeStyle: {
        background: '#ffe4e6',
        color: '#9f1239',
      },
      iconColor: '#e11d48',
    },
  ];

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4f46e5', display: 'block', marginBottom: '0.25rem' }}>
              Doctor Workspace
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Clinical Appointments
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.35rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Review requests, manage your consultation queue, and keep each patient&apos;s clinical record up to date.
            </p>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> of {docAppointments.length} appointments
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Status Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem' }}>
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              const currentStyle = isActive ? tab.activeStyle : tab.inactiveStyle;
              const currentBadge = isActive ? tab.activeBadgeStyle : tab.inactiveBadgeStyle;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  aria-pressed={isActive}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    ...currentStyle,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = tab.inactiveStyle.boxShadow;
                    }
                  }}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : tab.iconColor} />
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      ...currentBadge,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '260px', maxWidth: '420px', marginLeft: 'auto' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, email, reason..."
                aria-label="Search appointments"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: search ? '2.5rem' : '1rem',
                  paddingTop: '0.55rem',
                  paddingBottom: '0.55rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'all 150ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear appointment search"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {(activeFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearch('');
                }}
                title="Reset all filters"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length > 0 ? (
          filtered.map((apt) => (
            <div
              key={apt.id}
              style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                    {apt.patientName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>{apt.patientName}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{apt.patientEmail}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={apt.status} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ref: {apt.id}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', background: '#f8fafc', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                  <Calendar size={15} color="#94a3b8" />
                  <span>Date: <strong style={{ color: '#0f172a' }}>{formatAppointmentDate(apt.date)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                  <Clock size={15} color="#94a3b8" />
                  <span>Slot: <strong style={{ color: '#0f172a' }}>{apt.timeSlot}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                  <User size={15} color="#94a3b8" />
                  <span>Specialty: <strong style={{ color: '#0f172a' }}>{apt.doctorSpecialty}</strong></span>
                </div>
              </div>

              <div style={{ borderRadius: '0.75rem', border: '1px solid #f1f5f9', padding: '0.75rem 1rem', background: '#ffffff' }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  <strong style={{ color: '#1e293b' }}>Presenting Symptoms / Reason:</strong> {apt.reason}
                </p>
              </div>

              {/* Existing Notes or Prescriptions */}
              {(apt.notes || apt.prescription) && (
                <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {apt.notes && (
                    <p style={{ color: '#166534', margin: 0 }}>
                      <strong style={{ color: '#14532d' }}>Diagnosis:</strong> {apt.notes}
                    </p>
                  )}
                  {apt.prescription && (
                    <p style={{ fontFamily: 'monospace', color: '#15803d', margin: 0 }}>
                      <strong>Rx:</strong> {apt.prescription}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {apt.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled', '', '', user?.email)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1.15rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#be123c',
                        background: '#fff1f2',
                        border: '1.5px solid #fecdd3',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        boxShadow: '0 1px 2px rgba(225, 29, 72, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffe4e6';
                        e.currentTarget.style.borderColor = '#fda4af';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff1f2';
                        e.currentTarget.style.borderColor = '#fecdd3';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <XCircle size={15} />
                      <span>Decline Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(apt.id, 'confirmed', '', '', user?.email)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1.35rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        border: '1.5px solid #047857',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.25)';
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Accept Appointment</span>
                    </button>
                  </>
                )}

                {apt.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleOpenCompleteModal(apt)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.35rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      border: '1.5px solid #4338ca',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)';
                    }}
                  >
                    <FileText size={16} />
                    <span>Complete & Write Prescription</span>
                  </button>
                )}

                {apt.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleOpenCompleteModal(apt)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#334155',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Prescription / Notes</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid #e2e8f0',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Calendar size={38} color="#cbd5e1" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#334155', margin: 0 }}>No appointments found</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No records match the current filter query.</p>
            {(activeFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearch('');
                }}
                style={{
                  marginTop: '0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal to Write / Edit Prescription */}
      <Modal
        isOpen={!!activeModalApt}
        onClose={() => setActiveModalApt(null)}
        title={`Clinical Record & Prescription: ${activeModalApt?.patientName}`}
      >
        <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p><strong>Patient:</strong> {activeModalApt?.patientName} ({activeModalApt?.patientEmail})</p>
            <p><strong>Reason for Visit:</strong> {activeModalApt?.reason}</p>
            <p><strong>Date & Slot:</strong> {activeModalApt?.date} at {activeModalApt?.timeSlot}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnosis Assessment & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="e.g. Patient presents with acute bronchitis. Lungs show wheezing..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Digital Medical Prescription (Rx)
            </label>
            <textarea
              rows={3}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. 1. Amoxicillin 500mg (1 tablet every 8h for 7 days)&#10;2. Salbutamol Inhaler as needed"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModalApt(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={16} />
              <span>Save Record & Issue Rx</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
