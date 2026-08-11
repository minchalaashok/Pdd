// In dev: uses http://localhost:5000/api
// In production (Vercel): uses VITE_API_URL from .env.production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export { API_BASE_URL };

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('lifelink_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return { success: false, message: 'Network connection failed' };
  }
};
