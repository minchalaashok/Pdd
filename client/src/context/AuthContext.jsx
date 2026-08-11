import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { isFirebaseConfigured, auth } from '../config/firebase';
import { firebaseAuthService } from '../services/firebaseService';
import { isSupabaseConfigured } from '../config/supabase';
import { supabaseAuthService } from '../services/supabaseService';

const AuthContext = createContext();

// ─── Sync a user profile into the server custom tables ─────────────────────
// This ensures Supabase Auth / Firebase users have rows in the custom
// Users/Donors/Hospitals/Receivers tables so that stats counters work.
// Safe to call multiple times — server returns existing record if already synced.
const syncProfileToServer = async (userProfile) => {
  if (!userProfile?.email || !userProfile?.role) return null;
  try {
    const res = await fetchApi('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(userProfile)
    });
    return res?.success ? res : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  useEffect(() => {
    setIsFirebaseActive(isFirebaseConfigured());
    setIsSupabaseActive(isSupabaseConfigured());

    const savedUser = localStorage.getItem('lifelink_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // ── Auto-sync on startup ─────────────────────────────────────────
        // If this user came from Supabase/Firebase auth they may not yet
        // have a row in the custom tables.  syncProfileToServer() is idempotent
        // and will trigger a USER_REGISTERED WebSocket broadcast only when
        // a new row is actually created, updating all connected dashboards.
        syncProfileToServer(parsedUser).then(res => {
          if (res?.token) {
            localStorage.setItem('lifelink_token', res.token);
          }
        });
      } catch (e) {
        localStorage.removeItem('lifelink_user');
      }
    }
    setLoading(false);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password, role) => {
    // 1. Try Supabase Auth
    if (isSupabaseActive) {
      try {
        const res = await supabaseAuthService.login(email, password);
        if (res.success) {
          const userWithRole = { ...res.user, role: role || res.user.role || 'donor' };

          // Sync to custom tables and get a server-issued JWT
          const syncRes = await syncProfileToServer({ ...userWithRole, email, password });
          const token   = syncRes?.token || res.token;

          localStorage.setItem('lifelink_token', token);
          localStorage.setItem('lifelink_user', JSON.stringify(userWithRole));
          setUser(userWithRole);
          return { success: true, user: userWithRole };
        }
      } catch (err) {
        console.warn('Supabase login attempt info:', err.message);
      }
    }

    // 2. Try Firebase Auth
    if (isFirebaseActive) {
      try {
        const res = await firebaseAuthService.login(email, password);
        if (res.success) {
          const userWithRole = { ...res.user, role: role || res.user.role || 'donor' };

          const syncRes = await syncProfileToServer({ ...userWithRole, email });
          const token   = syncRes?.token || res.token;

          localStorage.setItem('lifelink_token', token);
          localStorage.setItem('lifelink_user', JSON.stringify(userWithRole));
          setUser(userWithRole);
          return { success: true, user: userWithRole };
        }
      } catch (err) {
        console.warn('Firebase login attempt info:', err.message);
      }
    }

    // 3. Local API fallback
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
    if (res.success) {
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  // ─── Demo Login ───────────────────────────────────────────────────────────
  const loginAsDemo = async (roleName) => {
    const emailMap = {
      admin:    'admin@lifelink.org',
      hospital: 'hospital1@lifelink.org',
      donor:    'donor1@lifelink.org',
      receiver: 'receiver1@lifelink.org'
    };
    return await login(emailMap[roleName], 'Password123!', roleName);
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    // 1. Try Supabase Auth
    if (isSupabaseActive) {
      try {
        const res = await supabaseAuthService.register(userData);
        if (res.success) {
          const userWithRole = { ...res.user, role: userData.role || res.user.role || 'donor' };

          // Sync the new user into custom tables → populates stats counters
          // and broadcasts USER_REGISTERED WS event to all connected browsers
          const syncRes = await syncProfileToServer({ ...userData, ...userWithRole });
          const token   = syncRes?.token || res.token;

          localStorage.setItem('lifelink_token', token);
          localStorage.setItem('lifelink_user', JSON.stringify(userWithRole));
          setUser(userWithRole);
          return { success: true, user: userWithRole };
        }
      } catch (err) {
        console.warn('Supabase registration fallback to API:', err.message);
      }
    }

    // 2. Try Firebase Auth
    if (isFirebaseActive) {
      try {
        const res = await firebaseAuthService.register(userData);
        if (res.success) {
          const userWithRole = { ...res.user, role: userData.role || res.user.role || 'donor' };

          const syncRes = await syncProfileToServer({ ...userData, ...userWithRole });
          const token   = syncRes?.token || res.token;

          localStorage.setItem('lifelink_token', token);
          localStorage.setItem('lifelink_user', JSON.stringify(userWithRole));
          setUser(userWithRole);
          return { success: true, user: userWithRole };
        }
      } catch (err) {
        console.warn('Firebase registration fallback to API:', err.message);
      }
    }

    // 3. Local API fallback (already populates all custom tables)
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.success) {
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (isSupabaseActive) await supabaseAuthService.logout();
    if (isFirebaseActive) await firebaseAuthService.logout();
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isFirebaseActive, isSupabaseActive,
      login, loginAsDemo, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
