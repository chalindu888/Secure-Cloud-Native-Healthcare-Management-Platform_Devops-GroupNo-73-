import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import api from '../../services/api';
import { Calendar, Clock, Stethoscope, CheckCircle2, ArrowLeft, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatFee = (fee) => (fee === null || fee === undefined ? 'Not provided' : `$${fee}`);

const BookAppointment = () => {
  const { user } = useAuth();
  const { doctors, doctorsLoading, bookAppointment } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Doctors load from the server, so fall back to the first one until the patient picks
  const [chosenDoctorId, setChosenDoctorId] = useState(searchParams.get('doctor') || '');
  const selectedDoctor = doctors.find((d) => String(d.id) === String(chosenDoctorId)) || doctors[0];
  const selectedDoctorId = selectedDoctor ? String(selectedDoctor.id) : '';

  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [chosenSlot, setChosenSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [consultationType, setConsultationType] = useState('in_person');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  // Slots other patients already hold for this doctor and date
  useEffect(() => {
    if (!selectedDoctorId || !date) return undefined;
    let isMounted = true;
    api.get(`/doctors/${selectedDoctorId}/booked-slots`, { params: { date } })
      .then(({ data }) => { if (isMounted) setBookedSlots(data.slots || []); })
      .catch(() => { if (isMounted) setBookedSlots([]); });
    return () => { isMounted = false; };
  }, [selectedDoctorId, date]);

  const timeSlots = selectedDoctor?.timeSlots || [];
  const timeSlot = timeSlots.includes(chosenSlot) && !bookedSlots.includes(chosenSlot)
    ? chosenSlot
    : timeSlots.find((slot) => !bookedSlots.includes(slot)) || '';

  const weekday = date ? WEEK_DAYS[(new Date(`${date}T00:00:00`).getDay() + 6) % 7] : '';
  const worksThatDay = !selectedDoctor || selectedDoctor.availableDays.includes(weekday);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId || !date || !timeSlot || !reason.trim()) {
      setError('Please fill in all details before confirming.');
      return;
    }
    if (!worksThatDay) {
      setError(`${selectedDoctor.name} does not see patients on ${weekday}s. Please choose another date.`);
      return;
    }

    setIsBooking(true);
    const result = await bookAppointment({
      doctorId: selectedDoctor.id,
      date,
      timeSlot,
      reason: `${reason.trim()} (${consultationType === 'telehealth' ? 'Virtual Video Consult' : 'In-Person'})`
    });
    setIsBooking(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 1500);
  };

  if (!selectedDoctor) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '64rem' }}>
        <Link to="/patient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Patient Dashboard
        </Link>
        <h1 className="page-title">Book a Medical Consultation</h1>
        <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', textAlign: 'center', color: 'var(--txt-secondary)' }}>
          {doctorsLoading
            ? 'Loading available doctors...'
            : 'No doctors have registered yet. Please check back soon.'}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '64rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/patient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '1rem', transition: 'color 200ms ease' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--txt-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-muted)'}
        >
          <ArrowLeft size={16} /> Back to Patient Dashboard
        </Link>
        <h1 className="page-title animate-fade-up">Book a Medical Consultation</h1>
        <p className="page-subtitle animate-fade-up-1">Choose your specialist, pick an available slot, and confirm your visit.</p>
      </div>

      {isSubmitted && (
        <div className="alert alert-success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={24} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Appointment Requested Successfully!</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Redirecting to your appointments ledger...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Form: Booking Controls */}
        <div className="animate-fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Stethoscope size={18} style={{ color: 'var(--c-primary-light)' }} />
              1. Choose Specialist
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setChosenDoctorId(e.target.value)}
                className="input-field"
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty}{doc.consultationFee !== null ? ` ($${doc.consultationFee})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', fontSize: '0.8rem', color: 'var(--txt-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p><strong style={{ color: 'var(--txt-primary)' }}>Department:</strong> {selectedDoctor.department}</p>
                <p><strong style={{ color: 'var(--txt-primary)' }}>Location:</strong> {selectedDoctor.location}</p>
                <p><strong style={{ color: 'var(--txt-primary)' }}>Fee:</strong> {formatFee(selectedDoctor.consultationFee)}</p>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calendar size={18} style={{ color: 'var(--c-primary-light)' }} />
              2. Pick Date & Slot
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
              <p style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: worksThatDay ? 'var(--txt-muted)' : 'var(--c-rose)' }}>
                {worksThatDay
                  ? `${selectedDoctor.name} sees patients on: ${selectedDoctor.availableDays.map((d) => d.slice(0, 3)).join(', ')}`
                  : `${selectedDoctor.name} does not see patients on ${weekday}s.`}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>Available Time Slot</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={bookedSlots.includes(slot)}
                    title={bookedSlots.includes(slot) ? 'Already booked' : undefined}
                    onClick={() => setChosenSlot(slot)}
                    style={{
                      padding: '0.5rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 700, transition: 'all 200ms ease',
                      background: timeSlot === slot ? 'var(--c-primary-light)' : 'rgba(255,255,255,0.05)',
                      color: timeSlot === slot ? '#0d1117' : 'var(--txt-secondary)',
                      border: `1px solid ${timeSlot === slot ? 'var(--c-primary-light)' : 'var(--bdr-subtle)'}`,
                      opacity: bookedSlots.includes(slot) ? 0.4 : 1,
                      textDecoration: bookedSlots.includes(slot) ? 'line-through' : 'none',
                      cursor: bookedSlots.includes(slot) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={18} style={{ color: 'var(--c-primary-light)' }} />
              3. Consultation Details
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>Visit Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setConsultationType('in_person')}
                  style={{
                    padding: '0.75rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms ease',
                    background: consultationType === 'in_person' ? 'var(--c-primary-pale)' : 'rgba(255,255,255,0.03)',
                    color: consultationType === 'in_person' ? 'var(--c-primary-light)' : 'var(--txt-secondary)',
                    border: `1px solid ${consultationType === 'in_person' ? 'var(--c-primary-border)' : 'var(--bdr-subtle)'}`,
                  }}
                >
                  <MapPin size={16} /> In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('telehealth')}
                  style={{
                    padding: '0.75rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms ease',
                    background: consultationType === 'telehealth' ? 'var(--c-cyan-pale)' : 'rgba(255,255,255,0.03)',
                    color: consultationType === 'telehealth' ? 'var(--c-cyan)' : 'var(--txt-secondary)',
                    border: `1px solid ${consultationType === 'telehealth' ? 'rgba(34,211,238,0.3)' : 'var(--bdr-subtle)'}`,
                  }}
                >
                  <ShieldCheck size={16} /> Telehealth
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '0.5rem' }}>Symptoms or Purpose of Visit *</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your current symptoms, medical concerns, or review goals..."
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="card-strong animate-fade-up-2" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)', borderBottom: '1px solid var(--bdr-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            Booking Confirmation Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Patient:</span>
              <span style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Doctor:</span>
              <span style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>{selectedDoctor?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Specialty:</span>
              <span style={{ fontWeight: 700, color: 'var(--c-primary-light)' }}>{selectedDoctor?.specialty}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Selected Date:</span>
              <span style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>{date || 'Not chosen'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Selected Time Slot:</span>
              <span style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>{timeSlot || 'Not chosen'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--txt-secondary)' }}>Consultation Mode:</span>
              <span style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>
                {consultationType === 'telehealth' ? 'Virtual Telehealth' : 'In-Person'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid var(--bdr-subtle)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)' }}>Consultation Fee</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--txt-primary)' }}>{formatFee(selectedDoctor.consultationFee)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitted || isBooking}
            className="btn btn-primary w-full"
            style={{ marginTop: '1.5rem', minHeight: '3rem', fontSize: '0.95rem' }}
          >
            <CheckCircle2 size={18} />
            {isBooking ? 'Booking...' : 'Confirm & Request Booking'}
          </button>

          <p style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
            Upon booking, the attending physician will review your request. You can cancel or reschedule any time before consultation.
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
