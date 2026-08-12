import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const RealtimeContext = createContext();

// In dev: localhost:5000 | In production: Render.com URL from VITE_API_URL env var
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derive WebSocket URL from API URL (http→ws, https→wss)
const WS_URL = API_BASE
  .replace('/api', '')
  .replace(/^http/, 'ws');

// All stats start at real 0 — populated from DB via /api/stats
const INITIAL_STATS = {
  totalUsers: 0,
  totalDonors: 0,
  totalReceivers: 0,
  totalHospitals: 0,
  totalBloodDonations: 0,
  totalBloodUnits: 0,
  totalOrganDonations: 0,
  pendingRequests: 0,
  completedRequests: 0,
  rejectedRequests: 0,
  availableBloodUnits: 0,
  availableOrgans: 0,
};

const MAX_RECONNECT_DELAY_MS = 30000;  // 30 seconds maximum backoff
const BASE_RECONNECT_DELAY_MS = 1000;  // Start at 1 second

export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected]   = useState(false);
  const [liveStats, setLiveStats]       = useState(INITIAL_STATS);
  const [liveAlerts, setLiveAlerts]     = useState([]);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const wsRef             = useRef(null);
  const reconnectTimerRef = useRef(null);   // single ref — no timer leaks
  const reconnectAttempts = useRef(0);
  const isMountedRef      = useRef(true);   // prevent state updates after unmount

  // ── Fetch real stats from public /api/stats ──────────────────────────────
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) return;
      const data = await res.json();
      if (isMountedRef.current && data.success && data.stats) {
        setLiveStats(prev => ({ ...prev, ...data.stats }));
      }
    } catch {
      // Silently keep previous/baseline values — server may be temporarily down
    }
  }, []);

  // ── Push an alert into the live feed ─────────────────────────────────────
  const pushAlert = useCallback((type, payload) => {
    if (!isMountedRef.current) return;

    const alert = {
      id: Date.now() + Math.random(),
      type,
      title:    payload.title   || type.replace(/_/g, ' '),
      subtitle: payload.message || '',
      time:     new Date().toLocaleTimeString(),
      city:     payload.city || '',
    };
    setLiveAlerts(prev => [alert, ...prev.slice(0, 14)]);

    // Increment stat counters based on event type
    setLiveStats(prev => {
      const next = { ...prev };
      if (type === 'BLOOD_DONATED') {
        next.totalBloodDonations = (next.totalBloodDonations || 0) + 1;
        next.totalBloodUnits     = (next.totalBloodUnits || 0) + (payload.units || 1);
        next.availableBloodUnits = (next.availableBloodUnits || 0) + (payload.units || 1);
      } else if (type === 'EMERGENCY_REQUEST') {
        next.pendingRequests = (next.pendingRequests || 0) + 1;
      } else if (type === 'REQUEST_FULFILLED') {
        next.completedRequests = (next.completedRequests || 0) + 1;
        next.pendingRequests   = Math.max(0, (next.pendingRequests || 0) - 1);
      } else if (type === 'NEW_DONOR_REGISTERED' || type === 'USER_REGISTERED') {
        next.totalUsers  = (next.totalUsers || 0) + 1;
        next.totalDonors = (next.totalDonors || 0) + 1;
      } else if (type === 'ORGAN_AVAILABLE') {
        next.availableOrgans = (next.availableOrgans || 0) + 1;
      }
      return next;
    });

    setRefreshVersion(v => v + 1);
  }, []);

  // ── WebSocket Connection with Exponential Backoff ─────────────────────────
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clear any existing timer before creating a new connection
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Close existing stale connection
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.onclose = null; // Prevent onclose from triggering another reconnect
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        reconnectAttempts.current = 0; // Reset backoff on successful connection
        console.log('⚡ LifeLink Realtime WebSocket connected');
        refreshStats();
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CONNECTED') return;

          // Events that require a fresh stats pull from the database
          const dbEvents = ['USER_REGISTERED', 'HOSPITAL_STATUS_UPDATED', 'DONATION_RECORDED', 'REQUEST_STATUS_UPDATED'];
          if (dbEvents.includes(data.type)) {
            refreshStats();
          }

          if (data.payload) pushAlert(data.type, data.payload);
        } catch (e) {
          console.error('WebSocket message processing error:', e);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
        const delay = Math.min(
          BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current),
          MAX_RECONNECT_DELAY_MS
        );
        reconnectAttempts.current += 1;
        console.warn(`WebSocket disconnected. Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        // onerror is always followed by onclose — let onclose handle the reconnect
        console.warn('WebSocket error (will reconnect):', err.type || 'unknown');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('WebSocket instantiation failed:', err.message);
      setIsConnected(false);
      const delay = Math.min(
        BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current),
        MAX_RECONNECT_DELAY_MS
      );
      reconnectAttempts.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    }
  }, [refreshStats, pushAlert]);

  // ── Reconnect when the tab becomes visible again ──────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' &&
          wsRef.current?.readyState === WebSocket.CLOSED) {
        console.log('Tab became visible — reconnecting WebSocket...');
        reconnectAttempts.current = 0;
        connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connect]);

  // ── Initial Setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    connect();
    refreshStats(); // Initial stat fetch (before WS connects)

    // Poll stats every 30s as a reliability fallback when WS is down
    const pollInterval = setInterval(refreshStats, 30000);

    return () => {
      isMountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      clearInterval(pollInterval);
    };
  }, [connect, refreshStats]);

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      liveStats,
      liveAlerts,
      refreshVersion,
      refreshStats,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
