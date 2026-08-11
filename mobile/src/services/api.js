const API_BASE_URL = 'http://localhost:5000/api';

export const fetchMobileApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error(`Mobile API Error on ${endpoint}:`, error);
    return { success: false, message: 'Network connection failed' };
  }
};
