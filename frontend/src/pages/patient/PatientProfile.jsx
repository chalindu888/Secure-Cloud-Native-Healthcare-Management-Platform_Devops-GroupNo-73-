import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Heart,
  Phone,
  CheckCircle2,
  Save,
  Lock,
  X,
  Plus,
  AlertCircle,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses flex/grid `gap` and inline padding instead.

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['Penicillin', 'Aspirin', 'Sulfa drugs', 'Peanuts', 'Latex', 'Shellfish'];

// Stored as one string "Name (phone)" so the dashboard can keep showing it as-is
const parseEmergencyContact = (value = '') => {
  const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(value);
  return match ? { name: match[1], phone: match[2] } : { name: value, phone: '' };
};

const formatEmergencyContact = (name, phone) => {
  const n = name.trim();
  const p = phone.trim();
  if (n && p) return `${n} (${p})`;
  return n || p;
};

const parseAllergies = (value = '') =>
  value.split(',').map((a) => a.trim()).filter(Boolean);

const calculateAge = (isoDate) => {
  if (!isoDate) return null;
  const birth = new Date(isoDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
};

const initials = (name = '') =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P';

const buildInitialForm = (user) => {
  const contact = parseEmergencyContact(user?.emergencyContact);
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    bloodGroup: user?.bloodGroup || '',
    allergies: parseAllergies(user?.allergies),
    emergencyName: contact.name,
    emergencyPhone: contact.phone
  };
};

const labelClass = 'text-sm font-semibold text-slate-700';
const hintClass = 'text-xs text-slate-500';

