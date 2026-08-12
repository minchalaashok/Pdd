// LifeLink Mobile — API Service
// Uses production Render.com URL in production
// For local dev testing: change to your machine's local IP e.g. http://192.168.1.x:5000/api
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://pdd-1-we4e.onrender.com/api';
const TOKEN_KEY = 'lifelink_jwt_token';

// ─── Token helpers ────────────────────────────────────────
export const saveToken = async (token) => {
  try { await SecureStore.setItemAsync(TOKEN_KEY, token); } catch (e) {}
};

export const getToken = async () => {
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch (e) { return null; }
};

export const clearToken = async () => {
  try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch (e) {}
};

// ─── Core fetch wrapper ────────────────────────────────────
export const fetchMobileApi = async (endpoint, options = {}) => {
  try {
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok && response.status === 401) {
      await clearToken();
      return { success: false, message: 'Session expired. Please log in again.', unauthorized: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Error on ${endpoint}:`, error.message);
    return { success: false, message: 'Network error. Check your internet connection.' };
  }
};

// ─── Auth endpoints ────────────────────────────────────────
export const apiLogin = (email, password, role) =>
  fetchMobileApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });

export const apiRegister = (userData) =>
  fetchMobileApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

// ─── Stats endpoints ───────────────────────────────────────
export const apiGetStats = () => fetchMobileApi('/stats');

// ─── Inventory search ─────────────────────────────────────
export const apiSearchBlood = (bloodGroup = 'ALL', city = 'ALL') =>
  fetchMobileApi(`/inventory/blood?blood_group=${bloodGroup}&city=${city}`);

export const apiSearchOrgans = (organType = 'ALL', city = 'ALL') =>
  fetchMobileApi(`/inventory/organs?organ_type=${organType}&city=${city}`);

// ─── Requests ─────────────────────────────────────────────
export const apiCreateRequest = (data) =>
  fetchMobileApi('/requests', { method: 'POST', body: JSON.stringify(data) });

export const apiGetRequests = () => fetchMobileApi('/requests');

// ─── Hospitals ────────────────────────────────────────────
export const apiGetHospitals = () => fetchMobileApi('/admin/hospitals');

// ─── Admin stats ──────────────────────────────────────────
export const apiGetAdminStats = () => fetchMobileApi('/admin/analytics');
