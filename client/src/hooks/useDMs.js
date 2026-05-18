import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useDMs = (token) => {
  const [dms, setDms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDMs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/dm`);
      setDms(res.data);
    } catch (err) {
      console.error('Failed to fetch DMs', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDms([]);
    } else {
      fetchDMs();
    }
  }, [token, fetchDMs]);

  const startDM = useCallback(async (userId) => {
    try {
      const res = await axios.post(`${API_URL}/dm/${userId}`);
      // Refresh list to ensure we have the latest
      fetchDMs();
      return res.data;
    } catch (err) {
      console.error('Failed to start DM', err);
      throw err;
    }
  }, [fetchDMs]);

  const markRead = useCallback(async (dmId) => {
    try {
      const res = await axios.patch(`${API_URL}/dm/${dmId}/read`);
      setDms((prev) => prev.map(d => d._id === dmId ? res.data : d));
    } catch (err) {
      console.error('Failed to mark DM as read', err);
    }
  }, []);

  // Helper to locally update unread counts or last messages without full refetch
  const updateDMData = useCallback((dmId, updater) => {
     setDms(prev => prev.map(dm => {
        if (dm._id === dmId) {
           return updater(dm);
        }
        return dm;
     }));
  }, []);

  return { dms, loading, startDM, markRead, fetchDMs, updateDMData };
};
