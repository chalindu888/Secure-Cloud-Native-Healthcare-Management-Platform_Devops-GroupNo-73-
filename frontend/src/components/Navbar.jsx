import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  LogOut, 
  Menu, 
  X, 
  Server,
  ChevronDown,
  User,
  Stethoscope,
  Shield,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleSwitch = (newRole) => {
    loginAs(newRole);
    if (newRole === 'patient') navigate('/patient');
    if (newRole === 'doctor') navigate('/doctor');
    if (newRole === 'admin') navigate('/admin');
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const profilePath = role === 'patient' ? '/patient/profile' : role === 'doctor' ? '/doctor' : '/admin';

  useEffect(() => {
    const closeOnEscape = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const roleConfig = {
    patient: { label: 'Patient', icon: User, color: '#818cf8', bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.4)' },
    doctor:  { label: 'Doctor', icon: Stethoscope, color: '#67e8f9', bg: 'rgba(6,182,212,0.2)', border: 'rgba(6,182,212,0.4)' },
    admin:   { label: 'Admin', icon: Shield, color: '#6ee7b7', bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.4)' },
  };

  const currentRole = role ? roleConfig[role] : null;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: scrolled
          ? 'rgba(20, 50, 43, 0.94)'
          : 'rgba(20, 50, 43, 0.86)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 300ms ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group" aria-label="HealthOps Home">
              {/* Logo Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  transition: 'transform 300ms ease, box-shadow 300ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) rotate(-3deg)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
              >
                <Activity size={20} strokeWidth={2.5} />
              </div>

              {/* Brand Text */}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-extrabold text-xl tracking-tight"
                    style={{
                      background: 'linear-gradient(90deg, #e2e8f0, #a5b4fc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Health<span style={{ background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ops</span>
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                  >
                    DevSecOps
                  </span>
                </div>
                <p className="text-[10px] font-medium leading-none" style={{ color: '#64748b' }}>
                  Cloud-Native Healthcare
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/doctors" className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}>Find Doctors</Link>

              {isAuthenticated && role === 'patient' && (
                <>
                  <Link to="/patient" className={`nav-link ${isActive('/patient') ? 'active' : ''}`}>Dashboard</Link>
                  <Link to="/patient/book" className={`nav-link ${isActive('/patient/book') ? 'active' : ''}`}>Book</Link>
                  <Link to="/patient/appointments" className={`nav-link ${isActive('/patient/appointments') ? 'active' : ''}`}>My Appointments</Link>
                </>
              )}

              {isAuthenticated && role === 'doctor' && (
                <>
                  <Link to="/doctor" className={`nav-link ${isActive('/doctor') ? 'active' : ''}`}>Dashboard</Link>
                  <Link to="/doctor/appointments" className={`nav-link ${isActive('/doctor/appointments') ? 'active' : ''}`}>Queue</Link>
                  <Link to="/doctor/schedule" className={`nav-link ${isActive('/doctor/schedule') ? 'active' : ''}`}>Schedule</Link>
                </>
              )}

              {isAuthenticated && role === 'admin' && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin Hub</Link>
                  <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>Users</Link>
                  <Link to="/admin/audit-logs" className={`nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`}>Audit</Link>
                  <Link
                    to="/admin/devops"
                    className={`nav-link flex items-center gap-1.5 ${isActive('/admin/devops') ? 'active' : ''}`}
                    style={{ color: isActive('/admin/devops') ? '#6ee7b7' : undefined }}
                  >
                    <Server size={13} />
                    DevOps
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Demo Role Switcher */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>
                Demo:
              </span>
              {[
                { r: 'patient', label: 'Patient', active: 'rgba(99,102,241,0.85)' },
                { r: 'doctor', label: 'Doctor', active: 'rgba(6,182,212,0.85)' },
                { r: 'admin', label: 'Admin', active: 'rgba(16,185,129,0.85)' },
              ].map(({ r, label, active }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: role === r ? active : 'transparent',
                    color: role === r ? '#fff' : '#94a3b8',
                    boxShadow: role === r ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    transition: 'all 200ms ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={profilePath}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: currentRole?.bg || 'rgba(99,102,241,0.3)', border: `1px solid ${currentRole?.border || 'rgba(99,102,241,0.4)'}`, color: currentRole?.color || '#a5b4fc' }}
                  >
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="hidden xl:block text-left leading-none">
                    <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{user?.name}</p>
                    <p className="text-[10px] capitalize mt-0.5" style={{ color: '#64748b' }}>{role}</p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="btn btn-icon transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                    minHeight: '2.25rem',
                    width: '2.25rem',
                    borderRadius: '0.625rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-secondary" style={{ minHeight: '2.25rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ minHeight: '2.25rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl transition-all"
              style={{
                background: mobileMenuOpen ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                color: mobileMenuOpen ? '#a5b4fc' : '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-label="Mobile navigation"
          className="lg:hidden px-4 pt-4 pb-6 space-y-4"
          style={{
            background: 'rgba(10,15,30,0.97)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Role Switcher */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Switch Demo Role</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: 'patient', label: 'Patient', color: '#818cf8', bg: 'rgba(99,102,241,0.25)' },
                { r: 'doctor', label: 'Doctor', color: '#67e8f9', bg: 'rgba(6,182,212,0.25)' },
                { r: 'admin', label: 'Admin', color: '#6ee7b7', bg: 'rgba(16,185,129,0.25)' },
              ].map(({ r, label, color, bg }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className="py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: role === r ? bg : 'rgba(255,255,255,0.04)',
                    color: role === r ? color : '#64748b',
                    border: `1px solid ${role === r ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/doctors', label: 'Find Doctors' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(to) ? 'nav-link active' : 'nav-link'}`}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated && role === 'patient' && [
              { to: '/patient', label: 'Patient Dashboard' },
              { to: '/patient/book', label: 'Book Appointment' },
              { to: '/patient/appointments', label: 'My Appointments' },
              { to: '/patient/profile', label: 'Medical Profile' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium nav-link">{label}</Link>
            ))}

            {isAuthenticated && role === 'doctor' && [
              { to: '/doctor', label: 'Doctor Dashboard' },
              { to: '/doctor/appointments', label: 'Appointment Queue' },
              { to: '/doctor/schedule', label: 'Schedule Settings' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium nav-link">{label}</Link>
            ))}

            {isAuthenticated && role === 'admin' && [
              { to: '/admin', label: 'Admin Hub' },
              { to: '/admin/users', label: 'User Management' },
              { to: '/admin/audit-logs', label: 'Audit Logs' },
              { to: '/admin/devops', label: 'DevOps Observability' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium nav-link">{label}</Link>
            ))}
          </div>

          {/* Auth Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={profilePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs" style={{ background: currentRole?.bg, color: currentRole?.color, border: `1px solid ${currentRole?.border}` }}>
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{user?.name || 'Account'}</p>
                    <p className="text-xs capitalize" style={{ color: '#64748b' }}>Open {role} dashboard</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary w-full">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary w-full">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
