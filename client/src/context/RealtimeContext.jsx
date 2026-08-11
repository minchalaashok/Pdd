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

export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected]   = useState(false);
  const [liveStats, setLiveStats]       = useState(INITIAL_STATS);
  const [liveAlerts, setLiveAlerts]     = useState([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const wsRef = useRef(null);

  // ─── Fetch real stats from public /api/stats ────────────────────────────
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.stats) {
        setLiveStats(prev => ({ ...prev, ...data.stats }));
      }
    } catch (e) {
      // Silently keep previous/baseline values
    }
  }, []);

  // ─── Push an alert into the live feed ────────────────────────────────────
  const pushAlert = useCallback((type, payload) => {
    const alert = {
      id: Date.now() + Math.random(),
      type,
      title: payload.title  || type.replace(/_/g, ' '),
      subtitle: payload.message || '',
      time: 'Just now',
      city: payload.city || '',
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
      } else if (type === 'NEW_DONOR_REGISTERED') {
        next.totalUsers  = (next.totalUsers || 0) + 1;
        next.totalDonors = (next.totalDonors || 0) + 1;
      } else if (type === 'ORGAN_AVAILABLE') {
        next.availableOrgans = (next.availableOrgans || 0) + 1;
      } else if (type === 'DONOR_ONLINE') {
        // no counter change, just an alert
      }
      return next;
    });

    setRefreshVersion(v => v + 1);
  }, []);

  // ─── WebSocket connection ─────────────────────────────────────────────────
  useEffect(() => {
    let reconnectTimer = null;

    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('⚡ LifeLink Realtime WebSocket connected');
          refreshStats();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') return;

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
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
          console.error('WebSocket Error:', err);
          setIsConnected(false);
        };
      } catch (err) {
        console.error('WebSocket Connection Failure:', err);
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    // Poll stats every 15s as a reliability fallback
    const pollInterval = setInterval(refreshStats, 15000);

    // Initial stat fetch
    refreshStats();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
    };
  }, [refreshStats, pushAlert]);

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
