import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  ShieldCheck, 
  Calendar, 
  Users, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  HeartPulse, 
  Server, 
  Stethoscope, 
  Sparkles
} from 'lucide-react';

const Home = () => {
  const { loginAs, isAuthenticated, role } = useAuth();
  const { doctors } = useData();
  const navigate = useNavigate();

  const handleDemoAccess = (demoRole) => {
    loginAs(demoRole);
    if (demoRole === 'patient') navigate('/patient');
    if (demoRole === 'doctor') navigate('/doctor');
    if (demoRole === 'admin') navigate('/admin');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="healthops-grid relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-slate-50 pt-16 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="rise-in lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Sparkles size={14} className="text-blue-600" />
                <span>Next-Gen Healthcare Management & DevSecOps Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Intelligent Care Delivery, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                  Cloud-Native Security.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                HealthOps bridges patients, clinical specialists, and hospital administration on a containerized, 
                audited microservice architecture with automated CI/CD and zero-trust RBAC.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={isAuthenticated ? (role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient/book') : '/register'}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Book an Appointment</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/doctors"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Stethoscope size={18} className="text-blue-600" />
                  <span>Browse Specialists</span>
                </Link>
              </div>

              {/* Quick Persona Demo Launcher Banner */}
              <div className="pt-6 border-t border-slate-200/80">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Instant Evaluator Demo Access (1-Click Login):
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                  <button
                    onClick={() => handleDemoAccess('patient')}
                    className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    <Users size={14} />
                    Launch as Patient
                  </button>
                  <button
                    onClick={() => handleDemoAccess('doctor')}
                    className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition flex items-center gap-1.5"
                  >
                    <Stethoscope size={14} />
                    Launch as Doctor
                  </button>
                  <button
                    onClick={() => handleDemoAccess('admin')}
                    className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition flex items-center gap-1.5"
                  >
                    <Server size={14} />
                    Launch as Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card Mockup */}
            <div className="rise-in rise-in-delay-2 lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl bg-white/95 p-6 shadow-2xl shadow-cyan-900/10 border border-white space-y-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">HealthOps Telehealth</h4>
                        <p className="text-xs text-slate-400">Live Consultation Gateway</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Secure
                    </span>
                  </div>

                  {/* Active Patient Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Confirmed Appointment</span>
                      <span className="font-semibold text-blue-600">Today, 10:30 AM</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">Cardiology Clinical Review</div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>Doctor: Dr. Sarah Alistair, MD</span>
                      <span>•</span>
                      <span>Suite 302</span>
                    </div>
                  </div>

                  {/* DevOps Metrics Mini-Widget */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-900 text-white">
                      <p className="text-[11px] text-slate-400 font-medium">Uptime Guarantee</p>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">99.98%</p>
                      <p className="text-[10px] text-slate-400">Kubernetes High-Availability</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 text-white">
                      <p className="text-[11px] text-slate-400 font-medium">Security Scan</p>
                      <p className="text-lg font-bold text-blue-400 mt-0.5">0 CVEs</p>
                      <p className="text-[10px] text-slate-400">Trivy Container Hardening</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleDemoAccess('patient')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <HeartPulse size={15} className="text-rose-400" />
                      Test Patient Booking Flow
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* KPI Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rise-in rise-in-delay-1 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-md">
          <div className="text-center md:text-left space-y-1">
            <p className="text-3xl font-extrabold text-blue-600">5+</p>
            <p className="text-sm font-bold text-slate-800">Board Specialists</p>
            <p className="text-xs text-slate-500">Cardiology, Neuro, Derm, Ped</p>
          </div>
          <div className="text-center md:text-left space-y-1">
            <p className="text-3xl font-extrabold text-indigo-600">100%</p>
            <p className="text-sm font-bold text-slate-800">RBAC Protected</p>
            <p className="text-xs text-slate-500">JWT and strict authorization</p>
          </div>
          <div className="text-center md:text-left space-y-1">
            <p className="text-3xl font-extrabold text-emerald-600">&lt; 8 min</p>
            <p className="text-sm font-bold text-slate-800">MTTR Recovery</p>
            <p className="text-xs text-slate-500">Automated GitOps healing</p>
          </div>
          <div className="text-center md:text-left space-y-1">
            <p className="text-3xl font-extrabold text-slate-900">Zero Trust</p>
            <p className="text-sm font-bold text-slate-800">Continuous Auditing</p>
            <p className="text-xs text-slate-500">Real-time immutable log trail</p>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Architected for Reliability</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">Complete Care Lifecycle in One Platform</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Engineered with modern engineering principles to ensure zero downtime, clinical accuracy, and patient privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/5 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">For Patients</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore medical specialists, filter by specialty, book convenient appointment slots, track consultation status, and download digital prescriptions.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time appointment scheduling</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Digital medical history & profile</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Consultation notes & prescriptions</li>
            </ul>
          </div>

          {/* Doctor Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-900/5 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">For Doctors</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organize daily consultation schedules, review incoming patient requests, write clinical diagnoses, and manage personal availability slots.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Daily consultation queue</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Accept, reject, or complete requests</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Flexible weekly schedule planner</li>
            </ul>
          </div>

          {/* Admin & DevOps Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/5 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">For Administrators</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive role management, user account status toggling, security audit trails, and live Cloud-Native DevSecOps observability dashboards.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> User and role administration</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Comprehensive immutable audit trail</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Kubernetes & CI/CD telemetry</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Our Medical Specialists</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Consulting Physicians</h3>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>View All Doctors ({doctors.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base">
                    {doctor.name.split(' ')[1]?.slice(0, 2) || 'DR'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                    <p className="text-xs font-medium text-blue-600">{doctor.specialty}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{doctor.bio}</p>
                
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>Fee: <strong className="text-slate-800">${doctor.consultationFee}</strong></span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    ★ {doctor.rating} ({doctor.reviewsCount})
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  to={`/patient/book?doctor=${doctor.id}`}
                  className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <Calendar size={14} />
                  Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;