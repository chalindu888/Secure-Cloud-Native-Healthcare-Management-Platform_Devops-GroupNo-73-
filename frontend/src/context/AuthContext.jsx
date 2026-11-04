import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const ROLE_KEY = 'healthops_role';

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
      const { data } = await api.post('/login', { email, password });

      if (!data.token || !data.user) {
        return {
          success: false,
          message: 'The backend returned an incomplete login response.'
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
      localStorage.setItem(ROLE_KEY, data.role);

      return {
        success: true,
        user: loggedInUser,
        token: data.token
      };

    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        message: error.response
          ? error.response.data?.error
            || error.response.data?.message
            || 'Login failed. Please check your credentials.'
          : 'Cannot connect to the backend server. Make sure it is running on http://localhost:5000.'
      };
    }
  };


  // Create an account; the chosen role ('patient' | 'doctor') is saved by the backend
  const register = async (data) => {
    try {
      const { data: result } = await api.post('/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        blood_group: data.bloodGroup,
        specialty: data.specialty,
        license: data.license
      });

      return {
        success: true,
        user: result.user
      };

    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        message: error.response?.data?.error
          || error.response?.data?.message
          || 'Cannot connect to the backend server'
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
    localStorage.removeItem(ROLE_KEY);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
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