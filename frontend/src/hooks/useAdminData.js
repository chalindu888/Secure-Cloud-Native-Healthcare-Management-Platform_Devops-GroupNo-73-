import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const REFRESH_MS = 20000;

// Loads one admin endpoint (e.g. '/admin/overview') and keeps it fresh, so new registrations show
// up without a reload.
export const useAdminFetch = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const result = await api.get(path);
      setData(result.data);
      setError('');
    } catch (err) {
      setError(err.response ? 'Unable to load this information.' : 'Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { data, loading, error, refresh };
};

export const timeAgo = (value) => {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const ROLE_STYLE = {
  patient: { label: 'Patient', color: '#1d4ed8', bg: '#dbeafe', gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
  doctor: { label: 'Doctor', color: '#0f766e', bg: '#ccfbf1', gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
  ambulance: { label: 'Ambulance', color: '#b91c1c', bg: '#fee2e2', gradient: 'linear-gradient(135deg, #ef4444, #f97316)' },
  admin: { label: 'Admin', color: '#6d28d9', bg: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
};
