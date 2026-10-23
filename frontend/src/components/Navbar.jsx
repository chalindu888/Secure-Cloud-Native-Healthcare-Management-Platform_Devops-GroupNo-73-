import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Home,
  LogOut,
  Menu,
  X,
  Server,
  User,
  Users,
  Stethoscope,
  Shield,
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  ClipboardList,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';
import hospitalIcon from '../assets/hospital-icon.png';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses flex `gap` and inline padding instead.

const NAV_BG = 'rgba(20, 50, 43, 0.94)';

const ROLE_CONFIG = {
  patient: { label: 'Patient', icon: User, color: '#a5b4fc', solid: '#6366f1', home: '/patient' },
  doctor:  { label: 'Doctor', icon: Stethoscope, color: '#67e8f9', solid: '#0891b2', home: '/doctor' },
  admin:   { label: 'Admin', icon: Shield, color: '#6ee7b7', solid: '#059669', home: '/admin' },
};

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/doctors', label: 'Find Doctors', icon: Stethoscope },
];

const ROLE_LINKS = {
  patient: [
    { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/book', label: 'Book Visit', icon: CalendarPlus },
    { to: '/patient/appointments', label: 'My Appointments', icon: ClipboardList },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: ClipboardList, badge: 'pending' },
    { to: '/doctor/schedule', label: 'Schedule', icon: Calendar },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
    { to: '/admin/devops', label: 'System Health', icon: Server },
  ],
};

// "Alex Rivera (DevSecOps Lead)" -> "Alex Rivera"
const displayName = (name = '') => name.replace(/\s*\(.*\)\s*$/, '').trim() || 'Account';

