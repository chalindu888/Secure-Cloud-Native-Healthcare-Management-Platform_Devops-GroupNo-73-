import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const REFRESH_MS = 15000;

// Loads the hospital's rooms (with the beds taken right now) and the signed-in user's admissions:
// a patient's own, or the patients a doctor admitted. Refreshes by itself.
export const useAdmissions = () => {
  const [rooms, setRooms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [roomResult, admissionResult] = await Promise.all([api.get('/hospital/rooms'), api.get('/admissions')]);
      setRooms(roomResult.data.rooms || []);
      setAdmissions(admissionResult.data.admissions || []);
      setError('');
    } catch (err) {
      setError(err.response ? 'Unable to load admissions.' : 'Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { rooms, admissions, loading, error, refresh };
};
