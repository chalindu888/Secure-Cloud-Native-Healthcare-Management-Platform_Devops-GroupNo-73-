import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Clock, Calendar, Check, Plus, Trash2, Save, CheckCircle2, RotateCcw, CalendarCheck, Sparkles } from 'lucide-react';

const DAYS_OF_WEEK = [
  { full: 'Monday', short: 'Mon' },
  { full: 'Tuesday', short: 'Tue' },
  { full: 'Wednesday', short: 'Wed' },
  { full: 'Thursday', short: 'Thu' },
  { full: 'Friday', short: 'Fri' },
  { full: 'Saturday', short: 'Sat' },
  { full: 'Sunday', short: 'Sun' },
];

const PRESET_TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM', '05:00 PM'];

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { doctors, updateDoctorSchedule } = useData();

  const currentDoc = doctors.find((d) => d.id === user?.id) || doctors[0];

  const [availableDays, setAvailableDays] = useState(currentDoc?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timeSlots, setTimeSlots] = useState(currentDoc?.timeSlots || ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '04:30 PM']);
  const [newSlot, setNewSlot] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSelectWeekdays = () => {
    setAvailableDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  };

  const handleSelectAllDays = () => {
    setAvailableDays(DAYS_OF_WEEK.map((d) => d.full));
  };

  const handleClearDays = () => {
    setAvailableDays([]);
  };

  const handleAddSlot = (slotToAdd) => {
    const slot = (typeof slotToAdd === 'string' ? slotToAdd : newSlot).trim();
    if (slot && !timeSlots.includes(slot)) {
      setTimeSlots([...timeSlots, slot]);
      if (slotToAdd === newSlot) {
        setNewSlot('');
      }
    }
  };

  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentDoc) {
      updateDoctorSchedule(currentDoc.id, availableDays, timeSlots);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    }
  };

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4f46e5', display: 'block', marginBottom: '0.25rem' }}>
          Doctor Workspace
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
          Physician Schedule & Availability
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.35rem', maxWidth: '650px', lineHeight: 1.5 }}>
          Configure weekly clinic consultation days and patient appointment time intervals.
        </p>
      </div>

      {success && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '1rem',
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)',
          }}
        >
          <CheckCircle2 size={20} color="#059669" />
          <span>Schedule configuration updated and synchronized successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Available Consultation Days Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Weekly Available Days</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Patients can book consultation slots on selected days</p>
              </div>
            </div>

            {/* Quick Filter / Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSelectWeekdays}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e7ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#eef2ff'; }}
              >
                <CalendarCheck size={13} />
                <span>Weekdays (Mon-Fri)</span>
              </button>

              <button
                type="button"
                onClick={handleSelectAllDays}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ecfdf5'; }}
              >
                <Check size={13} />
                <span>All 7 Days</span>
              </button>

              <button
                type="button"
                onClick={handleClearDays}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Day Buttons Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {DAYS_OF_WEEK.map(({ full, short }) => {
              const isSelected = availableDays.includes(full);

              return (
                <button
                  key={full}
                  type="button"
                  onClick={() => toggleDay(full)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.85rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    outline: 'none',
                    ...(isSelected
                      ? {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                          color: '#ffffff',
                          border: '1.5px solid #4338ca',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                        }
                      : {
                          background: '#ffffff',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                    }
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{short}</span>
                  <div
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                    }}
                  >
                    {isSelected ? (
                      <Check size={12} color="#ffffff" strokeWidth={3} />
                    ) : (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Intervals Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Consultation Time Intervals</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Available time slots for patient booking</p>
            </div>
          </div>

          {/* Active Slots Pills */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', display: 'block', marginBottom: '0.6rem' }}>
              Active Consultation Slots ({timeSlots.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <Clock size={13} color="#6366f1" />
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      borderRadius: '50%',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#e11d48';
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.background = 'none';
                    }}
                    title={`Remove ${slot}`}
                    aria-label={`Remove ${slot}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Presets */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f8fafc' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <Sparkles size={13} color="#6366f1" /> Quick Presets
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PRESET_TIME_SLOTS.map((slot) => {
                const alreadyAdded = timeSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => handleAddSlot(slot)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                      border: '1px solid',
                      ...(alreadyAdded
                        ? {
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            borderColor: '#e2e8f0',
                            opacity: 0.6,
                          }
                        : {
                            background: '#ffffff',
                            color: '#334155',
                            borderColor: '#cbd5e1',
                          }),
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!alreadyAdded) {
                        e.currentTarget.style.background = '#eef2ff';
                        e.currentTarget.style.borderColor = '#c7d2fe';
                        e.currentTarget.style.color = '#4f46e5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!alreadyAdded) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <Plus size={11} />
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Slot Input */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem', paddingTop: '0.5rem' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Clock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="e.g. 05:00 PM"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSlot(newSlot);
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleAddSlot(newSlot)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#ffffff',
                background: '#0f172a',
                border: '1.5px solid #0f172a',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={14} />
              <span>Add Custom Slot</span>
            </button>
          </div>
        </div>

        {/* Save Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '0.875rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: '1.5px solid #4338ca',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)';
            }}
          >
            <Save size={18} />
            <span>Save Schedule Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
