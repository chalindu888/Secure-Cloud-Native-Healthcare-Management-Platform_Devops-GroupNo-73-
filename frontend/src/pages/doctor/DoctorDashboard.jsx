import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText, 
  CheckCircle2,
  CalendarCheck,
  Activity
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  // Selected appointment for prescription/completion modal
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  // Doctor's appointments
  const docAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id || apt.doctorName === user?.name
  );

  const pendingRequests = docAppointments.filter((apt) => apt.status === 'pending');
  const confirmedQueue = docAppointments.filter((apt) => apt.status === 'confirmed');
  const completedVisits = docAppointments.filter((apt) => apt.status === 'completed');

  const handleOpenCompleteModal = (apt) => {
    setActiveConsultation(apt);
    setDiagnosisNotes(apt.notes || '');
    setPrescriptionText(apt.prescription || '');
  };

  const handleSaveConsultation = (e) => {
    e.preventDefault();
    if (activeConsultation) {
      updateAppointmentStatus(
        activeConsultation.id,
        'completed',
        diagnosisNotes,
        prescriptionText,
        user?.email
      );
      setActiveConsultation(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Doctor Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/40 border border-indigo-400/40 text-indigo-100 text-xs font-semibold">
            <Stethoscope size={14} className="text-indigo-200" />
            <span>Physician Clinical Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-indigo-100 text-sm max-w-xl">
            Specialist in {user?.specialty || 'Clinical Medicine'}. You have{' '}
            <strong className="text-white underline">{pendingRequests.length} pending appointment request(s)</strong> awaiting review today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            to="/doctor/appointments"
            className="px-5 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition flex items-center justify-center gap-2"
          >
            <CalendarCheck size={18} />
            <span>Manage All Appointments</span>
          </Link>
          <Link
            to="/doctor/schedule"
            className="px-5 py-3 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold text-sm border border-indigo-400/40 transition flex items-center justify-center gap-2"
          >
            <Clock size={18} />
            <span>Set Schedule Slots</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{pendingRequests.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Confirmed Queue</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{confirmedQueue.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Treated Patients</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{completedVisits.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
            <h3 className="text-2xl font-extrabold text-slate-800">${user?.consultationFee || 120}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Action Queue & Confirmed Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Action Requests */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pending Patient Requests</h2>
              <p className="text-xs text-slate-500">Approve or decline consultation requests</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
              {pendingRequests.length} to review
            </span>
          </div>

          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                      <p className="text-xs text-slate-500">{apt.patientEmail}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400">Date:</span>
                      <p className="font-semibold text-slate-800">{apt.date}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Time Slot:</span>
                      <p className="font-semibold text-slate-800">{apt.timeSlot}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Reason:</strong> {apt.reason}
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled', '', '', user?.email)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'confirmed', '', '', user?.email)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Accept Request</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">All caught up!</h4>
                <p className="text-xs text-slate-500">No pending appointment requests need your review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Confirmed Active Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Active Queue</h2>
              <p className="text-xs text-slate-500">Ready for consultation</p>
            </div>
            <Link to="/doctor/appointments" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {confirmedQueue.length > 0 ? (
              confirmedQueue.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">{apt.timeSlot} • {apt.date}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {apt.reason}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleOpenCompleteModal(apt)}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText size={14} />
                      <span>Complete & Issue Prescription</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                <Calendar size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No confirmed appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Consultation & Prescription Modal */}
      <Modal
        isOpen={!!activeConsultation}
        onClose={() => setActiveConsultation(null)}
        title={`Consultation Notes — ${activeConsultation?.patientName}`}
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
            <p><strong>Patient:</strong> {activeConsultation?.patientName} ({activeConsultation?.patientEmail})</p>
            <p><strong>Reason:</strong> {activeConsultation?.reason}</p>
            <p><strong>Date & Time:</strong> {activeConsultation?.date} at {activeConsultation?.timeSlot}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Physician Diagnosis & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="Enter patient diagnosis, findings, clinical assessment..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Digital Prescription & Regimen
            </label>
            <textarea
              rows={3}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg tid x 7 days, rest, hydration..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveConsultation(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={16} />
              <span>Sign & Mark Completed</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
