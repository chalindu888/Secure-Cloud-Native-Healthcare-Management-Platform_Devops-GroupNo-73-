import React from 'react';
import { Activity, ShieldCheck, GitBranch, CheckCircle2, MapPin, Phone, Mail, MessageCircle, Globe, Camera, Music2, AtSign } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto', position: 'relative' }}>
      {/* DevSecOps Status Bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.625rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '88rem', margin: '0 auto',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: '0.75rem',
          }}
        >
          {/* Live Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#10b981', opacity: 0.75,
                  animation: 'ping 1.5s ease-in-out infinite',
                }} />
                <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </span>
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>
              Cluster Status:{' '}
              <span style={{ color: '#6ee7b7', fontWeight: 700 }}>All Pods Healthy (3/3)</span>
            </span>
          </div>

          {/* Tech Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { icon: ShieldCheck, label: 'Trivy Scan', value: '0 Critical', valueColor: '#6ee7b7', iconColor: '#818cf8' },
              { icon: CheckCircle2, label: 'Quality Gate', value: 'Passed (A)', valueColor: '#6ee7b7', iconColor: '#6ee7b7' },
              { icon: GitBranch, label: 'GitOps', value: 'Argo CD Synced', valueColor: '#a5b4fc', iconColor: '#818cf8' },
            ].map(({ icon: Icon, label, value, valueColor, iconColor }, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                <Icon size={13} style={{ color: iconColor }} />
                {label}: <strong style={{ color: valueColor }}>{value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div
        style={{
          background: 'rgba(55,65,81,0.96)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: '88rem', margin: '0 auto',
            padding: '3.5rem 1.5rem 2rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

            {/* Brand */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px', height: '36px', borderRadius: '0.625rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                  }}
                >
                  <Activity size={18} color="white" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f9fafb' }}>HealthOps</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.8, maxWidth: '240px' }}>
                Secure Cloud-Native Healthcare Management Platform with Automated DevSecOps, Role-Based Access Control, and Continuous Observability.
              </p>
              {/* Tech Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1rem' }}>
                {['React', 'Docker', 'K8s', 'ArgoCD'].map(tech => (
                  <span key={tech} style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                    borderRadius: '0.375rem', background: 'rgba(99,102,241,0.15)',
                    color: '#c7d2fe', border: '1px solid rgba(165,180,252,0.35)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Hospital Contact Details */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e5e7eb', marginBottom: '1rem' }}>
                Contact HealthOps
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.5 }}>
                  <MapPin size={15} style={{ color: '#a5b4fc', flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>42 Health Street, Boston, MA 02108</span>
                </div>
                <a href="tel:+15552345678" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#d1d5db', textDecoration: 'none' }}>
                  <Phone size={15} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                  +1 (555) 234-5678
                </a>
                <a href="mailto:care@healthops.health" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#d1d5db', textDecoration: 'none' }}>
                  <Mail size={15} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                  care@healthops.health
                </a>
                <a href="https://wa.me/15552345678" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#d1d5db', textDecoration: 'none' }}>
                  <MessageCircle size={15} style={{ color: '#6ee7b7', flexShrink: 0 }} />
                  WhatsApp: +1 (555) 234-5678
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e5e7eb', marginBottom: '1rem' }}>
                Follow HealthOps
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  ['Facebook', 'https://facebook.com/healthops', Globe],
                  ['Instagram', 'https://instagram.com/healthops', Camera],
                  ['TikTok', 'https://tiktok.com/@healthops', Music2],
                  ['Twitter / X', 'https://twitter.com/healthops', AtSign],
                ].map(([label, url, Icon]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.78rem', color: '#d1d5db', textDecoration: 'none' }}>
                    <Icon size={16} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              background: 'rgba(20,50,43,0.94)',
              padding: '1.25rem 0 0.25rem',
              borderTop: '1px solid rgba(167,243,208,0.18)',
            }}
          >
            <p style={{ maxWidth: '62rem', margin: '0 auto', fontSize: '0.78rem', color: '#d1fae5', lineHeight: 1.7, textAlign: 'center' }}>
              HealthOps Hospital provides connected, patient-centered healthcare services that bring patients, doctors, and hospital teams together for safer appointments, trusted medical support, and continuous care.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
