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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Security & Audit Trail</h1>
        <p className="text-sm text-slate-600">
          Immutable ledger of security actions, role transitions, authentication attempts, and DevSecOps pipelines.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto text-xs">
            {['all', 'info', 'success', 'warning'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition ${
                  severityFilter === sev
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions, actors, targets..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp (UTC)</th>
                <th className="px-6 py-4">Event Action</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Origin Service</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition font-sans">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-700 text-xs">
                    {log.target}
                  </td>

                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {log.actor}
                  </td>

                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                    {log.service || 'web-gateway'}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
