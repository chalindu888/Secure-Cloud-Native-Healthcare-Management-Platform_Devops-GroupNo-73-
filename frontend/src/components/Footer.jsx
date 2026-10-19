import React from 'react';
import { Activity, MapPin, Phone, Mail, MessageCircle, Globe, Camera, Music2, AtSign, PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto', position: 'relative' }}>
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

            {/* Brand / Hospital Mission & Emergency Hotline */}
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
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f9fafb' }}>HealthOps Hospital</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.8, maxWidth: '260px' }}>
                Dedicated to providing compassionate patient care, medical excellence, and round-the-clock emergency services for our community.
              </p>

              {/* 24/7 Emergency Hotline */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.625rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  maxWidth: '260px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PhoneCall size={16} color="#f87171" />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fca5a5' }}>
                    24/7 Emergency Hotline
                  </div>
                  <a
                    href="tel:+15559112273"
                    style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fee2e2', textDecoration: 'none' }}
                  >
                    +1 (555) 911-CARE
                  </a>
                </div>
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
    </footer>
  );
};

export default Footer;
