// src/api/apiClient.js
// Centralized Axios instance for all GigShield API calls.
// Auto-attaches JWT token to every request that needs it.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Backend base URL ─────────────────────────────────────────────────────────
// Update this if your machine IP changes.
const BASE_URL = 'http://192.168.1.2:5000';

// ── Create Axios instance ────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds — prevents hanging requests on mobile
});

// ── Request interceptor — attach JWT token automatically ─────────────────────
// Every request goes through here before being sent.
// If a token exists in AsyncStorage, it is added to the Authorization header.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('gigshield_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('apiClient: could not read token from storage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — centralized error handling ────────────────────────
// Catches all HTTP errors in one place.
// 401 = token expired or invalid → clears stored token.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired — remove it so the user is forced to log in again
        await AsyncStorage.removeItem('gigshield_token');
        await AsyncStorage.removeItem('gigshield_user_id');
        console.warn('apiClient: session expired, token cleared.');
      }

      // Return a clean error object for UI consumption
      return Promise.reject({
        status,
        message: data?.error || data?.message || 'Something went wrong.',
        data,
      });
    }

    if (error.request) {
      // Request was made but no response received (network issue)
      return Promise.reject({
        status: 0,
        message: 'Cannot reach server. Check your network or backend IP.',
      });
    }

    return Promise.reject({ status: -1, message: error.message });
  }
);

export default apiClient;