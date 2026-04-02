// src/api/apiClient.js
// Single Axios instance for all API calls.
// Auto-attaches JWT token. Handles 401 globally.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
});

// ── Attach token before every request ────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle responses centrally ────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Token expired — clear session
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      }
      return Promise.reject({
        status,
        message: data?.error || data?.message || 'Something went wrong.',
        data,
      });
    }
    return Promise.reject({
      status:  0,
      message: 'Cannot reach server. Check your network or backend IP.',
    });
  }
);

export default apiClient;