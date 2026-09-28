import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  LogOut, 
  Menu, 
  X, 
  Server
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const profilePath = role === 'patient' ? '/patient/profile' : role === 'doctor' ? '/doctor' : '/admin';

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">Health<span className="text-blue-600">Ops</span></span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">DevSecOps</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-none">Cloud-Native Healthcare</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/doctors') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Find Doctors
              </Link>

              {/* Patient Role Links */}
              {isAuthenticated && role === 'patient' && (
                <>
                  <Link
                    to="/patient"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/patient') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Patient Dashboard
                  </Link>
                  <Link
                    to="/patient/book"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/patient/book') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/patient/appointments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/patient/appointments') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    My Appointments
                  </Link>
                </>
              )}

              {/* Doctor Role Links */}
              {isAuthenticated && role === 'doctor' && (
                <>
                  <Link
                    to="/doctor"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/doctor') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Doctor Dashboard
                  </Link>
                  <Link
                    to="/doctor/appointments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/doctor/appointments') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Appointments Queue
                  </Link>
                  <Link
                    to="/doctor/schedule"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/doctor/schedule') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Manage Schedule
                  </Link>
                </>
              )}

              {/* Admin Role Links */}
              {isAuthenticated && role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Admin Hub
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/users') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/audit-logs') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Audit Logs
                  </Link>
                  <Link
                    to="/admin/devops"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive('/admin/devops') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    <Server size={15} />
                    DevOps Observability
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Section: Demo Role Switcher & Auth Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick Demo Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Demo Role:
              </span>
              <button
                type="button"
                onClick={() => handleRoleSwitch('patient')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  role === 'patient'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('doctor')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  role === 'doctor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  role === 'admin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={profilePath}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="text-left leading-tight hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium capitalize">{role}</p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3" role="dialog" aria-label="Mobile navigation">
          {/* Mobile Role Switcher */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Switch Active Persona</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleRoleSwitch('patient')}
                className={`py-1.5 text-xs font-semibold rounded-lg ${
                  role === 'patient' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('doctor')}
                className={`py-1.5 text-xs font-semibold rounded-lg ${
                  role === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`py-1.5 text-xs font-semibold rounded-lg ${
                  role === 'admin' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/') ? 'page' : undefined}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/doctors') ? 'page' : undefined}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/doctors') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Find Doctors
            </Link>

            {isAuthenticated && role === 'patient' && (
              <>
                <Link
                  to="/patient"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  Patient Dashboard
                </Link>
                <Link
                  to="/patient/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/patient/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  My Appointments
                </Link>
                <Link
                  to="/patient/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  Medical Profile
                </Link>
              </>
            )}

            {isAuthenticated && role === 'doctor' && (
              <>
                <Link
                  to="/doctor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Doctor Dashboard
                </Link>
                <Link
                  to="/doctor/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Appointment Queue
                </Link>
                <Link
                  to="/doctor/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Schedule Settings
                </Link>
              </>
            )}

            {isAuthenticated && role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Admin Hub
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  User Management
                </Link>
                <Link
                  to="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Audit Logs
                </Link>
                <Link
                  to="/admin/devops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  DevOps Observability
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={profilePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'Account'}</p>
                    <p className="text-xs text-slate-500 capitalize">Open {role} dashboard</p>
                  </div>
                </Link>
                <button
                  type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-50 text-rose-700 font-semibold"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-lg bg-blue-600 font-semibold text-white"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
