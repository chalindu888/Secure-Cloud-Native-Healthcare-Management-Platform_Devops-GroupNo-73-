import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  LogOut, 
  Menu, 
  X, 
  Server,
  User,
  Stethoscope,
  Shield,
  LayoutDashboard,
  Calendar,
  Clock
} from 'lucide-react';
import hospitalIcon from '../assets/hospital-icon.png';

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
      className="sticky top-0 z-50 w-full"
      style={{
        background: scrolled ? 'rgba(20, 50, 43, 0.96)' : 'rgba(20, 50, 43, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'all 300ms ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left: Hospital Brand Logo ONLY */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="HealthOps Home">
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center relative flex-shrink-0"
              style={{
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                border: '1px solid rgba(255,255,255,0.18)',
                transition: 'transform 300ms ease, box-shadow 300ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img
                src={hospitalIcon}
                alt="HealthOps Hospital Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <span
                className="font-extrabold text-lg tracking-tight block"
                style={{
                  background: 'linear-gradient(90deg, #e2e8f0, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Health<span style={{ background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ops</span>
              </span>
              <p className="text-[10px] font-medium leading-none" style={{ color: '#94a3b8' }}>
                Hospital Platform
              </p>
            </div>
          </Link>

          {/* Right: All Navigation Links, Demo Switcher, & Profile on the Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Nav Links */}
            <div className="flex items-center gap-1 mr-2">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <Home size={14} />
                Home
              </Link>
              <Link to="/doctors" className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}>
                <Stethoscope size={14} />
                Find Doctors
              </Link>

              {isAuthenticated && role === 'patient' && (
                <>
                  <Link to="/patient" className={`nav-link ${isActive('/patient') ? 'active' : ''}`}>
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <Link to="/patient/book" className={`nav-link ${isActive('/patient/book') ? 'active' : ''}`}>
                    <Calendar size={14} />
                    Book
                  </Link>
                  <Link to="/patient/appointments" className={`nav-link ${isActive('/patient/appointments') ? 'active' : ''}`}>
                    <Clock size={14} />
                    My Appointments
                  </Link>
                </>
              )}

              {isAuthenticated && role === 'doctor' && (
                <>
                  <Link to="/doctor" className={`nav-link ${isActive('/doctor') ? 'active' : ''}`}>
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <Link to="/doctor/appointments" className={`nav-link ${isActive('/doctor/appointments') ? 'active' : ''}`}>
                    <Clock size={14} />
                    Queue
                  </Link>
                  <Link to="/doctor/schedule" className={`nav-link ${isActive('/doctor/schedule') ? 'active' : ''}`}>
                    <Calendar size={14} />
                    Schedule
                  </Link>
                </>
              )}

              {isAuthenticated && role === 'admin' && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <LayoutDashboard size={14} />
                    Admin Hub
                  </Link>
                  <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                    <User size={14} />
                    Users
                  </Link>
                  <Link to="/admin/audit-logs" className={`nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`}>
                    <Shield size={14} />
                    Audit
                  </Link>
                  <Link
                    to="/admin/devops"
                    className={`nav-link flex items-center gap-1.5 ${isActive('/admin/devops') ? 'active' : ''}`}
                    style={{ color: isActive('/admin/devops') ? '#6ee7b7' : undefined }}
                  >
                    <Server size={14} />
                    DevOps
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Role Switcher */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                Demo:
              </span>
              {[
                { r: 'patient', label: 'Patient', active: 'rgba(99,102,241,0.9)' },
                { r: 'doctor', label: 'Doctor', active: 'rgba(6,182,212,0.9)' },
                { r: 'admin', label: 'Admin', active: 'rgba(16,185,129,0.9)' },
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
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: currentRole?.bg || 'rgba(99,102,241,0.3)',
                      border: `1px solid ${currentRole?.border || 'rgba(99,102,241,0.4)'}`,
                      color: currentRole?.color || '#a5b4fc',
                    }}
                  >
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="hidden xl:block text-left leading-none">
                    <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{user?.name || 'Account'}</p>
                    <p className="text-[10px] capitalize mt-0.5" style={{ color: '#94a3b8' }}>{role}</p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="btn btn-icon transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171',
                    minHeight: '2.25rem',
                    width: '2.25rem',
                    borderRadius: '0.625rem',
                  }}
                >
                  <LogOut size={15} />
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

          {/* Mobile Menu Button (< lg screens) */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden px-4 pt-3 pb-6 space-y-4"
          style={{
            background: 'rgba(20, 50, 43, 0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Demo Role Switcher Mobile */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Switch Demo Role</p>
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

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive('/') ? 'nav-link active' : 'nav-link'}`}
            >
              <Home size={16} />
              Home
            </Link>
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive('/doctors') ? 'nav-link active' : 'nav-link'}`}
            >
              <Stethoscope size={16} />
              Find Doctors
            </Link>

            {isAuthenticated && role === 'patient' && [
              { to: '/patient', label: 'Patient Dashboard', icon: LayoutDashboard },
              { to: '/patient/book', label: 'Book Appointment', icon: Calendar },
              { to: '/patient/appointments', label: 'My Appointments', icon: Clock },
              { to: '/patient/profile', label: 'Medical Profile', icon: User },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(to) ? 'nav-link active' : 'nav-link'}`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}

            {isAuthenticated && role === 'doctor' && [
              { to: '/doctor', label: 'Doctor Dashboard', icon: LayoutDashboard },
              { to: '/doctor/appointments', label: 'Appointment Queue', icon: Clock },
              { to: '/doctor/schedule', label: 'Schedule Settings', icon: Calendar },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(to) ? 'nav-link active' : 'nav-link'}`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}

            {isAuthenticated && role === 'admin' && [
              { to: '/admin', label: 'Admin Hub', icon: LayoutDashboard },
              { to: '/admin/users', label: 'User Management', icon: User },
              { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
              { to: '/admin/devops', label: 'DevOps Observability', icon: Server },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(to) ? 'nav-link active' : 'nav-link'}`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Auth */}
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
                    <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>Open {role} dashboard</p>
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
