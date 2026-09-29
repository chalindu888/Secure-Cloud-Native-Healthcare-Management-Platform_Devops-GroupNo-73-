import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, Calendar, Users, Activity, CheckCircle2, ArrowRight, HeartPulse, Server, Stethoscope, Sparkles, Zap, Globe, Lock, Star, TrendingUp } from 'lucide-react';

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

  const stats = [
    { value: '5+', label: 'Board Specialists', sub: 'Cardiology, Neuro, Derm', color: 'var(--c-primary)' },
    { value: '100%', label: 'RBAC Protected', sub: 'JWT zero-trust auth', color: 'var(--c-cyan)' },
    { value: '< 8 min', label: 'MTTR Recovery', sub: 'Automated GitOps healing', color: 'var(--c-emerald)' },
    { value: '0 CVEs', label: 'Security Hardened', sub: 'Trivy container scanning', color: 'var(--c-amber)' },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'For Patients',
      desc: 'Explore specialists, filter by specialty, book convenient appointment slots, track consultation status, and manage your health journey.',
      items: ['Real-time appointment scheduling', 'Digital medical history & profile', 'Consultation notes & prescriptions'],
      color: 'var(--c-primary-light)',
      bg: 'var(--c-primary-pale)',
      border: 'var(--c-primary-border)',
      glow: 'rgba(99,102,241,0.15)',
    },
    {
      icon: Stethoscope,
      title: 'For Doctors',
      desc: 'Organize daily consultation schedules, review incoming patient requests, write clinical diagnoses, and manage your availability.',
      items: ['Daily consultation queue', 'Accept, reject, or complete requests', 'Flexible weekly schedule planner'],
      color: 'var(--c-cyan)',
      bg: 'var(--c-cyan-pale)',
      border: 'rgba(8,145,178,0.2)',
      glow: 'rgba(8,145,178,0.15)',
    },
    {
      icon: ShieldCheck,
      title: 'For Administrators',
      desc: 'Comprehensive role management, user account control, security audit trails, and live Cloud-Native DevSecOps observability dashboards.',
      items: ['User and role administration', 'Immutable audit trail logs', 'Kubernetes & CI/CD telemetry'],
      color: 'var(--c-emerald)',
      bg: 'var(--c-emerald-pale)',
      border: 'var(--c-emerald-border)',
      glow: 'rgba(5,150,105,0.15)',
    },
  ];

  const techPillars = [
    { icon: Server, label: 'Kubernetes', sub: 'High Availability' },
    { icon: Lock, label: 'Zero Trust', sub: 'JWT RBAC' },
    { icon: Globe, label: 'CI/CD', sub: 'GitHub Actions' },
    { icon: Activity, label: 'Monitoring', sub: 'Prometheus' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <div className="page-wrapper" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left: Text Content */}
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <span className="badge badge-primary">
                  <Sparkles size={12} />
                  Next-Gen Healthcare DevSecOps Platform
                </span>
              </div>

              <div>
                <h1 className="page-title" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                  Intelligent Care<br />
                  Delivery, <span style={{ color: 'var(--c-primary)' }}>Cloud-Native</span><br />
                  Security.
                </h1>

                <p className="page-subtitle" style={{ fontSize: '1.1rem', maxWidth: '520px' }}>
                  HealthOps bridges patients, clinical specialists, and hospital administration on a
                  containerized, audited microservice architecture with automated CI/CD and zero-trust RBAC.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link to={isAuthenticated ? (role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient/book') : '/register'} className="btn btn-primary btn-lg">
                  Book an Appointment
                  <ArrowRight size={18} />
                </Link>
                <Link to="/doctors" className="btn btn-secondary btn-lg">
                  <Stethoscope size={18} />
                  Browse Specialists
                </Link>
              </div>

              {/* Demo Launch Banner */}
              <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'var(--bg-card)', border: '1px solid var(--bdr-default)', boxShadow: 'var(--shdw-sm)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={14} style={{ color: 'var(--c-amber)' }} />
                  ⚡ Instant Demo Access — 1-Click Role Login
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button onClick={() => handleDemoAccess('patient')} className="btn btn-sm" style={{ background: 'var(--c-primary-pale)', color: 'var(--c-primary)' }}>
                    <Users size={14} /> Launch as Patient
                  </button>
                  <button onClick={() => handleDemoAccess('doctor')} className="btn btn-sm" style={{ background: 'var(--c-cyan-pale)', color: 'var(--c-cyan)' }}>
                    <Stethoscope size={14} /> Launch as Doctor
                  </button>
                  <button onClick={() => handleDemoAccess('admin')} className="btn btn-sm" style={{ background: 'var(--c-emerald-pale)', color: 'var(--c-emerald)' }}>
                    <Server size={14} /> Launch as Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Mockup Card */}
            <div className="animate-fade-up-2 animate-float" style={{ maxWidth: '480px', margin: '0 auto' }}>
              <div className="card-strong" style={{ padding: '1.75rem', position: 'relative' }}>
                
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bdr-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shdw-sm)' }}>
                      <Activity size={20} color="white" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-primary)' }}>HealthOps Telehealth</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--txt-muted)' }}>Live Consultation Gateway</p>
                    </div>
                  </div>
                  <span className="badge badge-success">
                    <span className="badge-dot animate-pulse"></span> Verified Secure
                  </span>
                </div>

                {/* Appointment Card */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--bdr-subtle)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Confirmed Appointment</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--c-primary)', fontWeight: 700 }}>Today, 10:30 AM</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)', marginBottom: '0.375rem' }}>Cardiology Clinical Review</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--txt-secondary)' }}>Dr. Sarah Alistair, MD — Suite 302</p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--txt-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Uptime Guarantee</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-primary)' }}>99.98%</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--txt-muted)' }}>Kubernetes HA</p>
                  </div>
                  <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--c-cyan-pale)', border: '1px solid rgba(8,145,178,0.2)' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--txt-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Security Scan</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-cyan)' }}>0 CVEs</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--txt-muted)' }}>Trivy Hardening</p>
                  </div>
                </div>

                <button onClick={() => handleDemoAccess('patient')} className="btn btn-primary w-full" style={{ fontSize: '0.8rem' }}>
                  <HeartPulse size={15} style={{ color: '#fca5a5' }} /> Test Patient Booking Flow <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATS SECTION
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingBottom: '3rem' }}>
        <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: stat.color, marginBottom: '0.25rem' }}>{stat.value}</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)', marginBottom: '0.25rem' }}>{stat.label}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--txt-secondary)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CORE PLATFORM PILLARS
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Architected for Reliability</span>
          <h2 className="page-title" style={{ marginBottom: '1rem' }}>Complete Care Lifecycle</h2>
          <p className="page-subtitle" style={{ maxWidth: '560px', margin: '0 auto' }}>
            Engineered with modern DevSecOps principles to ensure zero downtime, clinical accuracy, and patient privacy at scale.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card animate-fade-up" style={{ padding: '2rem', animationDelay: `${i * 100}ms` }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--r-md)', background: f.bg, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={24} style={{ color: f.color }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{f.desc}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {f.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                      <CheckCircle2 size={15} style={{ color: f.color, flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          TECH PILLARS STRIP
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.75rem 2rem', borderRadius: 'var(--r-xl)', background: 'var(--bg-card)', border: '1px solid var(--bdr-default)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-muted)', marginRight: '0.5rem' }}>Powered by:</p>
          {techPillars.map((tp, i) => {
            const TIcon = tp.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--bdr-subtle)' }}>
                <TIcon size={16} style={{ color: 'var(--c-primary)' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-primary)' }}>{tp.label}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>{tp.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          CTA SECTION
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ padding: '4rem 2rem', borderRadius: 'var(--r-2xl)', textAlign: 'center', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)', boxShadow: 'var(--shdw-md)' }}>
          <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>Ready to Transform Healthcare?</span>
          <h2 className="page-title" style={{ marginBottom: '1.25rem' }}>Start Your Journey Today</h2>
          <p className="page-subtitle" style={{ maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Join HealthOps and experience the future of healthcare management — secure, intelligent, and cloud-native.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <Link to="/doctors" className="btn btn-secondary btn-lg">
              View Our Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;