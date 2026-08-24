// Auto-detect API base URL:
// - In production (Render), the frontend is served BY the backend, so we use relative URLs
// - In development, we call localhost:5000
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction
  ? 'https://pdd-gq6q.onrender.com/api'
  : 'http://localhost:5000/api';

export const getApiBase = () => API_BASE_URL;

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
    return { success: false, message: 'Network connection failed. Check your internet connection.' };
  }
};
