import React, { useState } from 'react';
import { Server, GitBranch, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

const PIPELINE_STEPS = [
  { stage: 'Code Checkout & Cache', tool: 'GitHub Actions', status: 'Success', duration: '14s' },
  { stage: 'Automated Tests', tool: 'Jest & Supertest', status: 'Passed (42/42)', duration: '32s' },
  { stage: 'Security Analysis', tool: 'SonarQube', status: 'Passed (Grade A)', duration: '48s' },
  { stage: 'Docker Container Build', tool: 'Docker Buildx', status: 'Built v1.0.4', duration: '1m 12s' },
  { stage: 'CVE Vulnerability Scan', tool: 'Trivy Scanner', status: '0 Critical', duration: '28s' },
  { stage: 'GitOps Deployment', tool: 'Argo CD Sync', status: 'Synced & Healthy', duration: '19s' },
];

const DevOpsHealth = () => {
  const [isHealing, setIsHealing] = useState(false);
  const [pods, setPods] = useState([
    { name: 'healthops-frontend-79b8f4-2zqk7', status: 'Running', restarts: 0, cpu: '14m', memory: '48Mi', age: '3d 4h' },
    { name: 'healthops-backend-5d6cb9-m4l9x', status: 'Running', restarts: 1, cpu: '38m', memory: '132Mi', age: '3d 4h' },
    { name: 'postgres-statefulset-0', status: 'Running', restarts: 0, cpu: '22m', memory: '240Mi', age: '14d' },
    { name: 'argocd-server-6789f89-k9x11', status: 'Running', restarts: 0, cpu: '18m', memory: '95Mi', age: '14d' },
  ]);

  const simulatePodFailure = () => {
    setIsHealing(true);
    setPods(prev => prev.map(p => p.name.includes('backend') ? { ...p, status: 'CrashLoopBackOff', restarts: p.restarts + 1 } : p));
    setTimeout(() => {
      setPods(prev => prev.map(p => p.name.includes('backend') ? { ...p, status: 'Running', restarts: p.restarts } : p));
      setIsHealing(false);
    }, 2500);
  };

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <div className="badge badge-success" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            <Server size={11} />
            EC5207 DevOps Engineering • Group 73
          </div>
          <h1 className="page-title">Cloud-Native Observability</h1>
          <p className="page-subtitle" style={{ maxWidth: '600px' }}>
            Automated delivery pipeline, Kubernetes cluster health, container vulnerability scans, and MTTR telemetry.
          </p>
        </div>

        <button
          onClick={simulatePodFailure}
          disabled={isHealing}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1rem' }}
        >
          <RefreshCw size={15} className={isHealing ? 'animate-spin' : ''} style={{ color: isHealing ? 'var(--c-emerald)' : 'var(--txt-secondary)' }} />
          {isHealing ? 'Self-Healing...' : 'Simulate Failure'}
        </button>
      </div>

      {/* DORA Metrics Row */}
      <div
        className="animate-fade-up-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)' }}>
            <span>Uptime</span>
            <span style={{ color: 'var(--c-emerald)' }}>99.98%</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0f6fc' }}>SLA Met</div>
          <p style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>High-Availability Probe</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)' }}>
            <span>MTTR</span>
            <span style={{ color: 'var(--c-primary-light)' }}>&lt; 8 mins</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0f6fc' }}>7.8 min</div>
          <p style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>Automated Rollbacks</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)' }}>
            <span>Deployment</span>
            <span style={{ color: 'var(--c-cyan)' }}>4.2 / day</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0f6fc' }}>Elite Cadence</div>
          <p style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>Continuous GitOps</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-secondary)' }}>
            <span>Security</span>
            <span style={{ color: 'var(--c-emerald)' }}>0 CVEs</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0f6fc', color: 'var(--c-emerald)' }}>Zero Critical</div>
          <p style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>Trivy Gates Passed</p>
        </div>
      </div>

      {/* CI/CD Pipeline Visualizer */}
      <div className="card animate-fade-up-2" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--bdr-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', background: 'var(--c-primary-pale)', border: '1px solid var(--c-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-primary-light)' }}>
              <GitBranch size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc' }}>CI/CD Pipeline Stages</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Commit: <code style={{ color: 'var(--txt-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>main#8f9c1b4</code></p>
            </div>
          </div>
          <span className="badge badge-success"><CheckCircle2 size={13} /> Pipeline Succeeded</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={idx} style={{ padding: '1rem', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--txt-muted)' }}>STAGE {idx + 1}</span>
                <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--txt-secondary)' }}>{step.duration}</span>
              </div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f6fc', marginBottom: '0.25rem' }}>{step.stage}</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--txt-muted)' }}>{step.tool}</span>
                <span style={{ fontWeight: 700, color: 'var(--c-emerald)' }}>{step.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kubernetes Cluster State */}
      <div className="card animate-fade-up-3" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bdr-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={20} style={{ color: 'var(--c-primary-light)' }} />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc' }}>Kubernetes Pod Status</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Namespace: production</p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--txt-secondary)' }}>local-k8s-cluster</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th>Pod Name</th>
                <th>Status</th>
                <th>Restarts</th>
                <th>CPU</th>
                <th>Mem</th>
                <th style={{ textAlign: 'right' }}>Age</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {pods.map((pod, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#e6edf3' }}>{pod.name}</td>
                  <td>
                    <span className={`badge ${pod.status === 'Running' ? 'badge-success' : 'badge-danger'}`} style={{ fontFamily: 'sans-serif' }}>
                      <span className={`badge-dot ${pod.status === 'Running' ? '' : 'animate-pulse'}`}></span>
                      {pod.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--txt-secondary)' }}>{pod.restarts}</td>
                  <td style={{ color: 'var(--txt-secondary)' }}>{pod.cpu}</td>
                  <td style={{ color: 'var(--txt-secondary)' }}>{pod.memory}</td>
                  <td style={{ textAlign: 'right', color: 'var(--txt-muted)' }}>{pod.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DevOpsHealth;