const initials = (name = '') =>
  displayName(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const Navbar = () => {
  const { user, isAuthenticated, role, logout, loginAs } = useAuth();
  const { appointments } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const currentRole = role ? ROLE_CONFIG[role] : null;
  const roleLinks = isAuthenticated && role ? ROLE_LINKS[role] : [];
  const links = [...PUBLIC_LINKS, ...roleLinks];

  const pendingCount = role === 'doctor'
    ? appointments.filter(
        (apt) => apt.status === 'pending' && (apt.doctorId === user?.id || apt.doctorName === user?.name)
      ).length
    : 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on navigation, Escape, or a click outside the account menu
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMobileMenuOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleRoleSwitch = (newRole) => {
    loginAs(newRole);
    navigate(ROLE_CONFIG[newRole].home);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderBadge = (link) =>
    link.badge === 'pending' && pendingCount > 0 ? (
      <span
        className="inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: '#f59e0b', minWidth: 18, height: 18, padding: '0 5px' }}
        aria-label={`${pendingCount} pending`}
      >
        {pendingCount}
      </span>
    ) : null;

  const roleSwitcher = (
    <div className="flex flex-col gap-1">
      {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
        const Icon = cfg.icon;
        const selected = role === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleRoleSwitch(key)}
            className={`w-full flex items-center gap-3 rounded-lg text-sm text-left transition ${
              selected ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
            style={{ padding: '0.5rem 0.65rem' }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ background: cfg.solid }}
            >
              <Icon size={15} />
            </span>
            <span className="flex-1">View as {cfg.label}</span>
            {selected && <Check size={16} className="text-emerald-600" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: NAV_BG,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: scrolled ? '0 8px 30px rgba(0,0,0,0.3)' : '0 1px 0 rgba(0,0,0,0.1)',
        transition: 'box-shadow 300ms ease',
      }}
    >
      <div className="w-full flex items-center justify-between gap-6 h-16" style={{ padding: '0 clamp(1rem, 2.5vw, 2.5rem)' }}>
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="HealthOps home">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
          >
            <img src={hospitalIcon} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-white">
              Health<span style={{ color: '#6ee7b7' }}>Ops</span>
            </span>
            <span className="block text-[11px] font-medium" style={{ color: '#94a3b8' }}>
              Hospital Platform
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className="relative inline-flex items-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors"
                style={{
                  padding: '0.5rem 0.9rem',
                  color: active ? '#ffffff' : '#cbd5e1',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ color: active ? currentRole?.color || '#6ee7b7' : undefined }} />
                {link.label}
                {renderBadge(link)}
                {active && (
                  <span
                    className="absolute rounded-full"
                    style={{ left: '30%', right: '30%', bottom: -12, height: 3, background: currentRole?.color || '#6ee7b7' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden xl:block" ref={menuRef}>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 rounded-full transition"
                style={{
                  padding: '0.3rem 0.75rem 0.3rem 0.3rem',
                  background: menuOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: currentRole?.solid }}
                >
                  {initials(user?.name)}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-semibold text-white truncate" style={{ maxWidth: 140 }}>
                    {displayName(user?.name)}
                  </span>
                  <span className="block text-[11px]" style={{ color: currentRole?.color }}>
                    {currentRole?.label}
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  style={{ color: '#94a3b8', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="inline-flex items-center gap-2 rounded-full text-sm font-medium transition"
                  style={{ padding: '0.5rem 0.9rem', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Sparkles size={15} />
                  Try Demo
                  <ChevronDown size={15} />
                </button>
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* Account / demo dropdown */}
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3 animate-fade-in"
                style={{ top: 'calc(100% + 10px)', width: 290, padding: '0.75rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
              >
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3" style={{ padding: '0.25rem 0.5rem' }}>
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: currentRole?.solid }}
                      >
                        {initials(user?.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{displayName(user?.name)}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex flex-col gap-1">
                      <Link
                        to={currentRole?.home || '/'}
                        className="flex items-center gap-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        style={{ padding: '0.5rem 0.65rem' }}
                      >
                        <LayoutDashboard size={16} className="text-slate-400" />
                        My Dashboard
                      </Link>
                      {role === 'patient' && (
                        <Link
                          to="/patient/profile"
                          className="flex items-center gap-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                          style={{ padding: '0.5rem 0.65rem' }}
                        >
                          <User size={16} className="text-slate-400" />
                          Medical Profile
                        </Link>
                      )}
                    </div>
                    <div className="h-px bg-slate-100" />
                  </>
                )}

                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400" style={{ padding: '0 0.5rem' }}>
                    Demo mode
                  </p>
                  {roleSwitcher}
                </div>

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 text-left"
                      style={{ padding: '0.5rem 0.65rem' }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="xl:hidden relative rounded-xl transition"
            style={{
              padding: '0.5rem',
              background: mobileMenuOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            {!mobileMenuOpen && pendingCount > 0 && (
              <span
                className="absolute rounded-full"
                style={{ top: 6, right: 6, width: 8, height: 8, background: '#f59e0b' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden flex flex-col gap-4 animate-fade-in"
          style={{ background: NAV_BG, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem 1.5rem' }}
        >
          {isAuthenticated && (
            <div
              className="flex items-center gap-3 rounded-xl"
              style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: currentRole?.solid }}
              >
                {initials(user?.name)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayName(user?.name)}</p>
                <p className="text-xs" style={{ color: currentRole?.color }}>{currentRole?.label}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {[...links, ...(role === 'patient' && isAuthenticated ? [{ to: '/patient/profile', label: 'Medical Profile', icon: User }] : [])].map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className="flex items-center gap-3 rounded-xl text-sm font-medium"
                  style={{
                    padding: '0.7rem 0.85rem',
                    color: active ? '#ffffff' : '#cbd5e1',
                    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                    borderLeft: `3px solid ${active ? currentRole?.color || '#6ee7b7' : 'transparent'}`,
                  }}
                >
                  <Icon size={18} />
                  <span className="flex-1">{link.label}</span>
                  {renderBadge(link)}
                </Link>
              );
            })}
          </div>

          <div className="bg-white rounded-xl flex flex-col gap-1" style={{ padding: '0.65rem' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400" style={{ padding: '0 0.5rem 0.25rem' }}>
              Demo mode
            </p>
            {roleSwitcher}
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
              style={{ padding: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
