import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Clock, Calendar, Check, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { doctors, updateDoctorSchedule } = useData();

  const currentDoc = doctors.find((d) => d.id === user?.id) || doctors[0];

  const [availableDays, setAvailableDays] = useState(currentDoc?.availableDays || ['Monday', 'Tuesday', 'Wednesday']);
  const [timeSlots, setTimeSlots] = useState(currentDoc?.timeSlots || ['09:00 AM', '10:30 AM', '02:00 PM']);
  const [newSlot, setNewSlot] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAddSlot = () => {
    if (newSlot && !timeSlots.includes(newSlot)) {
      setTimeSlots([...timeSlots, newSlot]);
      setNewSlot('');
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
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Physician Schedule & Availability</h1>
        <p className="text-sm text-slate-600">
          Configure weekly clinic consultation days and patient appointment time intervals.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Schedule configuration updated and synchronized successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Available Consultation Days */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Available Days</h2>
              <p className="text-xs text-slate-400">Patients can book slots on selected days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{day.slice(0, 3)}</span>
                  {isSelected && <Check size={14} className="stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Consultation Time Intervals</h2>
              <p className="text-xs text-slate-400">Available time slots for patient booking</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <span>{slot}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="text-slate-400 hover:text-rose-600 transition"
                  title="Remove slot"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="e.g. 05:00 PM"
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>Add Slot</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition flex items-center gap-2"
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
