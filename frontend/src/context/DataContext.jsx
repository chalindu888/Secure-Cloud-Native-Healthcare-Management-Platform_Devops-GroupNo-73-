import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DataContext = createContext(null);

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'];

// How often doctors / appointments are re-fetched so new registrations and bookings show up on their own
const REFRESH_MS = 15000;

// Backend doctor row -> the shape the pages use
const toDoctor = (doctor) => ({
  id: doctor.id,
  name: doctor.name || 'Unnamed doctor',
  email: doctor.email,
  specialty: doctor.specialty || 'General Medicine',
  department: doctor.department || 'Medical Services',
  qualification: doctor.qualifications || 'Qualifications not provided',
  location: doctor.clinic_location || 'Clinic location not provided',
  consultationFee: doctor.consultation_fee !== null && doctor.consultation_fee !== undefined
    ? Number(doctor.consultation_fee)
    : null,
  bio: doctor.bio || '',
  photo: doctor.photo || '',
  yearsExperience: doctor.years_experience,
  maxPatientsPerDay: doctor.max_patients_per_day,
  availableDays: doctor.available_days?.length ? doctor.available_days : DEFAULT_DAYS,
  timeSlots: doctor.time_slots?.length ? doctor.time_slots : DEFAULT_SLOTS,
});

const errorMessage = (error, fallback) => error.response?.data?.error || fallback;

const INITIAL_USERS = [
  {
    id: 'usr_pat_1',
    name: 'Johnathan Doe',
    email: 'patient@healthops.io',
    role: 'patient',
    status: 'active',
    joinedDate: '2026-01-15',
    phone: '+1 (555) 234-5678',
    appointmentsCount: 3
  },
  {
    id: 'usr_pat_2',
    name: 'Eleanor Vance',
    email: 'e.vance@example.com',
    role: 'patient',
    status: 'active',
    joinedDate: '2026-02-10',
    phone: '+1 (555) 345-6789',
    appointmentsCount: 1
  },
  {
    id: 'usr_pat_3',
    name: 'Robert Sterling',
    email: 'r.sterling@example.com',
    role: 'patient',
    status: 'active',
    joinedDate: '2026-03-01',
    phone: '+1 (555) 456-7890',
    appointmentsCount: 2
  },
  {
    id: 'usr_doc_1',
    name: 'Dr. Sarah Alistair',
    email: 'doctor@healthops.io',
    role: 'doctor',
    status: 'active',
    joinedDate: '2025-11-01',
    specialty: 'Cardiology',
    appointmentsCount: 48
  },
  {
    id: 'usr_doc_2',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@healthops.io',
    role: 'doctor',
    status: 'active',
    joinedDate: '2025-11-15',
    specialty: 'Neurology',
    appointmentsCount: 36
  },
  {
    id: 'usr_doc_3',
    name: 'Dr. Emily Chen',
    email: 'e.chen@healthops.io',
    role: 'doctor',
    status: 'active',
    joinedDate: '2025-12-05',
    specialty: 'Dermatology',
    appointmentsCount: 52
  },
  {
    id: 'usr_adm_1',
    name: 'Alex Rivera',
    email: 'admin@healthops.io',
    role: 'admin',
    status: 'active',
    joinedDate: '2025-10-01',
    specialty: 'DevSecOps Administrator',
    appointmentsCount: 0
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-09-22T13:30:12Z',
    actor: 'admin@healthops.io',
    action: 'RBAC_ROLE_VERIFY',
    target: 'Dr. Sarah Alistair (Doctor)',
    status: 'SUCCESS',
    severity: 'info',
    ip: '192.168.1.45',
    service: 'auth-service'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-22T12:15:00Z',
    actor: 'system-ci-cd',
    action: 'TRIVY_SECURITY_SCAN',
    target: 'healthops-backend:v1.4.2',
    status: 'PASSED (0 Critical, 0 High)',
    severity: 'success',
    ip: '10.244.0.12',
    service: 'ci-pipeline'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-22T11:42:19Z',
    actor: 'patient@healthops.io',
    action: 'APPOINTMENT_REQUEST',
    target: 'Dr. Emily Chen (apt-102)',
    status: 'SUCCESS',
    severity: 'info',
    ip: '172.56.21.90',
    service: 'appointment-service'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-22T09:05:44Z',
    actor: 'doctor@healthops.io',
    action: 'PRESCRIPTION_ISSUED',
    target: 'apt-101 (Johnathan Doe)',
    status: 'SUCCESS',
    severity: 'info',
    ip: '192.168.1.80',
    service: 'clinical-service'
  },
  {
    id: 'log-5',
    timestamp: '2026-09-22T08:12:05Z',
    actor: 'argo-cd-controller',
    action: 'GITOPS_SYNC_DEPLOY',
    target: 'k8s-cluster/production/healthops-frontend',
    status: 'SYNCED',
    severity: 'success',
    ip: '10.244.1.5',
    service: 'argocd'
  },
  {
    id: 'log-6',
    timestamp: '2026-09-22T06:45:30Z',
    actor: 'unknown-ip-185.220.101.5',
    action: 'FAILED_LOGIN_ATTEMPT',
    target: 'admin@healthops.io',
    status: 'BLOCKED_RATE_LIMIT',
    severity: 'warning',
    ip: '185.220.101.5',
    service: 'api-gateway'
  }
];

