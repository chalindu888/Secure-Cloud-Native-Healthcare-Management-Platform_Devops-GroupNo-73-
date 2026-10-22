import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Clock,
  Calendar,
  Check,
  Plus,
  X,
  Save,
  CheckCircle2,
  Sun,
  Sunset,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses flex/grid `gap` and inline padding instead.

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAYS = DAYS_OF_WEEK.slice(0, 5);

const DAY_PRESETS = [
  { label: 'Weekdays', days: WEEKDAYS },
  { label: 'Every day', days: DAYS_OF_WEEK },
  { label: 'Clear', days: [] }
];

// Slots are stored as "hh:mm AM/PM"; convert to minutes for sorting/grouping
const slotToMinutes = (slot) => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim());
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
};

// "17:00" (native time input) -> "05:00 PM"
const toSlotLabel = (value) => {
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

const sortSlots = (slots) => [...slots].sort((a, b) => slotToMinutes(a) - slotToMinutes(b));

const sameItems = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { doctors, updateDoctorSchedule } = useData();

  const currentDoc = doctors.find((d) => d.id === user?.id) || doctors[0];
  const savedDays = currentDoc?.availableDays || [];
  const savedSlots = currentDoc?.timeSlots || [];

  const [availableDays, setAvailableDays] = useState(savedDays);
  const [timeSlots, setTimeSlots] = useState(sortSlots(savedSlots));
  const [newSlot, setNewSlot] = useState('');
  const [slotError, setSlotError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasChanges = !sameItems(availableDays, savedDays) || !sameItems(timeSlots, savedSlots);
  const canSave = hasChanges && availableDays.length > 0 && timeSlots.length > 0;

  const orderedDays = DAYS_OF_WEEK.filter((d) => availableDays.includes(d));
  const morningSlots = timeSlots.filter((s) => slotToMinutes(s) < 12 * 60);
  const afternoonSlots = timeSlots.filter((s) => slotToMinutes(s) >= 12 * 60);

  const toggleDay = (day) => {
    setSuccess(false);
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = () => {
    if (!newSlot) {
      setSlotError('Pick a time first.');
      return;
    }
    const label = toSlotLabel(newSlot);
    if (timeSlots.includes(label)) {
      setSlotError(`${label} is already in your schedule.`);
      return;
    }
    setSuccess(false);
    setTimeSlots(sortSlots([...timeSlots, label]));
    setNewSlot('');
    setSlotError('');
  };

  const handleRemoveSlot = (slot) => {
    setSuccess(false);
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleReset = () => {
    setAvailableDays(savedDays);
    setTimeSlots(sortSlots(savedSlots));
    setNewSlot('');
    setSlotError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentDoc && canSave) {
      updateDoctorSchedule(currentDoc.id, orderedDays, timeSlots);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const renderSlotGroup = (title, Icon, slots) => (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Icon size={14} />
        {title}
      </p>
      {slots.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-800"
              style={{ padding: '0.4rem 0.5rem 0.4rem 0.9rem' }}
            >
              {slot}
              <button
                type="button"
                onClick={() => handleRemoveSlot(slot)}
                className="rounded-full text-indigo-400 hover:text-rose-600 hover:bg-white transition"
                style={{ padding: '0.15rem' }}
                aria-label={`Remove ${slot}`}
                title="Remove slot"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No {title.toLowerCase()} slots</p>
      )}
    </div>
  );

  return (
    <div className="page-wrapper flex flex-col gap-8" style={{ maxWidth: '56rem' }}>
      <div>
        <h1 className="page-title">Schedule & Availability</h1>
        <p className="page-subtitle">
          Choose the days you see patients and the times they can book.
        </p>
      </div>

      {success && (
        <div className="alert alert-success flex items-center gap-3" style={{ padding: '0.9rem 1.1rem' }}>
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">Your schedule has been saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Available Consultation Days */}
        <section className="card-strong flex flex-col gap-5" style={{ padding: '1.5rem' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-lg text-slate-900">Working days</h2>
                <p className="text-sm text-slate-500">Tap a day to turn it on or off</p>
              </div>
            </div>
            <div className="flex gap-2">
              {DAY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setAvailableDays(preset.days);
                  }}
                  className="rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition"
                  style={{ padding: '0.35rem 0.8rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={isSelected}
                  title={day}
                  className={`rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                  style={{ padding: '0.75rem 0.25rem' }}
                >
                  <span>{day.slice(0, 3)}</span>
                  <span className="flex items-center justify-center" style={{ height: 16 }}>
                    {isSelected ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-medium">Off</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {availableDays.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-rose-600">
              <AlertCircle size={16} />
              Select at least one working day.
            </p>
          )}
        </section>

        {/* Time Slots */}
        <section className="card-strong flex flex-col gap-5" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg text-slate-900">Appointment times</h2>
              <p className="text-sm text-slate-500">Patients can book these times on each working day</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {renderSlotGroup('Morning', Sun, morningSlots)}
            {renderSlotGroup('Afternoon', Sunset, afternoonSlots)}
          </div>

          <div
            className="flex flex-col gap-2 rounded-xl bg-slate-50 border border-slate-100"
            style={{ padding: '1rem' }}
          >
            <label htmlFor="new-slot" className="text-sm font-semibold text-slate-700">
              Add a time
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="new-slot"
                type="time"
                className="input-field"
                value={newSlot}
                onChange={(e) => {
                  setNewSlot(e.target.value);
                  setSlotError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSlot();
                  }
                }}
                style={{ width: '12rem' }}
              />
              <button type="button" onClick={handleAddSlot} className="btn btn-secondary btn-sm">
                <Plus size={16} />
                Add time
              </button>
            </div>
            {slotError && (
              <p className="flex items-center gap-2 text-sm text-rose-600">
                <AlertCircle size={16} />
                {slotError}
              </p>
            )}
          </div>

          {timeSlots.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-rose-600">
              <AlertCircle size={16} />
              Add at least one appointment time.
            </p>
          )}
        </section>

        {/* Summary + Save */}
        <div
          className="card-strong flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ padding: '1.25rem 1.5rem' }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-700">
              {orderedDays.length > 0 && timeSlots.length > 0 ? (
                <>
                  Patients can book <strong>{timeSlots.length} times</strong> on{' '}
                  <strong>{orderedDays.map((d) => d.slice(0, 3)).join(', ')}</strong>
                  {' '}— <strong>{timeSlots.length * orderedDays.length} slots</strong> per week.
                </>
              ) : (
                'Patients cannot book you until you choose days and times.'
              )}
            </p>
            {hasChanges && (
              <p className="text-xs font-semibold text-amber-600">You have unsaved changes</p>
            )}
          </div>

          <div className="flex gap-3">
            {hasChanges && (
              <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
                <RotateCcw size={16} />
                Undo changes
              </button>
            )}
            <button type="submit" disabled={!canSave} className="btn btn-primary btn-sm">
              <Save size={16} />
              Save schedule
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
