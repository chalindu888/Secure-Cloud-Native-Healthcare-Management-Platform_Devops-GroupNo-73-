import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { 
  Calendar, 
  Clock, 
  FileText, 
  PlusCircle, 
  Stethoscope, 
  FileCheck,
  Search
} from 'lucide-react';

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useData();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeModalAppointment, setActiveModalAppointment] = useState(null);

  // Filter for this patient
  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === user?.id || apt.patientEmail === user?.email
  );

  const filtered = patientAppointments.filter((apt) => {
    if (activeFilter === 'upcoming') {
      return apt.status === 'confirmed' || apt.status === 'pending';
    }
    if (activeFilter !== 'all' && apt.status !== activeFilter) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        apt.doctorName.toLowerCase().includes(q) ||
        apt.doctorSpecialty.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Consultations & History</h1>
          <p className="text-sm text-slate-600">
            View upcoming doctor appointments, cancel bookings, and review completed medical prescriptions.
          </p>
        </div>
        <Link
          to="/patient/book"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
        >
          <PlusCircle size={16} />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs">
            {['all', 'upcoming', 'pending', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition ${
                  activeFilter === tab
                    ? 'bg-white text-blue-700 shadow-xs'
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
              placeholder="Search appointments..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{apt.doctorName}</h3>
                    <p className="text-xs font-semibold text-blue-600">{apt.doctorSpecialty}</p>
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
                  <span>Time: <strong className="text-slate-900">{apt.timeSlot}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText size={15} className="text-slate-400" />
                  <span>Booked: <strong className="text-slate-900">{new Date(apt.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-700">Reason for Visit:</strong> {apt.reason}
                </p>
              </div>

              {/* Prescription / Notes notification snippet */}
              {(apt.notes || apt.prescription) && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2 text-blue-900">
                    <FileCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Medical Notes & Prescription Available</span>
                      <p className="text-slate-600 text-[11px] line-clamp-1">{apt.prescription || apt.notes}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalAppointment(apt)}
                    className="shrink-0 px-2.5 py-1 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-600 hover:text-white transition"
                  >
                    View Prescription
                  </button>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-2">
                {apt.status === 'pending' || apt.status === 'confirmed' ? (
                  <button
                    onClick={() => cancelAppointment(apt.id, user?.email)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                  >
                    Cancel Appointment
                  </button>
                ) : null}

                {(apt.notes || apt.prescription) && (
                  <button
                    onClick={() => setActiveModalAppointment(apt)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Medical Report
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Calendar size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No appointments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No appointments match the selected filter. Schedule a new consultation with one of our certified specialists.
            </p>
            <Link
              to="/patient/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
            >
              <PlusCircle size={15} />
              <span>Book Appointment</span>
            </Link>
          </div>
        )}
      </div>

      {/* Prescription / Consultation Notes Modal */}
      <Modal
        isOpen={!!activeModalAppointment}
        onClose={() => setActiveModalAppointment(null)}
        title="Consultation Record & Digital Prescription"
      >
        {activeModalAppointment && (
          <div className="space-y-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-900">{activeModalAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialty / Dept:</span>
                <span className="font-bold text-blue-600">{activeModalAppointment.doctorSpecialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Date:</span>
                <span className="font-bold text-slate-900">{activeModalAppointment.date} ({activeModalAppointment.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Appointment ID:</span>
                <span className="font-bold text-slate-700">{activeModalAppointment.id}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Physician Clinical Notes</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed">
                {activeModalAppointment.notes || 'No doctor clinical notes recorded.'}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Official Medical Prescription</h4>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-900 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {activeModalAppointment.prescription || 'No medications prescribed.'}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalAppointment(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
