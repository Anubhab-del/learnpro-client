import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on first mount

  // ─── Hydrate from localStorage on first load ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('learnpro_token');
    const savedUser = localStorage.getItem('learnpro_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('learnpro_user');
        localStorage.removeItem('learnpro_token');
      }
    }
    setLoading(false);
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/api/auth/register', { email, password });
    localStorage.setItem('learnpro_token', data.token);
    localStorage.setItem('learnpro_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('learnpro_token', data.token);
    localStorage.setItem('learnpro_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('learnpro_token');
    localStorage.removeItem('learnpro_user');
    setUser(null);
  }, []);

  // ─── Check if logged in ───────────────────────────────────────────────────────
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
