import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserCheck, Stethoscope, ShieldAlert, Eye, EyeOff, Zap } from 'lucide-react';

const Login = () => {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') { navigate(from, { replace: true }); return; }
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) redirectAfterLogin(res.user.role);
      else setError('Invalid credentials. Use the demo buttons below to try the app!');
    }, 400);
  };

  const handleQuickDemo = (role) => {
    const user = loginAs(role);
    redirectAfterLogin(user.role);
  };

  const demoButtons = [
    { role: 'patient', label: 'Patient', icon: UserCheck, color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)', hoverBg: 'rgba(99,102,241,0.28)' },
    { role: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#67e8f9', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.35)', hoverBg: 'rgba(6,182,212,0.28)' },
    { role: 'admin', label: 'Admin', icon: ShieldAlert, color: '#6ee7b7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', hoverBg: 'rgba(16,185,129,0.28)' },
  ];

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
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fade-up w-full" style={{ maxWidth: '420px' }}>
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
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Sign in to your HealthOps account to continue
          </p>
        </div>

        {/* Demo Quick Login */}
        <div
          className="animate-fade-up-1"
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={12} style={{ color: '#fbbf24' }} />
            ⚡ 1-Click Evaluator Demo Login
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
            {demoButtons.map(({ role, label, icon: Icon, color, bg, border, hoverBg }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickDemo(role)}
                className="btn"
                style={{
                  flexDirection: 'column', gap: '0.375rem',
                  padding: '0.75rem 0.5rem',
                  background: bg, color, border: `1px solid ${border}`,
                  minHeight: 'auto', borderRadius: '0.75rem',
                  fontSize: '0.75rem', fontWeight: 700,
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or sign in with credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Login Card */}
        <div
          className="animate-fade-up-2 glass-card-strong"
          style={{ padding: '2rem' }}
        >
          {/* Error Alert */}
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
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@healthops.io"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + JWT badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ accentColor: '#6366f1', width: '14px', height: '14px' }}
                />
                Remember me
              </label>
              <span
                style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                  borderRadius: '999px', background: 'rgba(16,185,129,0.12)',
                  color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                🔒 Protected by JWT
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
              style={{ fontSize: '0.95rem', padding: '0.875rem' }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Authenticating...
                </span>
              ) : (
                <>
                  Sign In to HealthOps
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#818cf8', fontWeight: 700 }}>
                Create an account →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;