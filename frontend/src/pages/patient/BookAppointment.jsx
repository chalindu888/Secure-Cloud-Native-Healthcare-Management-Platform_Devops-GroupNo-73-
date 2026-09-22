import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  ArrowLeft, 
  MapPin, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const { doctors, bookAppointment } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedDocId = searchParams.get('doctor');

  // Form state
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDocId || (doctors[0]?.id || ''));
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(selectedDoctor?.timeSlots?.[0] || '09:00 AM');
  const [reason, setReason] = useState('');
  const [consultationType, setConsultationType] = useState('in_person');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId || !date || !timeSlot || !reason) {
      setError('Please fill in all details before confirming.');
      return;
    }

    bookAppointment({
      patient: user,
      doctorId: selectedDoctorId,
      date,
      timeSlot,
      reason: `${reason} (${consultationType === 'telehealth' ? 'Virtual Video Consult' : 'In-Person'})`
    });

    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link
          to="/patient"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Patient Dashboard</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book a Medical Consultation</h1>
        <p className="text-sm text-slate-600">
          Choose your medical specialist, select an available date and time slot, and confirm your visit.
        </p>
      </div>

      {isSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Appointment Requested Successfully!</h4>
            <p className="text-xs text-emerald-700">Redirecting to your appointments ledger...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Booking Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Doctor Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope size={18} className="text-blue-600" />
              <span>1. Choose Specialist</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  const doc = doctors.find((d) => d.id === e.target.value);
                  if (doc && doc.timeSlots?.length > 0) setTimeSlot(doc.timeSlots[0]);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty} (${doc.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <p><strong>Department:</strong> {selectedDoctor.department}</p>
                <p><strong>Location:</strong> {selectedDoctor.location}</p>
                <p><strong>Consultation Fee:</strong> ${selectedDoctor.consultationFee}</p>
              </div>
            )}
          </div>

          {/* Date and Time Slots */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <span>2. Pick Date & Available Slot</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Available Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedDoctor?.timeSlots?.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      timeSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reason and Consultation Type */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <span>3. Consultation Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visit Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('in_person')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    consultationType === 'in_person'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin size={16} />
                  <span>In-Person Clinic Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('telehealth')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    consultationType === 'telehealth'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck size={16} />
                  <span>Secure Telehealth Video</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Symptoms or Purpose of Visit *
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your current symptoms, medical concerns, or review goals..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5 sticky top-24">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Booking Confirmation Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Patient:</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doctor:</span>
                <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Specialty:</span>
                <span className="font-bold text-blue-600">{selectedDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Selected Date:</span>
                <span className="font-bold text-slate-900">{date || 'Not chosen'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Selected Time Slot:</span>
                <span className="font-bold text-slate-900">{timeSlot || 'Not chosen'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Consultation Mode:</span>
                <span className="font-bold capitalize text-slate-900">
                  {consultationType === 'telehealth' ? 'Virtual Telehealth' : 'In-Person'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-sm">Consultation Fee</span>
              <span className="font-extrabold text-xl text-slate-900">${selectedDoctor?.consultationFee || 100}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              <span>Confirm & Request Booking</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Upon booking, the attending physician will review your request. You can cancel or reschedule any time before consultation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
