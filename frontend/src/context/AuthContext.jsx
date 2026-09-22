import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  patient: {
    id: 'usr_pat_1',
    name: 'Johnathan Doe',
    email: 'patient@healthops.io',
    role: 'patient',
    token: 'jwt_mock_token_patient_123',
    phone: '+1 (555) 234-5678',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Peanuts',
    emergencyContact: 'Jane Doe (+1 555-987-6543)',
    dateOfBirth: '1990-05-14',
    address: '42 Health St, Boston, MA'
  },
  doctor: {
    id: 'usr_doc_1',
    name: 'Dr. Sarah Alistair',
    email: 'doctor@healthops.io',
    role: 'doctor',
    token: 'jwt_mock_token_doctor_456',
    specialty: 'Cardiology',
    department: 'Cardiovascular Medicine',
    experience: '12 Years',
    license: 'MED-89410-US',
    consultationFee: 120,
    phone: '+1 (555) 789-0123'
  },
  admin: {
    id: 'usr_adm_1',
    name: 'Alex Rivera (DevSecOps Lead)',
    email: 'admin@healthops.io',
    role: 'admin',
    token: 'jwt_mock_token_admin_789',
    department: 'System Architecture & Security',
    accessLevel: 'Super Administrator'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('healthops_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to demo patient for smooth out-of-the-box experience
    return DEMO_USERS.patient;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('healthops_token') || 'jwt_mock_token_patient_123';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('healthops_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('healthops_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('healthops_token', token);
    } else {
      localStorage.removeItem('healthops_token');
    }
  }, [token]);

  const login = (email, _password) => {
    // Check demo credentials
    if (email === 'doctor@healthops.io' || email.includes('doc')) {
      const u = DEMO_USERS.doctor;
      setUser(u);
      setToken(u.token);
      return { success: true, user: u };
    }
    if (email === 'admin@healthops.io' || email.includes('adm')) {
      const u = DEMO_USERS.admin;
      setUser(u);
      setToken(u.token);
      return { success: true, user: u };
    }
    // Default to patient
    const u = {
      ...DEMO_USERS.patient,
      email: email || 'patient@healthops.io',
      name: email ? email.split('@')[0] : 'Johnathan Doe'
    };
    setUser(u);
    setToken(u.token);
    return { success: true, user: u };
  };

  const loginAs = (role) => {
    if (DEMO_USERS[role]) {
      const u = DEMO_USERS[role];
      setUser(u);
      setToken(u.token);
      return u;
    }
  };

  const register = (data) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || 'patient',
      token: `jwt_mock_${Date.now()}`,
      phone: data.phone || '',
      bloodGroup: data.bloodGroup || 'A+',
      allergies: data.allergies || 'None',
      specialty: data.specialty || 'General Practice',
      department: data.department || 'General Medicine'
    };
    setUser(newUser);
    setToken(newUser.token);
    return { success: true, user: newUser };
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('healthops_user');
    localStorage.removeItem('healthops_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
        loginAs,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