const Section = ({ icon: Icon, iconClass, title, subtitle, children }) => (
  <section className="card-strong flex flex-col gap-5" style={{ padding: '1.5rem' }}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const PatientProfile = () => {
  const { user, updateProfile } = useAuth();

  const [initialForm, setInitialForm] = useState(() => buildInitialForm(user));
  const [form, setForm] = useState(initialForm);
  const [allergyInput, setAllergyInput] = useState('');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
  const age = calculateAge(form.dateOfBirth);
  const today = new Date().toISOString().split('T')[0];
  const nameLooksLikeEmail = form.name.includes('@');

  // Simple completeness score so patients know what's still missing
  const checklist = [
    { label: 'Full name', done: !!form.name.trim() && !nameLooksLikeEmail },
    { label: 'Phone', done: !!form.phone.trim() },
    { label: 'Date of birth', done: !!form.dateOfBirth },
    { label: 'Address', done: !!form.address.trim() },
    { label: 'Blood group', done: !!form.bloodGroup },
    { label: 'Emergency contact', done: !!form.emergencyName.trim() && !!form.emergencyPhone.trim() }
  ];
  const completed = checklist.filter((c) => c.done).length;
  const completion = Math.round((completed / checklist.length) * 100);

  const setField = (name, value) => {
    setError('');
    setSavedSuccess(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const addAllergy = (value) => {
    const allergy = value.trim();
    if (!allergy) return;
    const exists = form.allergies.some((a) => a.toLowerCase() === allergy.toLowerCase());
    if (!exists) setField('allergies', [...form.allergies, allergy]);
    setAllergyInput('');
  };

  const removeAllergy = (allergy) =>
    setField('allergies', form.allergies.filter((a) => a !== allergy));

  const handleReset = () => {
    setForm(initialForm);
    setAllergyInput('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (form.emergencyPhone && !/^[+\d][\d\s()-]{6,}$/.test(form.emergencyPhone.trim())) {
      setError('Please enter a valid emergency contact phone number.');
      return;
    }

    // Include anything still typed in the allergy box
    const allergies = allergyInput.trim()
      ? [...form.allergies, allergyInput.trim()]
      : form.allergies;

    const savedForm = { ...form, allergies };

    updateProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth,
      address: form.address.trim(),
      bloodGroup: form.bloodGroup,
      allergies: allergies.join(', '),
      emergencyContact: formatEmergencyContact(form.emergencyName, form.emergencyPhone)
    });

    setForm(savedForm);
    setInitialForm(savedForm);
    setAllergyInput('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-wrapper flex flex-col gap-8" style={{ maxWidth: '56rem' }}>
      {/* Profile header */}
      <div className="card-strong flex flex-col sm:flex-row sm:items-center gap-5" style={{ padding: '1.5rem' }}>
        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {initials(form.name)}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h1 className="text-2xl text-slate-900 truncate">
            {form.name && !nameLooksLikeEmail ? form.name : 'My Profile'}
          </h1>
          <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          <div className="flex flex-wrap gap-2" style={{ paddingTop: '0.25rem' }}>
            {form.bloodGroup && <span className="badge badge-danger">Blood {form.bloodGroup}</span>}
            {age !== null && <span className="badge badge-muted">{age} years</span>}
            {form.allergies.length > 0 && (
              <span className="badge badge-warning">
                {form.allergies.length} allerg{form.allergies.length === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Profile complete</span>
            <span className={completion === 100 ? 'text-emerald-600' : 'text-indigo-600'}>{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className={hintClass}>
              Missing: {checklist.filter((c) => !c.done).map((c) => c.label).join(', ')}
            </p>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success flex items-center gap-3" role="status" style={{ padding: '0.9rem 1.1rem' }}>
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">Your profile has been saved.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger flex items-center gap-3" role="alert" style={{ padding: '0.9rem 1.1rem' }}>
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Personal details */}
        <Section
          icon={User}
          iconClass="bg-blue-50 text-blue-600"
          title="Personal details"
          subtitle="How we identify and contact you"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className={labelClass}>Full name *</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Chalindu Perera" required />
              {nameLooksLikeEmail && (
                <p className="text-xs text-amber-600">This looks like an email address. Please enter your real name.</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={labelClass}>Email address</label>
              <div className="relative">
                <input id="email" type="email" value={user?.email || ''} disabled style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', paddingRight: '2.5rem' }} />
                <Lock size={16} className="absolute text-slate-400" style={{ right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <p className={hintClass}>Used to sign in, so it can't be changed here.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className={labelClass}>Phone number</label>
              <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 070 108 0429" autoComplete="tel" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dateOfBirth" className={labelClass}>
                Date of birth {age !== null && <span className="font-normal text-slate-500">· {age} years old</span>}
              </label>
              <input id="dateOfBirth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} max={today} />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="address" className={labelClass}>Home address</label>
              <input id="address" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Street, city" autoComplete="street-address" />
            </div>
          </div>
        </Section>

        {/* Medical information */}
        <Section
          icon={Heart}
          iconClass="bg-rose-50 text-rose-600"
          title="Medical information"
          subtitle="Shared with doctors you book with"
        >
          <div className="flex flex-col gap-2">
            <span className={labelClass}>Blood group</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" role="radiogroup" aria-label="Blood group">
              {BLOOD_GROUPS.map((bg) => {
                const selected = form.bloodGroup === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setField('bloodGroup', selected ? '' : bg)}
                    className={`rounded-xl border text-sm font-bold transition ${
                      selected
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                    }`}
                    style={{ padding: '0.6rem 0' }}
                  >
                    {bg}
                  </button>
                );
              })}
            </div>
            <p className={hintClass}>Not sure? Leave it empty — your doctor can test it.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="allergy-input" className={labelClass}>Allergies</label>
            {form.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-800"
                    style={{ padding: '0.35rem 0.5rem 0.35rem 0.85rem' }}
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy)}
                      className="rounded-full text-amber-500 hover:text-rose-600 hover:bg-white transition"
                      style={{ padding: '0.15rem' }}
                      aria-label={`Remove ${allergy}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No allergies recorded.</p>
            )}
            <div className="flex gap-2">
              <input
                id="allergy-input"
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addAllergy(allergyInput);
                  }
                }}
                placeholder="Type an allergy and press Enter"
              />
              <button type="button" onClick={() => addAllergy(allergyInput)} className="btn btn-secondary btn-sm shrink-0">
                <Plus size={16} />
                Add
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={hintClass}>Common:</span>
              {COMMON_ALLERGIES.filter((a) => !form.allergies.includes(a)).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => addAllergy(a)}
                  className="rounded-full border border-dashed border-slate-300 text-xs text-slate-600 hover:border-amber-400 hover:text-amber-700 transition"
                  style={{ padding: '0.2rem 0.65rem' }}
                >
                  + {a}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Emergency contact */}
        <Section
          icon={ShieldAlert}
          iconClass="bg-amber-50 text-amber-600"
          title="Emergency contact"
          subtitle="Who we call if something happens during your visit"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="emergencyName" className={labelClass}>Contact name</label>
              <input id="emergencyName" type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} placeholder="e.g. Nimali Perera (Mother)" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="emergencyPhone" className={labelClass}>Contact phone</label>
              <div className="relative">
                <input id="emergencyPhone" type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} placeholder="e.g. 077 123 4567" style={{ paddingLeft: '2.6rem' }} />
                <Phone size={16} className="absolute text-slate-400" style={{ left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>
        </Section>

        {/* Save bar */}
        <div
          className="card-strong flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ padding: '1.1rem 1.5rem', position: 'sticky', bottom: '1rem', zIndex: 10 }}
        >
          <p className={`text-sm font-medium ${hasChanges ? 'text-amber-600' : 'text-slate-500'}`}>
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex gap-3">
            {hasChanges && (
              <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
                <RotateCcw size={16} />
                Undo
              </button>
            )}
            <button type="submit" disabled={!hasChanges && !allergyInput.trim()} className="btn btn-primary btn-sm">
              <Save size={16} />
              Save profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
