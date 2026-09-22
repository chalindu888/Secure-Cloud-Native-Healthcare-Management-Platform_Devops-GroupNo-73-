import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  CheckCircle, 
  FileText, 
  CheckCircle2
} from 'lucide-react';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Complete/Prescribe Modal state
  const [activeModalApt, setActiveModalApt] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const filtered = docAppointments.filter((apt) => {
    if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientEmail.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCompleteModal = (apt) => {
    setActiveModalApt(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (activeModalApt) {
      updateAppointmentStatus(
        activeModalApt.id,
        'completed',
        diagnosisNotes,
        prescriptionText,
        user?.email
      );
      setActiveModalApt(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Appointments Ledger</h1>
        <p className="text-sm text-slate-600">
          Manage your schedule, accept incoming requests, and record medical diagnoses and prescriptions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition ${
                  activeFilter === tab
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name or email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {apt.patientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{apt.patientName}</h3>
                    <p className="text-xs text-slate-500">{apt.patientEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={apt.status} />
                  <span className="text-xs text-slate-400">Ref: {apt.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar size={15} className="text-slate-400" />
                  <span>Date: <strong className="text-slate-900">{apt.date}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={15} className="text-slate-400" />
                  <span>Slot: <strong className="text-slate-900">{apt.timeSlot}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <User size={15} className="text-slate-400" />
                  <span>Specialty: <strong className="text-slate-900">{apt.doctorSpecialty}</strong></span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-700">Presenting Symptoms / Reason:</strong> {apt.reason}
                </p>
              </div>

              {/* Existing Notes or Prescriptions */}
              {(apt.notes || apt.prescription) && (
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 text-xs text-indigo-950">
                  {apt.notes && (
                    <p>
                      <strong className="text-indigo-900">Diagnosis:</strong> {apt.notes}
                    </p>
                  )}
                  {apt.prescription && (
                    <p className="font-mono text-emerald-800">
                      <strong>Rx:</strong> {apt.prescription}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                {apt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled', '', '', user?.email)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'confirmed', '', '', user?.email)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle size={14} />
                      <span>Accept Appointment</span>
                    </button>
                  </>
                )}

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleOpenCompleteModal(apt)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText size={14} />
                    <span>Complete & Write Prescription</span>
                  </button>
                )}

                {apt.status === 'completed' && (
                  <button
                    onClick={() => handleOpenCompleteModal(apt)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Edit Prescription / Notes
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <Calendar size={36} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No appointments found</h3>
            <p className="text-xs text-slate-500">No records match the current filter query.</p>
          </div>
        )}
      </div>

      {/* Modal to Write / Edit Prescription */}
      <Modal
        isOpen={!!activeModalApt}
        onClose={() => setActiveModalApt(null)}
        title={`Clinical Record & Prescription: ${activeModalApt?.patientName}`}
      >
        <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p><strong>Patient:</strong> {activeModalApt?.patientName} ({activeModalApt?.patientEmail})</p>
            <p><strong>Reason for Visit:</strong> {activeModalApt?.reason}</p>
            <p><strong>Date & Slot:</strong> {activeModalApt?.date} at {activeModalApt?.timeSlot}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnosis Assessment & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="e.g. Patient presents with acute bronchitis. Lungs show wheezing..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Digital Medical Prescription (Rx)
            </label>
            <textarea
              rows={3}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. 1. Amoxicillin 500mg (1 tablet every 8h for 7 days)&#10;2. Salbutamol Inhaler as needed"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModalApt(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={16} />
              <span>Save Record & Issue Rx</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
