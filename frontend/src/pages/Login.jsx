import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserCheck, Stethoscope, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(email, password);

    if (res.success) {
      if (res.user.role === 'doctor') {
        navigate('/doctor');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/patient');
      }
    } else {
      console.log(res.message);
    }
  };

  const handleQuickDemo = (role) => {
    const user = loginAs(role);
    redirectAfterLogin(user.role);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Activity size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to HealthOps</h2>
          <p className="text-xs text-slate-500">
            Secure cloud portal for patients, doctors, and system administrators
          </p>
        </div>

        {/* Demo Fast Login Launcher */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
          <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider text-center">
            ⚡ 1-Click Evaluator Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="py-2 px-2 bg-white border border-blue-200 rounded-xl text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition shadow-2xs flex flex-col items-center gap-1"
            >
              <UserCheck size={16} />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="py-2 px-2 bg-white border border-blue-200 rounded-xl text-indigo-700 text-xs font-bold hover:bg-indigo-600 hover:text-white transition shadow-2xs flex flex-col items-center gap-1"
            >
              <Stethoscope size={16} />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-2 bg-white border border-blue-200 rounded-xl text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition shadow-2xs flex flex-col items-center gap-1"
            >
              <ShieldAlert size={16} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@healthops.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>Remember me</span>
              </label>
              <span className="text-[11px] text-slate-400">Protected by JWT</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;