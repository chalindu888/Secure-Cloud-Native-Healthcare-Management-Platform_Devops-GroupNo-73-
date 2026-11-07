import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import careImage from '../assets/hospital-care.png';
import careTeamImage from '../assets/care-team.png';
import Reveal from '../components/Reveal';
import { centres } from '../data/centres';
import emergencyIcon from '../assets/service-emergency.png';
import opdIcon from '../assets/service-opd.png';
import indoorIcon from '../assets/service-indoor.png';
import roomsIcon from '../assets/service-rooms.png';
import { ArrowRight, Stethoscope } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const { doctors } = useData();
  const navigate = useNavigate();

  // Tilt a card toward the pointer (the CSS turns --rx / --ry into a slight 3D rotation)
  const tiltCard = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
  };

  const resetCardTilt = (e) => {
    e.currentTarget.style.removeProperty('--rx');
    e.currentTarget.style.removeProperty('--ry');
  };

  const hospitalServices = [
    {
      image: emergencyIcon,
      title: 'Emergency Care',
      desc: 'Experienced doctors, an ICU unit and senior nurses work together as one emergency team, ready to handle any emergency at any hour.',
    },
    {
      image: opdIcon,
      title: 'OPD Services',
      desc: 'Our medical team is available around the clock for common ailments and minor injuries, so you receive quality care from the very first visit.',
    },
    {
      image: indoorIcon,
      title: 'Indoor Care',
      desc: 'Our patient-centred inpatient care keeps you comfortable and safe throughout your stay, so you can focus on recovering well.',
    },
    {
      image: roomsIcon,
      title: 'Room Facilities',
      desc: 'Choose from AC or non-AC private rooms and shared ward rooms, with extras such as satellite TV, hot water and healthy meals.',
    },
  ];

  return (
    <div style={{ position: 'relative', overflowX: 'clip' }}>
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
          CARE TEAM PHOTO
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingBottom: '3rem' }}>
        <Reveal
          direction="zoom"
          style={{
            maxWidth: '52rem',
            margin: '0 auto',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            border: '6px solid #ffffff',
            boxShadow: 'var(--shdw-lg)',
            background: '#ffffff',
          }}
        >
          <img
            src={careTeamImage}
            alt="A doctor and a nurse caring for an elderly patient at her bedside"
            style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }}
          />
        </Reveal>
      </section>

      {/* ================================================================
          HOSPITAL SERVICES
      ================================================================ */}
      <section id="services" className="page-wrapper" style={{ paddingTop: '0', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Reveal as="span" className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>What We Offer</Reveal>
          <Reveal as="h2" delay={120} className="page-title" style={{ marginBottom: '1rem' }}>Our Hospital Services</Reveal>
          <Reveal as="p" delay={240} className="page-subtitle" style={{ maxWidth: '560px', margin: '0 auto' }}>
            From urgent care to a comfortable recovery, everything you need is under one roof.
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {hospitalServices.map((service, i) => (
              <Reveal key={service.title} delay={i * 130} style={{ display: 'flex' }}>
              <div
                className="card service-card"
                onMouseMove={tiltCard}
                onMouseLeave={resetCardTilt}
                style={{
                  flex: 1,
                  padding: '2.25rem 1.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ height: '8.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <img
                    className="service-icon"
                    src={service.image}
                    alt=""
                    style={{ maxHeight: '100%', maxWidth: '75%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <h3 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#1e3a5f', marginBottom: '0.75rem' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--txt-secondary)', lineHeight: 1.75 }}>{service.desc}</p>
              </div>
              </Reveal>
          ))}
        </div>
      </section>

      {/* ================================================================
          CENTRES OF EXCELLENCE
      ================================================================ */}
      <section id="centres" className="page-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Reveal as="span" className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Specialised Care</Reveal>
          <Reveal as="h2" delay={120} className="page-title" style={{ marginBottom: '1rem' }}>Our Centres of Excellence</Reveal>
          <Reveal as="p" delay={240} className="page-subtitle" style={{ maxWidth: '560px', margin: '0 auto' }}>
            Dedicated clinics and units with experienced teams for every stage of life.
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(max(220px, calc(25% - 1rem)), 1fr))', gap: '1.25rem' }}>
          {centres.map((centre, i) => {
            const Icon = centre.icon;
            return (
              <Reveal key={centre.label} delay={(i % 4) * 110} style={{ display: 'flex' }}>
                <Link
                  to={`/centres/${centre.slug}`}
                  className="centre-tile"
                  aria-label={`${centre.label}: read more`}
                  style={{
                    flex: 1,
                    minHeight: '11.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '1.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    background: 'linear-gradient(160deg, #8c9ad2 0%, #7585c3 100%)',
                    boxShadow: '0 10px 24px rgba(88, 103, 170, 0.28)',
                  }}
                >
                  <Icon size={52} strokeWidth={1.25} aria-hidden="true" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {centre.label}
                  </span>
                  <span className="centre-tile-more" aria-hidden="true">
                    Learn more <ArrowRight size={14} />
                  </span>
                </Link>
              </Reveal>
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
          <Reveal direction="left" style={{ width: '100%', maxWidth: '600px', justifySelf: 'center' }}>
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
          </Reveal>
          <Reveal direction="right" delay={150}>
            <span className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Compassionate Care</span>
            <h2 className="page-title" style={{ marginBottom: '1rem' }}>Caring for the whole family</h2>
            <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
              Our specialists take the time to listen, explain and support patients and their loved ones at every step of treatment.
            </p>
            <Link to="/doctors" className="btn btn-primary">
              Meet Our Specialists
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================================================================
          LOCATION MAP
      ================================================================ */}
      <section id="location" className="page-wrapper" style={{ paddingTop: '0', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Reveal as="span" className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Find Us</Reveal>
          <Reveal as="h2" delay={120} className="page-title" style={{ marginBottom: '1rem' }}>Our Location</Reveal>
          <Reveal as="p" delay={240} className="page-subtitle" style={{ maxWidth: '560px', margin: '0 auto' }}>
            No: 44, Main Road, Ambalangoda
          </Reveal>
        </div>
        <Reveal direction="zoom" style={{ overflow: 'hidden', borderRadius: '1.25rem', background: 'var(--bg-card)', border: '1px solid #ffffff', boxShadow: 'var(--shdw-md)' }}>
          <iframe
            title="HealthOps Hospital location map"
            src="https://maps.google.com/maps?q=6.236682,80.054824&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ display: 'block', width: '100%', height: '24rem', border: 0 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem 1.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt-primary)' }}>HealthOps Hospital, Ambalangoda</span>
            <a href="https://goo.gl/maps/A3SxWN9PzcogqbtS7?g_st=awb" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Get Directions <ArrowRight size={18} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ================================================================
          CTA SECTION
      ================================================================ */}
      <section className="page-wrapper" style={{ paddingTop: '0' }}>
        <Reveal direction="zoom" style={{ padding: '4rem 2rem', borderRadius: 'var(--r-2xl)', textAlign: 'center', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)', boxShadow: 'var(--shdw-md)' }}>
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
        </Reveal>
      </section>
    </div>
  );
};

export default Home;