// LifeLink Mobile — Auth Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister, saveToken, getToken, clearToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On app launch: restore session from SecureStore
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await getToken();
        if (stored) {
          // Decode JWT payload to get user info (without a library)
          const payload = JSON.parse(atob(stored.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            setToken(stored);
            setUser({ id: payload.id, email: payload.email, role: payload.role, full_name: payload.full_name });
          } else {
            await clearToken(); // Token expired
          }
        }
      } catch (e) {
        await clearToken();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password, role) => {
    const res = await apiLogin(email, password, role);
    if (res.success && res.token) {
      await saveToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    if (res.success && res.token) {
      await saveToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
