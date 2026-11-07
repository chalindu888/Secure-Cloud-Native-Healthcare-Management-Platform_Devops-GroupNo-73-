import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSitePage } from '../data/sitePages';
import Reveal from '../components/Reveal';
import { ArrowLeft, ArrowRight, CheckCircle2, Info } from 'lucide-react';

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
};
const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #ffffff',
  borderRadius: '1.1rem',
  boxShadow: 'var(--shdw-md)',
};

const ActionButton = ({ action, primary }) => {
  const className = `btn ${primary ? 'btn-primary' : 'btn-secondary'}`;
  const content = <>{action.label} <ArrowRight size={18} /></>;
  return action.href
    ? <a href={action.href} className={className}>{content}</a>
    : <Link to={action.to} className={className}>{content}</Link>;
};

const SitePage = ({ page }) => {
  const content = getSitePage(page);
  const [activeId, setActiveId] = useState(content?.sections[0]?.id);

  // Highlight the section being read in the contents list
  useEffect(() => {
    if (!content || !('IntersectionObserver' in window)) return undefined;
    setActiveId(content.sections[0].id);
    const targets = content.sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [content]);

  if (!content) return null;
  const Icon = content.icon;

  return (
    <div className="page-wrapper" style={{ maxWidth: '72rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)' }}>
        <ArrowLeft size={16} /> Home
      </Link>

      <header
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', padding: 'clamp(1.25rem, 3vw, 2rem)',
          marginBottom: '2.5rem', borderRadius: '1.25rem', color: '#ffffff',
          background: 'linear-gradient(160deg, #8c9ad2 0%, #6573b8 100%)', boxShadow: '0 16px 40px rgba(88, 103, 170, 0.3)',
        }}
      >
        <div style={{ width: '5rem', height: '5rem', borderRadius: '1.25rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)' }}>
          <Icon size={42} strokeWidth={1.4} aria-hidden="true" />
        </div>
        <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
          <p style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>{content.eyebrow}</p>
          <h1 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff' }}>{content.title}</h1>
          <p style={{ marginTop: '0.6rem', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.92 }}>{content.tagline}</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '3rem' }}>
        <nav aria-label="On this page" className="centre-toc" style={{ flex: '0 0 14rem', position: 'sticky', top: '6.5rem', alignSelf: 'flex-start' }}>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt-muted)' }}>On this page</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '2px solid var(--bdr-default)' }}>
            {content.sections.map((section) => {
              const active = activeId === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'block', padding: '0.45rem 0.9rem', marginLeft: '-2px', fontSize: '0.92rem', fontWeight: active ? 800 : 600,
                      color: active ? ACCENT : 'var(--txt-secondary)', borderLeft: `2px solid ${active ? ACCENT : 'transparent'}`,
                    }}
                  >
                    {section.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <article style={{ flex: '1 1 30rem', minWidth: 0, maxWidth: '46rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {content.sections.map((section) => (
            <Reveal as="section" key={section.id}>
              <h2 id={section.id} style={sectionTitle}>{section.title}</h2>

              {section.paragraphs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: (section.list || section.cards || section.contacts) ? '1.25rem' : 0 }}>
                  {section.paragraphs.map((text) => <p key={text.slice(0, 30)} style={bodyText}>{text}</p>)}
                </div>
              )}

              {section.list && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {section.list.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', ...bodyText, lineHeight: 1.65 }}>
                      <CheckCircle2 size={20} style={{ marginTop: '0.2rem', flexShrink: 0, color: 'var(--c-emerald)' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.steps && (
                <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {section.steps.map((step, i) => (
                    <li key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{ width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', background: ACCENT }}>{i + 1}</span>
                      <p style={{ ...bodyText, lineHeight: 1.7, paddingTop: '0.1rem' }}>{step}</p>
                    </li>
                  ))}
                </ol>
              )}

              {section.cards && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '1rem' }}>
                  {section.cards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div key={card.title} style={{ ...cardStyle, padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <span style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: 'linear-gradient(160deg, #8c9ad2 0%, #7585c3 100%)' }}>
                          <CardIcon size={22} />
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--txt-primary)' }}>{card.title}</h3>
                        <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--txt-secondary)' }}>{card.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {section.contacts && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '1rem' }}>
                  {section.contacts.map((contact) => {
                    const ContactIcon = contact.icon;
                    const inner = (
                      <>
                        <span style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.85rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: contact.urgent ? 'linear-gradient(160deg, #ef4444, #dc2626)' : 'linear-gradient(160deg, #8c9ad2 0%, #7585c3 100%)' }}>
                          <ContactIcon size={22} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--txt-muted)' }}>{contact.label}</span>
                          <span style={{ display: 'block', marginTop: '0.15rem', fontSize: '1rem', fontWeight: 700, color: contact.urgent ? '#b91c1c' : 'var(--txt-primary)', overflowWrap: 'anywhere' }}>{contact.value}</span>
                        </span>
                      </>
                    );
                    const style = { ...cardStyle, padding: '1.1rem 1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', ...(contact.urgent ? { border: '1px solid rgba(239,68,68,0.35)' } : {}) };
                    return contact.href
                      ? <a key={contact.label} href={contact.href} style={style}>{inner}</a>
                      : <div key={contact.label} style={style}>{inner}</div>;
                  })}
                </div>
              )}

              {section.news && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {section.news.map((item) => (
                    <div key={item.title} style={{ ...cardStyle, padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-block', marginBottom: '0.6rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4f46e5', background: 'var(--c-primary-pale)' }}>{item.tag}</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.35rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--txt-secondary)' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.empty && (
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', padding: '1.1rem 1.3rem', borderRadius: '1rem', fontSize: '0.98rem', lineHeight: 1.7, color: 'var(--txt-secondary)', background: 'rgba(255,255,255,0.6)', border: '1px dashed var(--bdr-emphasis)' }}>
                  <Info size={19} style={{ marginTop: '0.2rem', flexShrink: 0, color: ACCENT }} />
                  {section.empty}
                </p>
              )}

              {section.actions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
                  {section.actions.map((action, i) => <ActionButton key={action.label} action={action} primary={i === 0} />)}
                </div>
              )}
            </Reveal>
          ))}
        </article>
      </div>
    </div>
  );
};

export default SitePage;
