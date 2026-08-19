// LifeLink Client API Service
// Handles all HTTP requests to the backend with:
// - Automatic auth token injection
// - response.ok checking (so 4xx/5xx errors are properly caught)
// - Retry with exponential backoff for network failures
// - Structured error returns

// In dev: uses http://localhost:5000/api
// In production (Vercel): uses VITE_API_URL from .env.production
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// If running in a web browser on localhost, default to local backend directly
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  API_BASE_URL = 'http://localhost:5000/api';
}

export { API_BASE_URL };

/**
 * Sleep helper for retry backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core fetch wrapper with retry logic, auth injection, and structured errors.
 *
 * @param {string} endpoint  - API path, e.g. '/auth/login'
 * @param {object} options   - Standard fetch options (method, body, headers, etc.)
 * @param {number} retries   - Number of retries remaining (default: 2)
 */
export const fetchApi = async (endpoint, options = {}, retries = 2) => {
  const token = localStorage.getItem('lifelink_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse the JSON body regardless of status
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // For HTTP errors (4xx, 5xx), return a structured failure object
    // instead of silently treating them as success.
    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Request failed (HTTP ${response.status})`,
        status: response.status,
        ...data,
      };
    }

    return data;

  } catch (error) {
    // Network errors (server down, CORS, no internet)
    console.error(`API Error on ${endpoint}:`, error.message);

    // Retry on network failures with exponential backoff
    if (retries > 0) {
      const backoffMs = (3 - retries) * 1000; // 1s, then 2s
      console.warn(`Retrying ${endpoint} in ${backoffMs}ms... (${retries} retries left)`);
      await sleep(backoffMs);
      return fetchApi(endpoint, options, retries - 1);
    }

    return {
      success: false,
      message: 'Unable to connect to the server. Please check your connection.',
      status: 0,
    };
  }
};
