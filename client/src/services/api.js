/**
 * API service for communication with the backend REST API.
 * Uses configurable VITE_API_BASE_URL with fallback to '/api'.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    let data;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = data?.error?.details || [];
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        `Unable to reach backend server at ${API_BASE_URL}. Ensure the Express server is running on port 3000.`
      );
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  getUsers: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/users${query}`);
  },

  getUserStats: () => {
    return request('/users/stats');
  },

  getUserById: (id) => {
    return request(`/users/${id}`);
  },

  createUser: (userData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: (id, userData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  getHealth: () => {
    return request('/health');
  }
};

