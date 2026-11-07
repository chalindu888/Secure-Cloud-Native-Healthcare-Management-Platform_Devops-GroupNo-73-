import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Calendar,
  Clock,
  Check,
  Plus,
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Info
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAYS = DAYS_OF_WEEK.slice(0, 5);

const SLOT_PRESETS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

// "14:30" (from <input type="time">) -> "02:30 PM", the format the server expects
const toSlot = (value) => {
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

const slotMinutes = (slot) => {
  const [time, suffix] = slot.split(' ');
  const [h, m] = time.split(':').map(Number);
  return ((h % 12) + (suffix === 'PM' ? 12 : 0)) * 60 + m;
};

const sortSlots = (slots) => [...slots].sort((a, b) => slotMinutes(a) - slotMinutes(b));
const sortDays = (days) => [...days].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
const sameList = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #ffffff',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--shdw-md)',
  padding: '1.5rem',
};

const SectionTitle = ({ icon: Icon, color, background, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem' }}>
    <span style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.9rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, background }}>
      <Icon size={22} />
    </span>
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{title}</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)' }}>{subtitle}</p>
    </div>
  </div>
);

const linkButtonStyle = {
  padding: '0.3rem 0.8rem', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
  border: '1px solid var(--bdr-default)', background: 'rgba(255,255,255,0.7)', color: 'var(--txt-secondary)',
};

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { doctors, updateDoctorSchedule } = useData();

  // Only ever edit the signed-in doctor's own schedule
  const currentDoc = doctors.find((d) => String(d.id) === String(user?.id));

  const [availableDays, setAvailableDays] = useState(currentDoc?.availableDays || WEEKDAYS);
  const [timeSlots, setTimeSlots] = useState(sortSlots(currentDoc?.timeSlots || []));
  const [newTime, setNewTime] = useState('');
  const [slotError, setSlotError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Doctors load from the server after first render; pick up the saved schedule once it arrives
  useEffect(() => {
    if (currentDoc) {
      setAvailableDays(currentDoc.availableDays);
      setTimeSlots(sortSlots(currentDoc.timeSlots));
    }
  }, [currentDoc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedDays = currentDoc?.availableDays || [];
  const savedSlots = currentDoc?.timeSlots || [];
  const isDirty = !!currentDoc && (!sameList(availableDays, savedDays) || !sameList(timeSlots, savedSlots));
  const canSave = isDirty && availableDays.length > 0 && timeSlots.length > 0 && !isSaving;

  const touch = () => {
    setSuccess(false);
    setSaveError('');
  };

  const toggleDay = (day) => {
    touch();
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : sortDays([...prev, day])));
  };

  const addSlot = (slot) => {
    if (timeSlots.includes(slot)) {
      setSlotError(`${slot} is already in your list.`);
      return;
    }
    touch();
    setSlotError('');
    setTimeSlots((prev) => sortSlots([...prev, slot]));
  };

  const handleAddTime = () => {
    if (!newTime) {
      setSlotError('Pick a time first.');
      return;
    }
    addSlot(toSlot(newTime));
    setNewTime('');
  };

  const removeSlot = (slot) => {
    touch();
    setTimeSlots((prev) => prev.filter((s) => s !== slot));
  };

  const handleReset = () => {
    setAvailableDays(savedDays);
    setTimeSlots(sortSlots(savedSlots));
    setSlotError('');
    touch();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentDoc || !canSave) return;

    setSaveError('');
    setIsSaving(true);
    const result = await updateDoctorSchedule(currentDoc.id, availableDays, timeSlots);
    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const dayCount = availableDays.length;
  const slotCount = timeSlots.length;
  const perDay = currentDoc?.maxPatientsPerDay;

  return (
    <div className="page-wrapper" style={{ maxWidth: '60rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>
          Doctor Portal
        </span>
        <h1 className="page-title">Schedule &amp; Availability</h1>
        <p className="page-subtitle">Choose the days you see patients and the time slots they can book.</p>
      </div>

      {success && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', padding: '0.9rem 1.1rem', borderRadius: 'var(--r-md)', background: 'var(--c-emerald-pale)', border: '1px solid var(--c-emerald-border)', color: 'var(--c-emerald)', fontSize: '0.88rem', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> Schedule saved. Patients will see the new availability when they book.
        </div>
      )}
      {saveError && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', padding: '0.9rem 1.1rem', borderRadius: 'var(--r-md)', background: 'var(--c-rose-pale)', border: '1px solid var(--c-rose-border)', color: 'var(--c-rose)', fontSize: '0.88rem', fontWeight: 700 }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} /> {saveError}
        </div>
      )}

      {!currentDoc ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading your schedule...</div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Days */}
          <section style={cardStyle}>
            <SectionTitle
              icon={Calendar}
              color="var(--c-primary)"
              background="var(--c-primary-pale)"
              title="Working days"
              subtitle="Patients can only book on the days you select."
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" style={linkButtonStyle} onClick={() => { touch(); setAvailableDays(WEEKDAYS); }}>Mon – Fri</button>
              <button type="button" style={linkButtonStyle} onClick={() => { touch(); setAvailableDays(DAYS_OF_WEEK); }}>Every day</button>
              <button type="button" style={linkButtonStyle} onClick={() => { touch(); setAvailableDays([]); }}>Clear</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(5.5rem, 1fr))', gap: '0.6rem' }}>
              {DAYS_OF_WEEK.map((day) => {
                const selected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleDay(day)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 180ms ease',
                      border: `1.5px solid ${selected ? 'var(--c-primary)' : 'var(--bdr-default)'}`,
                      background: selected ? 'var(--c-primary)' : '#ffffff',
                      color: selected ? '#ffffff' : 'var(--txt-secondary)',
                      boxShadow: selected ? 'var(--shdw-primary)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{day.slice(0, 3)}</span>
                    <span style={{ height: '1rem', display: 'flex', alignItems: 'center', opacity: selected ? 1 : 0 }}>
                      <Check size={14} />
                    </span>
                  </button>
                );
              })}
            </div>
            {dayCount === 0 && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-rose)' }}>Select at least one working day.</p>
            )}
          </section>

          {/* Time slots */}
          <section style={cardStyle}>
            <SectionTitle
              icon={Clock}
              color="var(--c-cyan)"
              background="var(--c-cyan-pale)"
              title="Appointment time slots"
              subtitle="Each slot can be booked by one patient per day."
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', minHeight: '2.5rem', marginBottom: '1.25rem' }}>
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <span
                    key={slot}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.5rem 0.5rem 0.9rem',
                      borderRadius: 'var(--r-pill)', fontSize: '0.88rem', fontWeight: 700,
                      background: 'var(--c-cyan-pale)', color: 'var(--c-cyan-hover)', border: '1px solid rgba(8,145,178,0.25)',
                    }}
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeSlot(slot)}
                      aria-label={`Remove ${slot}`}
                      style={{ display: 'flex', padding: '0.2rem', borderRadius: '50%', border: 'none', background: 'rgba(8,145,178,0.15)', color: 'inherit', cursor: 'pointer' }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--c-rose)', fontWeight: 600 }}>No slots yet. Add at least one time below.</p>
              )}
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label htmlFor="new-slot" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' }}>
                  Add a time
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <input
                    id="new-slot"
                    type="time"
                    step="300"
                    value={newTime}
                    onChange={(e) => { setNewTime(e.target.value); setSlotError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTime(); } }}
                    style={{ flex: '1 1 10rem', maxWidth: '14rem' }}
                  />
                  <button type="button" onClick={handleAddTime} className="btn btn-primary btn-sm">
                    <Plus size={15} /> Add slot
                  </button>
                </div>
                {slotError && <p style={{ marginTop: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-rose)' }}>{slotError}</p>}
              </div>

              <div>
                <p style={{ marginBottom: '0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' }}>
                  Quick add
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {SLOT_PRESETS.filter((slot) => !timeSlots.includes(slot)).map((slot) => (
                    <button key={slot} type="button" onClick={() => addSlot(slot)} style={linkButtonStyle}>
                      + {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)' }}>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--txt-primary)' }}>
              <Info size={18} style={{ marginTop: '0.15rem', flexShrink: 0, color: 'var(--c-primary)' }} />
              <span>
                {dayCount > 0 && slotCount > 0 ? (
                  <>
                    Patients can book <strong>{slotCount} slot{slotCount === 1 ? '' : 's'}</strong> on{' '}
                    <strong>{sortDays(availableDays).map((d) => d.slice(0, 3)).join(', ')}</strong>
                    {perDay ? <>, up to <strong>{perDay} patient{perDay === 1 ? '' : 's'} per day</strong></> : null}.
                  </>
                ) : (
                  'Choose at least one working day and one time slot to accept bookings.'
                )}
              </span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--txt-secondary)' }}>
              <Users size={16} style={{ flexShrink: 0 }} />
              <span>
                {perDay ? `Your daily limit is ${perDay} patients.` : 'You have not set a daily patient limit.'}{' '}
                <Link to="/doctor/profile" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>Change it in My Profile</Link>
              </span>
            </p>
          </section>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {isDirty && !isSaving && (
              <span style={{ marginRight: 'auto', fontSize: '0.82rem', fontWeight: 700, color: '#b45309' }}>You have unsaved changes</span>
            )}
            <button type="button" onClick={handleReset} disabled={!isDirty || isSaving} className="btn btn-secondary">
              <RotateCcw size={16} /> Reset
            </button>
            <button type="submit" disabled={!canSave} className="btn btn-primary" style={{ opacity: canSave || isSaving ? 1 : 0.6 }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save schedule'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DoctorSchedule;
