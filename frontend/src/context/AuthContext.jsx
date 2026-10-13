import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000';

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

  // Start logged out unless a real login was previously saved
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('healthops_user');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }

    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('healthops_token') || null;
  });

  // Save user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('healthops_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('healthops_user');
    }
  }, [user]);

  // Save token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('healthops_token', token);
    } else {
      localStorage.removeItem('healthops_token');
    }
  }, [token]);


  // REAL LOGIN
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      // Convert backend field names to the names
      // your existing frontend uses
      const loggedInUser = {
        ...data.user,
        bloodGroup: data.user.blood_group,
        specialty: data.user.specialty,
        license: data.user.license
      };

      setUser(loggedInUser);
      setToken(data.token);

      return {
        success: true,
        user: loggedInUser,
        token: data.token
      };

    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        message: 'Cannot connect to the backend server'
      };
    }
  };


  // Temporary demo login
  // We can remove this later when the real accounts are ready
  const loginAs = (role) => {
    if (DEMO_USERS[role]) {
      const u = DEMO_USERS[role];

      setUser(u);
      setToken(u.token);

      return u;
    }
  };


  // Registration will be connected to the backend next
  const register = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: data.role,
          blood_group: data.bloodGroup,
          specialty: data.specialty,
          license: data.license
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Registration failed'
        };
      }

      return {
        success: true,
        user: result.user
      };

    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        message: 'Cannot connect to the backend server'
      };
    }
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