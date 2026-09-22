import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  ShieldCheck, 
  Server, 
  ArrowRight, 
  Cpu
} from 'lucide-react';

const AdminDashboard = () => {
  const { users, appointments, auditLogs } = useData();

  const totalPatients = users.filter((u) => u.role === 'patient').length;
  const totalDoctors = users.filter((u) => u.role === 'doctor').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud Infrastructure & Security Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">HealthOps Operations Command</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Real-time control plane for user access governance, healthcare appointment metrics, and DevSecOps observability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            to="/admin/devops"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Server size={18} />
            <span>DevSecOps Telemetry</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Users size={18} />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Registered Users</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{users.length}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{totalPatients} Patients • {totalAdmins} Admin</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Stethoscope size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Doctors</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalDoctors}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Appointments</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{appointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
            <Cpu size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">System Uptime</p>
            <h3 className="text-2xl font-extrabold text-slate-800">99.98%</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: User Distribution & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appointment & Role Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Appointment Pipeline Breakdown</h3>
              <span className="text-xs text-slate-400 font-semibold">{appointments.length} Total</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Completed Consultations</span>
                  <span>{completedAppointments}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(completedAppointments / (appointments.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Confirmed & Scheduled</span>
                  <span>{confirmedAppointments}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(confirmedAppointments / (appointments.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Pending Triage Review</span>
                  <span>{pendingAppointments}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${(pendingAppointments / (appointments.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Link
                to="/admin/users"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All System Records</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Platform Architecture Highlights */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              DevSecOps Compliance Baseline
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Vulnerability Scan</span>
                <strong className="text-emerald-400">0 Critical (Trivy)</strong>
              </div>
              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">SonarQube Gate</span>
                <strong className="text-emerald-400">Quality Gate Passed (A)</strong>
              </div>
              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Deployment Engine</span>
                <strong className="text-indigo-300">Argo CD GitOps</strong>
              </div>
              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Cluster Resilience</span>
                <strong className="text-blue-300">Multi-Replica Pods</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Logs Snippet */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent System Security Logs</h3>
                <p className="text-xs text-slate-400">Audit trail of critical mutations</p>
              </div>
              <Link to="/admin/audit-logs" className="text-xs font-bold text-blue-600 hover:underline">
                Full Audit Trail
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.target}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Actor: {log.actor}</span>
                    <span className="text-emerald-700 font-semibold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
