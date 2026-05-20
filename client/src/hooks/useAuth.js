import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chattra_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('chattra_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistAuth = (userData, authToken) => {
    localStorage.setItem('chattra_token', authToken);
    localStorage.setItem('chattra_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(userData);
  };

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, password });
      persistAuth(res.data.user, res.data.token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      persistAuth(res.data.user, res.data.token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chattra_token');
    localStorage.removeItem('chattra_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  // Set axios default if token already exists
  if (token) {
    // eslint-disable-next-line react-hooks/immutability
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return { user, token, loading, error, register, login, logout, setError };
};
