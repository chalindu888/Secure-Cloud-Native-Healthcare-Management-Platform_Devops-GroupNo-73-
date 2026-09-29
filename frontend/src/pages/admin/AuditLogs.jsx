import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { Search } from 'lucide-react';

const AuditLogs = () => {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.service?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">System Security & Audit Trail</h1>
        <p className="page-subtitle" style={{ maxWidth: '650px' }}>
          Immutable ledger of security actions, role transitions, authentication attempts, and DevSecOps pipelines.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="card animate-fade-up-1" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: 'var(--r-md)' }}>
            {['all', 'info', 'success', 'warning'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                  background: severityFilter === sev ? 'var(--c-primary-pale)' : 'transparent',
                  color: severityFilter === sev ? 'var(--c-primary-light)' : 'var(--txt-secondary)',
                  border: `1px solid ${severityFilter === sev ? 'var(--c-primary-border)' : 'transparent'}`,
                  transition: 'all 200ms ease',
                }}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions, actors, targets..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card animate-fade-up-2" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Event Action</th>
                <th>Target Entity</th>
                <th>Actor</th>
                <th>Origin Service</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--txt-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td>
                    <span style={{
                      fontWeight: 700, fontFamily: 'monospace', fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.08)', color: '#f0f6fc', padding: '0.2rem 0.5rem', borderRadius: '0.25rem'
                    }}>
                      {log.action}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.8rem', color: '#e6edf3' }}>
                    {log.target}
                  </td>

                  <td style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                    {log.actor}
                  </td>

                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--txt-secondary)' }}>
                    {log.service || 'web-gateway'}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
              
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>No audit logs match your search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
