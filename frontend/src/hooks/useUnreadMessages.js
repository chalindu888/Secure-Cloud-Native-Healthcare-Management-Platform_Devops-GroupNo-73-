import { useEffect, useState } from 'react';
import api from '../services/api';

// Number of unread chat messages for a signed-in patient or doctor (checked every 15 seconds)
export const useUnreadMessages = (enabled) => {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!enabled) { setUnread(0); return undefined; }
    let cancelled = false;
    const check = async () => {
      if (document.hidden) return;
      try {
        const { data } = await api.get('/messages/unread-count');
        if (!cancelled) setUnread(data.unread || 0);
      } catch { /* keep the last number */ }
    };
    check();
    const timer = setInterval(check, 15000);
    window.addEventListener('focus', check);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', check); };
  }, [enabled]);

  return unread;
};
