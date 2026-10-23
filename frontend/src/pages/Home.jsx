import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, Calendar, Users, Activity, CheckCircle2, ArrowRight, Server, Stethoscope, Sparkles, Zap, Globe, Lock, Star, TrendingUp, HeartPulse } from 'lucide-react';
import fibreRushBanner from '../assets/fibre-rush.png';

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
    { value: '5+', label: 'Specialist Doctors', sub: 'Cardiology, neurology, dermatology', color: 'var(--c-primary)' },
    { value: '100%', label: 'Secure Access', sub: 'Role-based, encrypted sign-in', color: 'var(--c-cyan)' },
    { value: '< 8 min', label: 'Service Recovery', sub: 'Automatic self-healing', color: 'var(--c-emerald)' },
    { value: '0', label: 'Known Vulnerabilities', sub: 'Every release security-scanned', color: 'var(--c-amber)' },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'For Patients',
      desc: 'Find the right specialist, book a convenient time, and keep track of every visit.',
      items: ['Online appointment booking', 'Personal health profile', 'Visit notes & prescriptions'],
      color: 'var(--c-primary-light)',
      bg: 'var(--c-primary-pale)',
      border: 'var(--c-primary-border)',
      glow: 'rgba(99,102,241,0.15)',
    },
    {
      icon: Stethoscope,
      title: 'For Doctors',
      desc: 'Manage your patient list, respond to requests, and set your availability.',
      items: ['Daily appointment queue', 'Accept or decline requests', 'Weekly schedule planner'],
      color: 'var(--c-cyan)',
      bg: 'var(--c-cyan-pale)',
      border: 'rgba(8,145,178,0.2)',
      glow: 'rgba(8,145,178,0.15)',
    },
    {
      icon: ShieldCheck,
      title: 'For Administrators',
      desc: 'Manage users and roles, review activity, and monitor system health.',
      items: ['User & role management', 'Complete activity history', 'Live system monitoring'],
      color: 'var(--c-emerald)',
      bg: 'var(--c-emerald-pale)',
      border: 'var(--c-emerald-border)',
      glow: 'rgba(5,150,105,0.15)',
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* ================================================================
          HERO SECTION WITH VIDEO BACKGROUND
      ================================================================ */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Background Video */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              transform: 'translate(-50%, -50%)',
              objectFit: 'cover',
              filter: 'brightness(0.85) contrast(1.05)',
            }}
          >
            <source src="/vedio.mp4" type="video/mp4" />
          </video>
          {/* Theme overlay gradient to ensure high readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(217, 240, 223, 0.72) 0%, rgba(217, 240, 223, 0.82) 60%, var(--bg-page, #d9f0df) 100%)',
              backdropFilter: 'blur(1px)',
            }}
          />
        </div>

        <div className="page-wrapper" style={{ padding: 0, position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-up" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#047857',
                }}
              >
                <HeartPulse size={15} style={{ color: '#ef4444' }} />
                Leading Multi-Specialty Hospital & Medical Center
              </span>
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.5rem',
                  color: '#0f172a',
                }}
              >
                Caring for Your Health,<br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 40%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    filter: 'drop-shadow(0 2px 14px rgba(29, 78, 216, 0.2))',
                  }}
                >
                  Inspiring Better Living.
                </span>
              </h1>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
                  color: '#334155',
                  lineHeight: 1.8,
                  maxWidth: '700px',
                  margin: '0 auto',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                HealthOps Hospital provides comprehensive patient care, board-certified specialists, modern medical treatments, and 24/7 emergency response — bringing compassionate care and clinical excellence to you and your family.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
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
            <div style={{ padding: '1.25rem 1.75rem', borderRadius: '1rem', background: 'var(--bg-card)', border: '1px solid var(--bdr-default)', boxShadow: 'var(--shdw-md)', backdropFilter: 'blur(8px)', width: '100%', maxWidth: '620px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Zap size={14} style={{ color: 'var(--c-amber)' }} />
                ⚡ Instant Demo Access — 1-Click Role Login
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
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
        </div>
      </section>

      {/* ================================================================
          STATS SECTION
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingBottom: '3rem' }}>
        <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, color: stat.color, marginBottom: '0.5rem' }}>{stat.value}</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt-primary)', marginBottom: '0.2rem' }}>{stat.label}</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--txt-muted)', lineHeight: 1.5 }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CORE PLATFORM PILLARS
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-primary)' }}>Who It's For</span>
          <h2 className="page-title" style={{ fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '1rem' }}>One Platform for Every Role</h2>
          <p className="page-subtitle" style={{ fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
            Secure, reliable care management for patients, doctors, and hospital staff.
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--txt-primary)', marginBottom: '0.6rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>{f.desc}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', listStyle: 'none', paddingTop: '1.25rem', borderTop: '1px solid var(--bdr-default)' }}>
                  {f.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--txt-primary)' }}>
                      <CheckCircle2 size={17} style={{ color: f.color, flexShrink: 0 }} />
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
          FEATURED BANNER
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0', paddingBottom: '2.5rem' }}>
        <div
          style={{
            borderRadius: '1.25rem',
            overflow: 'hidden',
            boxShadow: 'var(--shdw-lg)',
            border: '1px solid var(--bdr-default)',
            background: '#041740',
            maxWidth: '100%',
          }}
        >
          <img
            src={fibreRushBanner}
            alt="Featured Banner"
            style={{
              width: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              display: 'block',
              margin: '0 auto',
            }}
          />
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