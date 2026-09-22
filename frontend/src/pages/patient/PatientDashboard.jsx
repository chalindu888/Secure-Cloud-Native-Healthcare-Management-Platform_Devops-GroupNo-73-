import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { 
  Calendar, 
  Clock, 
  User, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Activity,
  Heart
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useData();

  // Filter appointments for this patient
  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === user?.id || apt.patientEmail === user?.email
  );

  const upcomingAppointments = patientAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending'
  );

  const completedAppointments = patientAppointments.filter(
    (apt) => apt.status === 'completed'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/40 border border-blue-400/40 text-blue-100 text-xs font-semibold">
            <Heart size={14} className="text-rose-300 fill-rose-300" />
            <span>Patient Health Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Track your consultations, view medical prescriptions, and schedule your next doctor appointment seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            to="/patient/book"
            className="px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Book New Appointment</span>
          </Link>
          <Link
            to="/patient/profile"
            className="px-5 py-3 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-400/40 transition flex items-center justify-center gap-2"
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Appointments</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{patientAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Upcoming / Pending</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{upcomingAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Completed Visits</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{completedAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Blood Group</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{user?.bloodGroup || 'O+'}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Appointments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
              <p className="text-xs text-slate-500">Your scheduled and pending consultations</p>
            </div>
            <Link
              to="/patient/appointments"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {apt.doctorSpecialty?.slice(0, 2).toUpperCase() || 'DR'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                        <p className="text-xs text-blue-600 font-medium">{apt.doctorSpecialty}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Date: <strong className="text-slate-800">{apt.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>Time: <strong className="text-slate-800">{apt.timeSlot}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Reason:</strong> {apt.reason}
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    {apt.status === 'pending' || apt.status === 'confirmed' ? (
                      <button
                        onClick={() => cancelAppointment(apt.id, user?.email)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      >
                        Cancel Appointment
                      </button>
                    ) : null}
                    <Link
                      to="/patient/appointments"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <Calendar size={36} className="text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No upcoming appointments</h3>
                <p className="text-xs text-slate-500">You don't have any appointments scheduled currently.</p>
                <Link
                  to="/patient/book"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Book Consultation Now</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Health Profile Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Medical Profile</h3>
              <Link to="/patient/profile" className="text-xs font-bold text-blue-600 hover:underline">
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Allergies & Sensitivities</span>
                <p className="font-semibold text-slate-800 mt-0.5">{user?.allergies || 'None specified'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Emergency Contact</span>
                <p className="font-semibold text-slate-800 mt-0.5">{user?.emergencyContact || 'Not recorded'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Phone</span>
                <p className="font-semibold text-slate-800 mt-0.5">{user?.phone || '+1 (555) 000-0000'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Primary Email</span>
                <p className="font-semibold text-slate-800 mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Help / Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <AlertCircle size={16} />
              <span>DevSecOps Patient Privacy</span>
            </div>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              All appointments and personal health information (PHI) are transmitted over TLS with JWT RBAC isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
