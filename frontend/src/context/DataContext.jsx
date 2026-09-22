import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

const INITIAL_DOCTORS = [
  {
    id: 'usr_doc_1',
    name: 'Dr. Sarah Alistair',
    email: 'doctor@healthops.io',
    specialty: 'Cardiology',
    department: 'Cardiovascular Institute',
    qualification: 'MD, FACC - Harvard Medical',
    experience: '12 Years',
    rating: 4.9,
    reviewsCount: 128,
    consultationFee: 120,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'],
    location: 'Building A, Suite 302',
    bio: 'Specialist in adult cardiology, heart failure management, and preventive cardiovascular wellness.'
  },
  {
    id: 'usr_doc_2',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@healthops.io',
    specialty: 'Neurology',
    department: 'Neuroscience Center',
    qualification: 'MD, PhD - Johns Hopkins',
    experience: '15 Years',
    rating: 4.8,
    reviewsCount: 94,
    consultationFee: 140,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    location: 'Building B, Suite 104',
    bio: 'Expertise in clinical neurophysiology, chronic migraines, and stroke rehabilitation.'
  },
  {
    id: 'usr_doc_3',
    name: 'Dr. Emily Chen',
    email: 'e.chen@healthops.io',
    specialty: 'Dermatology',
    department: 'Dermatology & Skin Care',
    qualification: 'MD, FAAD - Stanford Health',
    experience: '9 Years',
    rating: 4.9,
    reviewsCount: 182,
    consultationFee: 95,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    timeSlots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
    location: 'Building C, Suite 210',
    bio: 'Comprehensive medical and cosmetic dermatology, skin cancer screenings, and laser treatments.'
  },
  {
    id: 'usr_doc_4',
    name: 'Dr. Rajesh Patel',
    email: 'r.patel@healthops.io',
    specialty: 'Pediatrics',
    department: 'Children’s Health Wing',
    qualification: 'MD, FAAP - Columbia Univ',
    experience: '11 Years',
    rating: 5.0,
    reviewsCount: 215,
    consultationFee: 100,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    timeSlots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
    location: 'Children’s Pavilion, Suite 101',
    bio: 'Dedicated pediatrician focusing on developmental milestones, vaccinations, and pediatric emergency care.'
  },
  {
    id: 'usr_doc_5',
    name: 'Dr. Olivia Wilson',
    email: 'o.wilson@healthops.io',
    specialty: 'General Medicine',
    department: 'Primary Care Division',
    qualification: 'MBBS, MRCGP - Oxford University',
    experience: '8 Years',
    rating: 4.7,
    reviewsCount: 88,
    consultationFee: 80,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    location: 'Main Clinic, Suite 10',
    bio: 'Holistic primary healthcare, routine annual checkups, diabetes and hypertension management.'
  }
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-101',
    patientId: 'usr_pat_1',
    patientName: 'Johnathan Doe',
    patientEmail: 'patient@healthops.io',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Alistair',
    doctorSpecialty: 'Cardiology',
    date: '2026-09-28',
    timeSlot: '10:30 AM',
    reason: 'Quarterly cardiovascular review and blood pressure check',
    status: 'confirmed',
    notes: 'Patient advised to monitor resting pulse and keep log.',
    prescription: 'Lisinopril 10mg once daily in morning. Low sodium diet.',
    createdAt: '2026-09-20T10:15:00Z'
  },
  {
    id: 'apt-102',
    patientId: 'usr_pat_1',
    patientName: 'Johnathan Doe',
    patientEmail: 'patient@healthops.io',
    doctorId: 'usr_doc_3',
    doctorName: 'Dr. Emily Chen',
    doctorSpecialty: 'Dermatology',
    date: '2026-10-05',
    timeSlot: '01:30 PM',
    reason: 'Skin rash on forearm after outdoor gardening',
    status: 'pending',
    notes: '',
    prescription: '',
    createdAt: '2026-09-22T08:00:00Z'
  },
  {
    id: 'apt-103',
    patientId: 'usr_pat_1',
    patientName: 'Johnathan Doe',
    patientEmail: 'patient@healthops.io',
    doctorId: 'usr_doc_5',
    doctorName: 'Dr. Olivia Wilson',
    doctorSpecialty: 'General Medicine',
    date: '2026-08-15',
    timeSlot: '09:00 AM',
    reason: 'Annual comprehensive physical examination',
    status: 'completed',
    notes: 'All standard vitals normal. Cholesterol levels optimal.',
    prescription: 'Multivitamin daily, regular cardio exercise 30m/day.',
    createdAt: '2026-08-10T14:30:00Z'
  },
  {
    id: 'apt-104',
    patientId: 'usr_pat_2',
    patientName: 'Eleanor Vance',
    patientEmail: 'e.vance@example.com',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Alistair',
    doctorSpecialty: 'Cardiology',
    date: '2026-09-23',
    timeSlot: '09:00 AM',
    reason: 'Arrhythmia consultation and ECG follow-up',
    status: 'confirmed',
    notes: 'ECG booked for 8:30 AM before consult.',
    prescription: 'Metoprolol 25mg twice daily.',
    createdAt: '2026-09-21T11:00:00Z'
  },
  {
    id: 'apt-105',
    patientId: 'usr_pat_3',
    patientName: 'Robert Sterling',
    patientEmail: 'r.sterling@example.com',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Alistair',
    doctorSpecialty: 'Cardiology',
    date: '2026-09-24',
    timeSlot: '02:00 PM',
    reason: 'Chest tightness following mild exertion',
    status: 'pending',
    notes: '',
    prescription: '',
    createdAt: '2026-09-22T07:20:00Z'
  }
];

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
  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('healthops_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('healthops_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

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
    localStorage.setItem('healthops_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('healthops_appointments', JSON.stringify(appointments));
  }, [appointments]);

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

  const bookAppointment = ({ patient, doctorId, date, timeSlot, reason }) => {
    const doctor = doctors.find(d => d.id === doctorId);
    const newAppointment = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorId,
      doctorName: doctor ? doctor.name : 'Attending Physician',
      doctorSpecialty: doctor ? doctor.specialty : 'General',
      date,
      timeSlot,
      reason,
      status: 'pending',
      notes: '',
      prescription: '',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    addAuditLog(
      'APPOINTMENT_CREATED',
      `${doctor?.name} on ${date} (${timeSlot})`,
      'SUCCESS',
      'info',
      patient.email
    );
    return newAppointment;
  };

  const cancelAppointment = (appointmentId, userEmail = 'patient@healthops.io') => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
    );
    addAuditLog(
      'APPOINTMENT_CANCELLED',
      `Appointment ${appointmentId}`,
      'SUCCESS',
      'warning',
      userEmail
    );
  };

  const updateAppointmentStatus = (appointmentId, status, notes = '', prescription = '', doctorEmail = 'doctor@healthops.io') => {
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status,
            notes: notes || apt.notes,
            prescription: prescription || apt.prescription
          };
        }
        return apt;
      })
    );
    addAuditLog(
      `APPOINTMENT_${status.toUpperCase()}`,
      `Appointment ${appointmentId}`,
      'SUCCESS',
      status === 'completed' ? 'success' : 'info',
      doctorEmail
    );
  };

  const updateDoctorSchedule = (doctorId, newDays, newSlots) => {
    setDoctors(prev =>
      prev.map(doc => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            availableDays: newDays,
            timeSlots: newSlots
          };
        }
        return doc;
      })
    );
    addAuditLog('SCHEDULE_UPDATED', `Doctor ${doctorId} schedule updated`, 'SUCCESS', 'info', 'doctor@healthops.io');
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
        appointments,
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
