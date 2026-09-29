import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Mail, Lock, Phone, Stethoscope, ArrowRight, Eye, EyeOff, Droplets } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'O+',
    specialty: 'Cardiology',
    department: 'Cardiovascular Institute',
    license: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);

    const res = await register({
      ...formData,
      role
    });

    setIsLoading(false);

    if (res.success) {
      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } else {
      setError(res.message || 'Failed to create account.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.75rem',
    color: '#f1f5f9',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 200ms ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  };

  const iconWrapStyle = {
    position: 'absolute',
    left: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#475569',
    pointerEvents: 'none',
  };
  };

  return (
    <div
      style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        position: 'relative',
      }}
    >
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '5%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fade-up w-full" style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: '1rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
              marginBottom: '1.25rem',
            }}
          >
            <Activity size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.5rem' }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Join the secure platform connecting patients, medical staff, and care operations
          </p>
        </div>

        {/* Role Toggle */}
        <div
          className="animate-fade-up-1"
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            padding: '0.375rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '1.25rem',
          }}
        >
          {[
            { r: 'patient', label: 'I am a Patient', icon: User, color: '#818cf8', activeBg: 'rgba(99,102,241,0.25)', activeBorder: 'rgba(99,102,241,0.5)' },
            { r: 'doctor', label: 'I am a Doctor', icon: Stethoscope, color: '#67e8f9', activeBg: 'rgba(6,182,212,0.25)', activeBorder: 'rgba(6,182,212,0.5)' },
          ].map(({ r, label, icon: Icon, color, activeBg, activeBorder }) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', border: 'none',
                background: role === r ? activeBg : 'transparent',
                color: role === r ? color : '#64748b',
                border: `1px solid ${role === r ? activeBorder : 'transparent'}`,
                boxShadow: role === r ? `0 4px 20px ${color}25` : 'none',
                transition: 'all 250ms ease',
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {/* Register Card */}
        <div className="animate-fade-up-2 glass-card-strong" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row: Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={iconWrapStyle} />
                  <input
                    type="text"
                    name="name"
                    id="reg-name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={role === 'doctor' ? 'Dr. Jane Smith' : 'John Doe'}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={iconWrapStyle} />
                  <input
                    type="email"
                    name="email"
                    id="reg-email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row: Password & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {/* Password */}
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={iconWrapStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="reg-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '2.75rem' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={iconWrapStyle} />
                  <input
                    type="tel"
                    name="phone"
                    id="reg-phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === 'patient' ? (
              <div>
                <label style={labelStyle}>Blood Group</label>
                <div style={{ position: 'relative' }}>
                  <Droplets size={15} style={iconWrapStyle} />
                  <select
                    name="bloodGroup"
                    id="reg-bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Medical Specialty</label>
                  <select
                    name="specialty"
                    id="reg-specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingLeft: '1rem', appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  >
                    {['Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Orthopedics'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>License / Credential ID</label>
                  <input
                    type="text"
                    name="license"
                    id="reg-license"
                    value={formData.license}
                    onChange={handleChange}
                    placeholder="MED-12345"
                    style={{ ...inputStyle, paddingLeft: '1rem' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            {/* Terms */}
            <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.6 }}>
              By registering, you agree to our{' '}
              <span style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>{' '}
              and{' '}
              <span style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>.
              Your data is protected with enterprise-grade encryption.
            </p>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={isLoading}
              className="btn"
              style={{
                background: role === 'doctor'
                  ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                fontSize: '0.95rem',
                padding: '0.9rem',
                boxShadow: role === 'doctor'
                  ? '0 4px 20px rgba(6,182,212,0.4)'
                  : '0 4px 20px rgba(99,102,241,0.4)',
                width: '100%',
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating Account...
                </span>
              ) : (
                <>
                  {role === 'doctor' ? <Stethoscope size={17} /> : <User size={17} />}
                  Register as {role === 'doctor' ? 'Doctor' : 'Patient'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#818cf8', fontWeight: 700 }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1e293b; color: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default Register;