import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useRooms = (token) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/rooms?joined=true`);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRooms([]);
    } else {
      fetchRooms();
    }
  }, [token, fetchRooms]);

  const createRoom = useCallback(async (name, description, isPrivate) => {
    try {
      const res = await axios.post(`${API_URL}/rooms`, { name, description, isPrivate });
      setRooms((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Failed to create room', err);
      throw err;
    }
  }, []);

  const joinRoom = useCallback(async (roomId) => {
    try {
      const res = await axios.post(`${API_URL}/rooms/${roomId}/join`);
      setRooms((prev) => {
        const exists = prev.some(r => r._id === roomId);
        if (exists) {
          return prev.map(r => r._id === roomId ? res.data : r);
        }
        return [res.data, ...prev];
      });
      return res.data;
    } catch (err) {
      console.error('Failed to join room', err);
      throw err;
    }
  }, []);

  const leaveRoom = useCallback(async (roomId) => {
    try {
      await axios.post(`${API_URL}/rooms/${roomId}/leave`);
      setRooms((prev) => prev.filter(r => r._id !== roomId));
    } catch (err) {
      console.error('Failed to leave room', err);
      throw err;
    }
  }, []);

  return { rooms, loading, createRoom, joinRoom, leaveRoom, fetchRooms };
};
