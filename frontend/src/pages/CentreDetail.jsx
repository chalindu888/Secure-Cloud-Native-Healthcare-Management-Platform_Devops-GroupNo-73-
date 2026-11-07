import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { centres, getCentre } from '../data/centres';
import Reveal from '../components/Reveal';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Stethoscope, Info } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.

const ACCENT = '#6f7fc2';

const bodyText = { fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--txt-secondary)' };
const sectionTitle = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
  fontSize: 'clamp(1.35rem, 2.6vw, 1.7rem)',
  fontWeight: 800,
  color: 'var(--txt-primary)',
  marginBottom: '1.1rem',
  scrollMarginTop: '7rem',
};

const CentreDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated, role } = useAuth();
  const centre = getCentre(slug);

  const [activeId, setActiveId] = useState('overview');

  // Open every centre page at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveId('overview');
  }, [slug]);

  // Highlight the section being read in the contents list
  useEffect(() => {
    if (!centre || !('IntersectionObserver' in window)) return undefined;
    const sections = ['overview', 'offer', 'expect', 'seek'].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [centre]);

  if (!centre) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Centre not found</h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>We could not find that centre.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    );
  }

  const Icon = centre.icon;
  const index = centres.findIndex((c) => c.slug === centre.slug);
  const previous = centres[(index - 1 + centres.length) % centres.length];
  const next = centres[(index + 1) % centres.length];
  const bookTo = isAuthenticated
    ? (role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient/book')
    : '/register';

  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'offer', label: 'What we offer' },
    { id: 'expect', label: 'What to expect' },
    { id: 'seek', label: centre.seekTitle || 'When to seek care' },
  ];

  return (
    <div className="page-wrapper" style={{ maxWidth: '72rem' }}>
      <Link
        to="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)' }}
      >
        <ArrowLeft size={16} /> All centres
      </Link>

      {/* Title block */}
      <header
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', padding: 'clamp(1.25rem, 3vw, 2rem)',
          marginBottom: '2.5rem', borderRadius: '1.25rem', color: '#ffffff',
          background: 'linear-gradient(160deg, #8c9ad2 0%, #6573b8 100%)', boxShadow: '0 16px 40px rgba(88, 103, 170, 0.3)',
        }}
      >
        <div
          style={{
            width: '5rem', height: '5rem', borderRadius: '1.25rem', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)',
          }}
        >
          <Icon size={44} strokeWidth={1.4} aria-hidden="true" />
        </div>
        <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
          <p style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>
            Centre of Excellence
          </p>
          <h1 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', overflowWrap: 'anywhere' }}>
            {centre.label}
          </h1>
          <p style={{ marginTop: '0.6rem', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.92 }}>{centre.tagline}</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '3rem' }}>
        {/* Contents */}
        <nav
          aria-label="On this page"
          style={{ flex: '0 0 14rem', position: 'sticky', top: '6.5rem', alignSelf: 'flex-start' }}
          className="centre-toc"
        >
          <p style={{ marginBottom: '0.75rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt-muted)' }}>
            On this page
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '2px solid var(--bdr-default)' }}>
            {toc.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'block', padding: '0.45rem 0.9rem', marginLeft: '-2px', fontSize: '0.92rem', fontWeight: active ? 800 : 600,
                      color: active ? ACCENT : 'var(--txt-secondary)', borderLeft: `2px solid ${active ? ACCENT : 'transparent'}`,
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Article */}
        <article style={{ flex: '1 1 30rem', minWidth: 0, maxWidth: '46rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <Reveal as="section">
            <h2 id="overview" style={sectionTitle}>Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {centre.overview.map((paragraph) => <p key={paragraph.slice(0, 24)} style={bodyText}>{paragraph}</p>)}
            </div>
          </Reveal>

          <Reveal as="section">
            <h2 id="offer" style={sectionTitle}>What we offer</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {centre.services.map((service) => (
                <li key={service} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', ...bodyText, lineHeight: 1.65 }}>
                  <CheckCircle2 size={20} style={{ marginTop: '0.2rem', flexShrink: 0, color: 'var(--c-emerald)' }} />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section">
            <h2 id="expect" style={sectionTitle}>What to expect</h2>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {centre.expect.map((step, i) => (
                <li key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span
                    style={{
                      width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', background: ACCENT,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p style={{ ...bodyText, lineHeight: 1.7, paddingTop: '0.1rem' }}>{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal as="section">
            <h2 id="seek" style={sectionTitle}>{centre.seekTitle || 'When to seek care'}</h2>
            <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)' }}>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {centre.seek.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1rem', lineHeight: 1.65, color: '#78350f' }}>
                    <AlertTriangle size={19} style={{ marginTop: '0.2rem', flexShrink: 0, color: '#d97706' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--txt-muted)' }}>
            <Info size={17} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            This page gives general information and is not a substitute for advice from your own doctor. In an emergency, call your local emergency number or go to the nearest emergency department straight away.
          </p>

          {/* Call to action */}
          <Reveal
            direction="zoom"
            style={{ padding: '2rem', borderRadius: '1.25rem', textAlign: 'center', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)' }}
          >
            <h2 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.5rem' }}>
              Ready to see a specialist?
            </h2>
            <p style={{ ...bodyText, fontSize: '1rem', marginBottom: '1.5rem' }}>
              Book an appointment, or browse our doctors to find the right one for you.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
              <Link to={bookTo} className="btn btn-primary">
                Book an Appointment <ArrowRight size={18} />
              </Link>
              <Link to="/doctors" className="btn btn-secondary">
                <Stethoscope size={18} /> Find a Doctor
              </Link>
            </div>
          </Reveal>

          {/* Previous / next */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
            {[{ c: previous, dir: 'Previous', arrow: <ArrowLeft size={16} /> }, { c: next, dir: 'Next', arrow: <ArrowRight size={16} /> }].map(({ c, dir, arrow }) => (
              <Link
                key={dir}
                to={`/centres/${c.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem 1.25rem', borderRadius: '1rem',
                  textAlign: dir === 'Next' ? 'right' : 'left', alignItems: dir === 'Next' ? 'flex-end' : 'flex-start',
                  background: 'var(--bg-card)', border: '1px solid #ffffff', boxShadow: 'var(--shdw-sm)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--txt-muted)' }}>
                  {dir === 'Previous' && arrow} {dir} {dir === 'Next' && arrow}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default CentreDetail;
