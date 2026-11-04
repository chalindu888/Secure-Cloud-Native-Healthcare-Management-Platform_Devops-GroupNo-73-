import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Coming from sign-up: prefill the new email and confirm the account was created
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const signupMessage = location.state?.message || '';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
setError('');
if (!email) {
  setError('Please enter your email address.');
  return;
}

setIsLoading(true);

const res = await login(email, password);

setIsLoading(false);

if (res.success) {
  redirectAfterLogin(res.user.role);
} else {
  setError(res.message || 'Invalid email or password.');
}
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

        {/* Login Card */}
        <div
          className="animate-fade-up-2 glass-card-strong"
          style={{ padding: '2rem' }}
        >
          {/* Error Alert */}
          {signupMessage && !error && (
            <div className="alert alert-success" role="status" style={{ padding: '0.875rem 1rem', marginBottom: '1.25rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
              ✅ {signupMessage}
            </div>
          )}

          {error && (
            <div role="alert" style={{
              padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem',
              background: '#fff1f2', border: '1px solid #fecdd3',
              color: '#be123c', fontSize: '0.85rem', fontWeight: 600,
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