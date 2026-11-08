import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const REFRESH_MS = 15000;

const REQUEST_ROLES = ['patient', 'doctor', 'ambulance'];

// Loads every registered ambulance (public) and, for signed-in patients / doctors / ambulances,
// the requests that involve them. Refreshes by itself so changes appear without a reload.
export const useAmbulanceData = () => {
  const { role, isAuthenticated } = useAuth();
  const [ambulances, setAmbulances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const calls = [api.get('/ambulances')];
      if (isAuthenticated && REQUEST_ROLES.includes(role)) calls.push(api.get('/ambulance-requests'));
      const [ambulanceResult, requestResult] = await Promise.all(calls);
      setAmbulances(ambulanceResult.data.ambulances || []);
      setRequests(requestResult?.data.requests || []);
      setError('');
    } catch (err) {
      setError(err.response ? 'Unable to load ambulances.' : 'Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { ambulances, requests, loading, error, refresh };
};

export const errorText = (err, fallback) =>
  err.response?.data?.error || (err.response ? fallback : 'Cannot connect to the backend server.');

export const REQUEST_STATUS = {
  requested: { label: 'Requested', color: '#92400e', bg: '#fef3c7' },
  accepted: { label: 'Accepted', color: '#1d4ed8', bg: '#dbeafe' },
  on_the_way: { label: 'On the way', color: '#6d28d9', bg: '#ede9fe' },
  completed: { label: 'Completed', color: '#047857', bg: '#d1fae5' },
  cancelled: { label: 'Cancelled', color: '#475569', bg: '#e2e8f0' },
  declined: { label: 'Declined', color: '#b91c1c', bg: '#fee2e2' },
};

export const AMBULANCE_STATUS = {
  available: { label: 'Available', color: '#047857', bg: '#d1fae5' },
  busy: { label: 'On a trip', color: '#92400e', bg: '#fef3c7' },
  offline: { label: 'Offline', color: '#475569', bg: '#e2e8f0' },
};
