import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Stethoscope,
  Award,
  MapPin,
  Banknote,
  Mail,
  Phone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const SPECIALTIES = ['Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Orthopedics'];

const EMPTY_FORM = { specialty: '', qualifications: '', clinic_location: '', consultation_fee: '' };

const toForm = (doctor) => ({
  specialty: doctor.specialty || '',
  qualifications: doctor.qualifications || '',
  clinic_location: doctor.clinic_location || '',
  consultation_fee: doctor.consultation_fee ?? '',
});

const initials = (name = '') =>
  name.replace(/^dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'DR';

const formatFee = (fee) =>
  fee === '' || fee === null || fee === undefined
    ? 'Not set'
    : Number(fee).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #ffffff',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--shdw-md)',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--txt-muted)',
};

const hintStyle = { marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--txt-muted)' };

const iconStyle = {
  position: 'absolute',
  left: '0.95rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--txt-muted)',
  pointerEvents: 'none',
};

const inputStyle = { paddingLeft: '2.75rem' };

const Field = ({ id, label, icon: Icon, hint, children }) => (
  <div>
    <label htmlFor={id} style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={iconStyle} />
      {children}
    </div>
    {hint && <p style={hintStyle}>{hint}</p>}
  </div>
);

const PreviewRow = ({ icon: Icon, children, muted }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: muted ? 'var(--txt-disabled)' : 'var(--txt-secondary)' }}>
    <Icon size={15} style={{ marginTop: '0.15rem', flexShrink: 0, color: muted ? 'var(--txt-disabled)' : 'var(--c-cyan)' }} />
    <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
  </div>
);

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
        if (isMounted) setError(requestError.response?.data?.error || 'Unable to load your profile. Is the backend running?');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?.id]);

  const original = doctor ? toForm(doctor) : EMPTY_FORM;
  const isDirty = Object.keys(form).some((key) => String(form[key]) !== String(original[key]));

  const handleChange = (e) => {
    setSaved(false);
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setForm(original);
    setError('');
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);

    try {
      const { data } = await api.put(`/doctor/profile/${user.id}`, form);
      setDoctor((prev) => ({ ...prev, ...data.doctor }));
      setForm(toForm(data.doctor));
      updateProfile({ specialty: data.doctor.specialty });
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          'Unable to save your profile. Please check that the backend is running and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>
        Loading your profile...
      </div>
    );
  }

  const name = doctor?.name || user?.name || 'Doctor';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>Doctor Portal</span>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">
          Manage the professional details patients see in the specialists directory.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Live preview */}
        <aside style={{ ...cardStyle, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '4.25rem', height: '4.25rem', borderRadius: '1.25rem', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: '#fff',
                fontSize: '1.4rem', fontWeight: 800, boxShadow: '0 8px 20px rgba(8,145,178,0.3)',
              }}
            >
              {initials(name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{name}</h2>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem',
                  padding: '0.25rem 0.7rem', borderRadius: 'var(--r-pill)', fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--c-cyan-pale)', color: 'var(--c-cyan)',
                }}
              >
                <Stethoscope size={12} />
                {form.specialty || 'No specialty set'}
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--bdr-default)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <PreviewRow icon={Award} muted={!form.qualifications}>{form.qualifications || 'Qualifications not provided'}</PreviewRow>
            <PreviewRow icon={MapPin} muted={!form.clinic_location}>{form.clinic_location || 'Clinic location not provided'}</PreviewRow>
          </div>

          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
              padding: '0.9rem 1.1rem', borderRadius: 'var(--r-md)', background: 'var(--c-primary-pale)',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-muted)' }}>
              Consultation fee
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-primary)' }}>
              {formatFee(form.consultation_fee)}
            </span>
          </div>

          <div style={{ height: 1, background: 'var(--bdr-default)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <PreviewRow icon={Mail}>{doctor?.email || user?.email}</PreviewRow>
            {doctor?.phone && <PreviewRow icon={Phone}>{doctor.phone}</PreviewRow>}
          </div>

          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--txt-muted)' }}>
            <BadgeCheck size={14} style={{ color: 'var(--c-emerald)' }} />
            Preview updates as you type. Changes go live after you save.
          </p>
        </aside>

        {/* Edit form */}
        <form onSubmit={handleSubmit} style={{ ...cardStyle, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>Professional details</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', marginTop: '0.25rem' }}>
              Keep these accurate so patients can find and trust you.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--r-md)', background: 'var(--c-rose-pale)', border: '1px solid var(--c-rose-border)',
                color: 'var(--c-rose)', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          {saved && (
            <div
              role="status"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--r-md)', background: 'var(--c-emerald-pale)', border: '1px solid var(--c-emerald-border)',
                color: 'var(--c-emerald)', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> Your profile has been updated.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <Field id="doc-specialty" label="Specialty" icon={Stethoscope}>
              <select id="doc-specialty" name="specialty" value={form.specialty} onChange={handleChange} style={inputStyle}>
                {!SPECIALTIES.includes(form.specialty) && (
                  <option value={form.specialty}>{form.specialty || 'Select a specialty'}</option>
                )}
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field id="doc-fee" label="Consultation fee" icon={Banknote}>
              <input
                id="doc-fee" name="consultation_fee" type="number" min="0" step="0.01"
                value={form.consultation_fee} onChange={handleChange} placeholder="0.00" style={inputStyle}
              />
            </Field>
          </div>

          <Field id="doc-qualifications" label="Qualifications" icon={Award} hint="Degrees and certifications, separated by commas.">
            <input
              id="doc-qualifications" name="qualifications" type="text" maxLength={255}
              value={form.qualifications} onChange={handleChange}
              placeholder="e.g. MBBS, MD (Cardiology)" style={inputStyle}
            />
          </Field>

          <Field id="doc-location" label="Clinic location" icon={MapPin} hint="Where patients should come for consultations.">
            <input
              id="doc-location" name="clinic_location" type="text" maxLength={255}
              value={form.clinic_location} onChange={handleChange}
              placeholder="e.g. Room 12, HealthOps Hospital, Colombo 07" style={inputStyle}
            />
          </Field>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--bdr-default)' }}>
            <button
              type="button" onClick={handleReset} disabled={!isDirty || isSaving}
              className="btn btn-secondary" style={{ opacity: !isDirty ? 0.5 : 1 }}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              type="submit" disabled={!isDirty || isSaving}
              className="btn btn-primary" style={{ opacity: !isDirty && !isSaving ? 0.6 : 1 }}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
