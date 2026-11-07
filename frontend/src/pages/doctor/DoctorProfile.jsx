import React, { useEffect, useRef, useState } from 'react';
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
  Camera,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  ShieldCheck,
  Briefcase,
  Users,
  FileText
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const SPECIALTIES = ['Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Orthopedics'];

const EMPTY_FORM = {
  specialty: '',
  qualifications: '',
  clinic_location: '',
  consultation_fee: '',
  license: '',
  years_experience: '',
  max_patients_per_day: '',
  bio: '',
  photo: '',
};

const BIO_MAX = 2000;

const PHOTO_SIZE = 320;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const toForm = (doctor) => ({
  specialty: doctor.specialty || '',
  qualifications: doctor.qualifications || '',
  clinic_location: doctor.clinic_location || '',
  consultation_fee: doctor.consultation_fee ?? '',
  license: doctor.license || '',
  years_experience: doctor.years_experience ?? '',
  max_patients_per_day: doctor.max_patients_per_day ?? '',
  bio: doctor.bio || '',
  photo: doctor.photo || '',
});

// Center-crop to a square and shrink, so the saved photo stays small (~20-40 KB)
const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      canvas.getContext('2d').drawImage(
        img,
        (img.width - side) / 2, (img.height - side) / 2, side, side,
        0, 0, PHOTO_SIZE, PHOTO_SIZE
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
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
  const fileInputRef = useRef(null);

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

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('That image is too large. Please choose one under 8 MB.');
      return;
    }

    try {
      const photo = await resizeImage(file);
      setSaved(false);
      setError('');
      setForm((prev) => ({ ...prev, photo }));
    } catch (imageError) {
      setError(imageError.message);
    }
  };

  const handleRemovePhoto = () => {
    setSaved(false);
    setForm((prev) => ({ ...prev, photo: '' }));
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
      // Only send the photo when it actually changed
      const payload = { ...form };
      if (form.photo === original.photo) delete payload.photo;

      const { data } = await api.put(`/doctor/profile/${user.id}`, payload);
      setDoctor((prev) => ({ ...prev, ...data.doctor }));
      setForm(toForm(data.doctor));
      updateProfile({ specialty: data.doctor.specialty, photo: data.doctor.photo, license: data.doctor.license });
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '7.5rem', height: '7.5rem', borderRadius: '50%', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: '#fff',
                  fontSize: '2.25rem', fontWeight: 800, border: '4px solid #ffffff',
                  boxShadow: '0 10px 28px rgba(8,145,178,0.3)',
                }}
              >
                {form.photo ? (
                  <img src={form.photo} alt={`${name} profile`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  initials(name)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
                title="Change profile photo"
                style={{
                  position: 'absolute', right: '0.1rem', bottom: '0.1rem', width: '2.25rem', height: '2.25rem',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--c-primary)', color: '#fff', border: '3px solid #ffffff', cursor: 'pointer',
                  boxShadow: 'var(--shdw-primary)',
                }}
              >
                <Camera size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelected}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{name}</h2>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem',
                  padding: '0.25rem 0.7rem', borderRadius: 'var(--r-pill)', fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--c-cyan-pale)', color: 'var(--c-cyan)',
                }}
              >
                <Stethoscope size={12} />
                {form.specialty || 'No specialty set'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm">
                <Camera size={14} /> {form.photo ? 'Change photo' : 'Upload photo'}
              </button>
              {form.photo && (
                <button type="button" onClick={handleRemovePhoto} className="btn btn-secondary btn-sm" style={{ color: 'var(--c-rose)' }}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--bdr-default)' }} />

          {form.bio && (
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--txt-secondary)', textAlign: 'center', overflowWrap: 'anywhere' }}>
              {form.bio.length > 180 ? `${form.bio.slice(0, 180).trim()}...` : form.bio}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Experience', value: form.years_experience === '' ? '—' : `${form.years_experience} yr${Number(form.years_experience) === 1 ? '' : 's'}` },
              { label: 'Patients / day', value: form.max_patients_per_day === '' ? '—' : form.max_patients_per_day },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: '0.75rem', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{stat.value}</p>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <PreviewRow icon={ShieldCheck} muted={!form.license}>{form.license ? `SLMC Reg. No: ${form.license}` : 'SLMC registration number not provided'}</PreviewRow>
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
            <Field id="doc-slmc" label="SLMC registration number" icon={ShieldCheck} hint="Your Sri Lanka Medical Council registration number.">
              <input
                id="doc-slmc" name="license" type="text" maxLength={30}
                value={form.license} onChange={handleChange}
                placeholder="e.g. 12345" style={inputStyle}
              />
            </Field>

            <Field id="doc-specialty" label="Specialty" icon={Stethoscope}>
              <select id="doc-specialty" name="specialty" value={form.specialty} onChange={handleChange} style={inputStyle}>
                {!SPECIALTIES.includes(form.specialty) && (
                  <option value={form.specialty}>{form.specialty || 'Select a specialty'}</option>
                )}
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
            <Field id="doc-experience" label="Years of experience" icon={Briefcase}>
              <input
                id="doc-experience" name="years_experience" type="number" min="0" max="70" step="1"
                value={form.years_experience} onChange={handleChange} placeholder="e.g. 8" style={inputStyle}
              />
            </Field>

            <Field id="doc-max-patients" label="Max patients per day" icon={Users}>
              <input
                id="doc-max-patients" name="max_patients_per_day" type="number" min="1" max="200" step="1"
                value={form.max_patients_per_day} onChange={handleChange} placeholder="e.g. 25" style={inputStyle}
              />
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

          <div>
            <label htmlFor="doc-bio" style={labelStyle}>Professional biography</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ ...iconStyle, top: '1.1rem', transform: 'none' }} />
              <textarea
                id="doc-bio" name="bio" rows={6} maxLength={BIO_MAX}
                value={form.bio} onChange={handleChange}
                placeholder="Tell patients about your background, areas of focus and approach to care."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
            <p style={{ ...hintStyle, display: 'flex', justifyContent: 'space-between' }}>
              <span>Shown on your card in the specialists directory.</span>
              <span>{form.bio.length}/{BIO_MAX}</span>
            </p>
          </div>

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
