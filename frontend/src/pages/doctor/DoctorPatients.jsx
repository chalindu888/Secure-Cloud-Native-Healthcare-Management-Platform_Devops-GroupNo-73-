import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Search, Users, Mail, Calendar, ClipboardList, FileText, Pill } from 'lucide-react';

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

const DoctorPatients = () => {
  const { user } = useAuth();
  const { appointments } = useData();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // One entry per patient, built from this doctor's appointments (newest visit first)
  const patients = useMemo(() => {
    const mine = appointments.filter(
      (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
    );
    const byPatient = new Map();

    mine.forEach((apt) => {
      const key = apt.patientId || apt.patientEmail;
      if (!byPatient.has(key)) {
        byPatient.set(key, {
          id: key,
          name: apt.patientName,
          email: apt.patientEmail,
          visits: [],
        });
      }
      byPatient.get(key).visits.push(apt);
    });

    return [...byPatient.values()]
      .map((p) => {
        const visits = [...p.visits].sort((a, b) => b.date.localeCompare(a.date));
        return {
          ...p,
          visits,
          lastVisit: visits[0]?.date,
          completedCount: visits.filter((v) => v.status === 'completed').length,
          activeCount: visits.filter((v) => v.status === 'pending' || v.status === 'confirmed').length,
        };
      })
      .sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''));
  }, [appointments, user]);

  const q = search.trim().toLowerCase();
  const filtered = patients.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  );
  const selected = patients.find((p) => p.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Patients</h1>
        <p className="text-sm text-slate-600">
          Everyone you have appointments with, with their visit history, diagnoses and prescriptions.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between md:items-center">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Users size={16} className="text-indigo-600" />
          {patients.length} patient{patients.length === 1 ? '' : 's'}
        </p>
        <div className="w-full md:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className="text-left bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {initials(p.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Mail size={12} /> {p.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="font-bold text-slate-900 text-base">{p.visits.length}</p>
                  <p className="text-slate-500">Visits</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="font-bold text-slate-900 text-base">{p.completedCount}</p>
                  <p className="text-slate-500">Completed</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="font-bold text-slate-900 text-base">{p.activeCount}</p>
                  <p className="text-slate-500">Upcoming</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} /> Last visit: {p.lastVisit}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          {patients.length === 0
            ? 'No patients yet. Patients appear here once they book an appointment with you.'
            : 'No patients match your search.'}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? `Patient: ${selected.name}` : ''}
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Mail size={14} /> {selected.email}
            </p>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {selected.visits.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-600" />
                      {v.date} · {v.timeSlot}
                    </p>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="text-slate-700 flex gap-2">
                    <ClipboardList size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    {v.reason}
                  </p>
                  {v.notes && (
                    <p className="text-slate-700 flex gap-2">
                      <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <span><strong>Diagnosis:</strong> {v.notes}</span>
                    </p>
                  )}
                  {v.prescription && (
                    <p className="text-slate-700 flex gap-2">
                      <Pill size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <span><strong>Prescription:</strong> {v.prescription}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
