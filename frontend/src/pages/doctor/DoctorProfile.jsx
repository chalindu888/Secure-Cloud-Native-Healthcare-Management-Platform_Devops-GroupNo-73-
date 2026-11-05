import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Stethoscope,
  Award,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const SPECIALTIES = ['Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Orthopedics'];

const EMPTY_FORM = { specialty: '', qualifications: '', clinic_location: '', consultation_fee: '' };

const toForm = (doctor) => ({
  specialty: doctor.specialty || '',
  qualifications: doctor.qualifications || '',
  clinic_location: doctor.clinic_location || '',
  consultation_fee: doctor.consultation_fee ?? '',
});

const DoctorProfile = () => {
  const { user, updateProfile } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    api.get(`/doctor/profile/${user.id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setDoctor(data.doctor);
        setForm(toForm(data.doctor));
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.response?.data?.error || 'Unable to load your profile.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?.id]);

  const handleChange = (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);

    try {
      const { data } = await api.put(`/doctor/profile/${user.id}`, form);
      setDoctor(data.doctor);
      setForm(toForm(data.doctor));
      updateProfile({ specialty: data.doctor.specialty });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    'w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5';
  const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none';

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-600">
          Keep your professional details up to date. Patients see these in the specialists directory.
        </p>
      </div>

      {doctor && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
            <Stethoscope size={26} />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-bold text-slate-900 truncate">{doctor.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
              <Mail size={12} /> {doctor.email}
            </p>
            {doctor.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone size={12} /> {doctor.phone}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {saved && (
          <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold p-3">
            <CheckCircle2 size={16} /> Profile updated.
          </div>
        )}

        <div>
          <label htmlFor="doc-specialty" className={labelClass}>Specialty</label>
          <div className="relative">
            <Stethoscope size={16} className={iconClass} />
            <select
              id="doc-specialty"
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              className={fieldClass}
            >
              {!SPECIALTIES.includes(form.specialty) && <option value={form.specialty}>{form.specialty || 'Select a specialty'}</option>}
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="doc-qualifications" className={labelClass}>Qualifications</label>
          <div className="relative">
            <Award size={16} className={iconClass} />
            <input
              id="doc-qualifications"
              name="qualifications"
              type="text"
              value={form.qualifications}
              onChange={handleChange}
              placeholder="e.g. MBBS, MD (Cardiology)"
              maxLength={255}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="doc-location" className={labelClass}>Clinic location</label>
          <div className="relative">
            <MapPin size={16} className={iconClass} />
            <input
              id="doc-location"
              name="clinic_location"
              type="text"
              value={form.clinic_location}
              onChange={handleChange}
              placeholder="e.g. Room 12, HealthOps Hospital, Colombo 07"
              maxLength={255}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="doc-fee" className={labelClass}>Consultation fee</label>
          <div className="relative">
            <DollarSign size={16} className={iconClass} />
            <input
              id="doc-fee"
              name="consultation_fee"
              type="number"
              min="0"
              step="0.01"
              value={form.consultation_fee}
              onChange={handleChange}
              placeholder="0.00"
              className={fieldClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary w-full"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