export const DataProvider = ({ children }) => {
  const { user, role } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patientPhotos, setPatientPhotos] = useState({});
  const requestedPhotoIds = useRef(new Set());

  // Doctors come from the database, so newly registered doctors appear automatically
  const loadDoctors = useCallback(async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors((data.doctors || []).map(toDoctor));
    } catch (error) {
      console.error('Unable to load doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  // Patients and doctors each load only their own appointments
  const appointmentsPath =
    user?.id && role === 'doctor' ? `/doctor/appointments/${user.id}`
    : user?.id && role === 'patient' ? `/patient/appointments/${user.id}`
    : null;

  const loadAppointments = useCallback(async () => {
    if (!appointmentsPath) {
      setAppointments([]);
      return;
    }
    try {
      const { data } = await api.get(appointmentsPath);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Unable to load appointments:', error);
    }
  }, [appointmentsPath]);

  // Doctors see their patients' photos. They are fetched once per patient (and again when the
  // tab regains focus) rather than with every appointment refresh, since they are large.
  const loadPatientPhotos = useCallback(async (ids) => {
    if (ids.length === 0) return;
    try {
      const { data } = await api.get('/doctor/patient-photos', { params: { ids: ids.join(',') } });
      setPatientPhotos(prev => ({ ...prev, ...data.photos }));
    } catch (error) {
      console.error('Unable to load patient photos:', error);
    }
  }, []);

  const photoPatientIds = role === 'doctor'
    ? [...new Set(appointments.filter(apt => apt.patientHasPhoto).map(apt => apt.patientId))]
    : [];
  const photoPatientKey = photoPatientIds.join(',');

  useEffect(() => {
    const missing = photoPatientIds.filter(id => !requestedPhotoIds.current.has(id));
    missing.forEach(id => requestedPhotoIds.current.add(id));
    loadPatientPhotos(missing);
  }, [photoPatientKey, loadPatientPhotos]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (role !== 'doctor') return undefined;
    const refreshPhotos = () => loadPatientPhotos(photoPatientKey ? photoPatientKey.split(',').map(Number) : []);
    window.addEventListener('focus', refreshPhotos);
    return () => window.removeEventListener('focus', refreshPhotos);
  }, [role, photoPatientKey, loadPatientPhotos]);

  useEffect(() => {
    // Demo data from earlier versions is no longer used
    localStorage.removeItem('healthops_doctors');
    localStorage.removeItem('healthops_appointments');
  }, []);

  useEffect(() => {
    loadDoctors();
    const timer = setInterval(loadDoctors, REFRESH_MS);
    window.addEventListener('focus', loadDoctors);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', loadDoctors);
    };
  }, [loadDoctors]);

  useEffect(() => {
    loadAppointments();
    if (!appointmentsPath) return undefined;
    const timer = setInterval(loadAppointments, REFRESH_MS);
    window.addEventListener('focus', loadAppointments);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', loadAppointments);
    };
  }, [loadAppointments, appointmentsPath]);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('healthops_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('healthops_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('healthops_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('healthops_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Actions
  const addAuditLog = (action, target, status = 'SUCCESS', severity = 'info', actor = 'system') => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      status,
      severity,
      ip: '127.0.0.1 (Client)',
      service: 'healthops-web'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const replaceAppointment = (updated) =>
    setAppointments(prev => prev.map(apt => (apt.id === updated.id ? updated : apt)));

  // Every action returns { success, message?, appointment? } so pages can show failures
  const bookAppointment = async ({ doctorId, date, timeSlot, reason }) => {
    try {
      const { data } = await api.post('/appointments', { doctorId, date, timeSlot, reason });
      setAppointments(prev => [data.appointment, ...prev]);
      addAuditLog(
        'APPOINTMENT_CREATED',
        `${data.appointment.doctorName} on ${date} (${timeSlot})`,
        'SUCCESS',
        'info',
        user?.email
      );
      return { success: true, appointment: data.appointment };
    } catch (error) {
      return { success: false, message: errorMessage(error, 'Unable to book the appointment. Please try again.') };
    }
  };

  const updateAppointment = async (appointmentId, changes, auditAction, severity) => {
    try {
      const { data } = await api.patch(`/appointments/${appointmentId}`, changes);
      replaceAppointment(data.appointment);
      addAuditLog(auditAction, `Appointment ${appointmentId}`, 'SUCCESS', severity, user?.email);
      return { success: true, appointment: data.appointment };
    } catch (error) {
      loadAppointments();
      return { success: false, message: errorMessage(error, 'Unable to update the appointment.') };
    }
  };

  const cancelAppointment = (appointmentId) =>
    updateAppointment(appointmentId, { status: 'cancelled' }, 'APPOINTMENT_CANCELLED', 'warning');

  const updateAppointmentStatus = (appointmentId, status, notes = '', prescription = '') =>
    updateAppointment(
      appointmentId,
      { status, ...(notes ? { notes } : {}), ...(prescription ? { prescription } : {}) },
      `APPOINTMENT_${status.toUpperCase()}`,
      status === 'completed' ? 'success' : 'info'
    );

  const updateDoctorSchedule = async (doctorId, newDays, newSlots) => {
    try {
      await api.put(`/doctor/profile/${doctorId}`, { available_days: newDays, time_slots: newSlots });
      setDoctors(prev =>
        prev.map(doc =>
          doc.id === doctorId
            ? { ...doc, availableDays: newDays.length ? newDays : DEFAULT_DAYS, timeSlots: newSlots.length ? newSlots : DEFAULT_SLOTS }
            : doc
        )
      );
      addAuditLog('SCHEDULE_UPDATED', `Doctor ${doctorId} schedule updated`, 'SUCCESS', 'info', user?.email);
      return { success: true };
    } catch (error) {
      return { success: false, message: errorMessage(error, 'Unable to save your schedule.') };
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updatedStatus = u.status === 'active' ? 'suspended' : 'active';
          addAuditLog(
            'USER_STATUS_CHANGE',
            `${u.name} (${u.email}) set to ${updatedStatus}`,
            'SUCCESS',
            'warning',
            'admin@healthops.io'
          );
          return { ...u, status: updatedStatus };
        }
        return u;
      })
    );
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          addAuditLog(
            'USER_ROLE_CHANGED',
            `${u.name} role changed from ${u.role} to ${newRole}`,
            'SUCCESS',
            'warning',
            'admin@healthops.io'
          );
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        doctors,
        doctorsLoading,
        appointments,
        patientPhotos,
        refreshAppointments: loadAppointments,
        users,
        auditLogs,
        bookAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        updateDoctorSchedule,
        toggleUserStatus,
        updateUserRole,
        addAuditLog
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
