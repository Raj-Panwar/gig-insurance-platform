// src/services/authService.js
// Handles all authentication — register, login, token storage.
// All screens should use these functions instead of calling axios directly.

import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys — centralised so they never go out of sync
const TOKEN_KEY   = 'gigshield_token';
const USER_ID_KEY = 'gigshield_user_id';
const USER_KEY    = 'gigshield_user';


// ── Token helpers ─────────────────────────────────────────────────────────────

export const storeToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const storeUserId = async (userId) => {
  await AsyncStorage.setItem(USER_ID_KEY, String(userId));
};

export const getUserId = async () => {
  return await AsyncStorage.getItem(USER_ID_KEY);
};

export const storeUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = async () => {
  // Call this on logout — wipes all stored auth data
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USER_KEY]);
};

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};


// ── Register ──────────────────────────────────────────────────────────────────

/**
 * Register a new gig worker.
 *
 * @param {string} name
 * @param {string} phone
 * @param {string} city
 * @param {string} platform  e.g. "Swiggy", "Zomato", "Uber"
 * @returns {{ token, user }}
 */
export const registerWorker = async (name, phone, city, platform) => {
  const response = await apiClient.post('/auth/register', {
    name,
    phone,
    city,
    platform,
  });

  const { token, user } = response.data;

  // Auto-store token and user after successful registration
  await storeToken(token);
  await storeUserId(user.id);
  await storeUser(user);

  return { token, user };
};


// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Log in with phone number.
 *
 * @param {string} phone
 * @returns {{ token, user_id, role, user }}
 */
export const loginWorker = async (phone) => {
  const response = await apiClient.post('/auth/login', { phone });

  const { token, user_id, role, user } = response.data;

  // Auto-store token and user after successful login
  await storeToken(token);
  await storeUserId(user_id);
  await storeUser(user);

  return { token, user_id, role, user };
};


// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Log out the current worker — clears all stored session data.
 */
export const logoutWorker = async () => {
  await clearSession();
};