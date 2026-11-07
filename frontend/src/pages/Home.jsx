import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import careImage from '../assets/hospital-care.png';
import { ShieldCheck, Calendar, Users, Activity, CheckCircle2, ArrowRight, Server, Stethoscope, Sparkles, Zap, Globe, Lock, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const { doctors } = useData();
  const navigate = useNavigate();

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
            
            <h1 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", margin: 0 }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '0.35rem',
                  fontSize: 'clamp(1.1rem, 2.4vw, 1.6rem)',
                  fontWeight: 500,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: '#334155',
                }}
              >
                Welcome to
              </span>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(2.75rem, 7vw, 5.25rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 45%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 14px rgba(29, 78, 216, 0.2))',
                }}
              >
                HealthOps Hospital
              </span>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: '5rem',
                  height: '4px',
                  margin: '1.25rem auto 0',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #0284c7, #059669)',
                }}
              />
            </h1>

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
          CARE FOR EVERY FAMILY
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0', paddingBottom: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: '1.25rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--bdr-default)',
            boxShadow: 'var(--shdw-md)',
          }}
        >
          <img
            src={careImage}
            alt="A doctor talking with a patient's family at the bedside"
            style={{
              width: '100%',
              maxWidth: '600px',
              justifySelf: 'center',
              borderRadius: '1rem',
              boxShadow: 'var(--shdw-lg)',
              display: 'block',
            }}
          />
          <div>
            <span className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Compassionate Care</span>
            <h2 className="page-title" style={{ marginBottom: '1rem' }}>Caring for the whole family</h2>
            <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
              Our specialists take the time to listen, explain and support patients and their loved ones at every step of treatment.
            </p>
            <Link to="/doctors" className="btn btn-primary">
              Meet Our Specialists
              <ArrowRight size={18} />
            </Link>
          </div>
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