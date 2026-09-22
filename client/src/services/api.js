/**
 * Centralized API client for CarbonMap.
 * Supports configurable VITE_API_URL for production deployment (Vercel/Render)
 * and defaults to relative '/api' proxy in local development.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.isAbsurdInput = data.isAbsurdInput || false;
      error.maxThreshold = data.maxThreshold;
      error.unit = data.unit;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Dashboard Aggregation
  getDashboard: () => request('/dashboard'),

  // Activities
  getActivities: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.period) query.append('period', params.period);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const qs = query.toString();
    return request(`/activities${qs ? `?${qs}` : ''}`);
  },

  getActivity: (id) => request(`/activities/${id}`),

  createActivity: (payload) =>
    request('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteActivity: (id) =>
    request(`/activities/${id}`, {
      method: 'DELETE',
    }),

  // Target & Limits (Daily & Weekly)
  getTarget: () => request('/target'),

  updateTarget: (targetData) => {
    const body = typeof targetData === 'object' ? targetData : { weeklyTarget: targetData };
    return request('/target', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // Eco Coach
  getEcoCoach: () =>
    request('/ai/eco-coach', {
      method: 'POST',
    }),

  // Demo Data
  seedDemoData: (force = false) =>
    request(`/demo/seed${force ? '?force=true' : ''}`, {
      method: 'POST',
    }),

  clearActivities: () =>
    request('/demo/clear', {
      method: 'DELETE',
    }),
};
