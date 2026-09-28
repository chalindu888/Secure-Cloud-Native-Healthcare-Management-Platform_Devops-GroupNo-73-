import React from 'react';
import { Activity, ShieldCheck, GitBranch, CheckCircle2, Server, Globe, Lock } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

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

            {/* DevOps Pipeline */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e5e7eb', marginBottom: '1rem' }}>
                DevOps Pipeline
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  'Continuous Integration (GitHub Actions)',
                  'Dockerized Container Images',
                  'Kubernetes Orchestration',
                  'Infrastructure as Code (Terraform)',
                ].map(item => (
                  <li
                    key={item}
                    style={{ fontSize: '0.78rem', color: '#d1d5db', cursor: 'pointer', transition: 'color 200ms ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Security */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e5e7eb', marginBottom: '1rem' }}>
                Security & Compliance
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  'JWT + Role-Based Access Control (RBAC)',
                  'Trivy Vulnerability Scanner',
                  'SonarQube Code Analysis',
                  'Prometheus & Grafana Telemetry',
                ].map(item => (
                  <li
                    key={item}
                    style={{ fontSize: '0.78rem', color: '#d1d5db', cursor: 'pointer', transition: 'color 200ms ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#6ee7b7'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Academic Details */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e5e7eb', marginBottom: '1rem' }}>
                Academic Project
              </h4>
              <div
                style={{
                  padding: '1rem', borderRadius: '0.875rem',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(165,180,252,0.35)',
                }}
              >
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '0.625rem' }}>
                  DevOps Engineering (EC5207)
                </p>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.75rem' }}>
                  Group No. 73
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <p style={{ fontSize: '0.72rem', color: '#d1d5db' }}>EG/2023/5897 — Silva TCK</p>
                  <p style={{ fontSize: '0.72rem', color: '#d1d5db' }}>EG/2023/5902 — Siriwardena M.K.W.L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              background: 'rgba(20,50,43,0.94)',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(167,243,208,0.18)',
              display: 'flex', flexWrap: 'wrap',
              alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: '#d1fae5' }}>
              © {year} HealthOps Platform. Built with React & Tailwind CSS.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
                background: 'rgba(16,185,129,0.12)', color: '#6ee7b7',
                border: '1px solid rgba(16,185,129,0.25)',
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                ✓ Production Build
              </span>
              <span style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>Version 1.0.0</span>
            </div>
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
