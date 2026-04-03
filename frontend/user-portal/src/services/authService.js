// src/services/authService.js
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// ── Storage helpers ───────────────────────────────────────────────────────────
export const storeSession = async (token, userId, user) => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.TOKEN,   token],
    [STORAGE_KEYS.USER_ID, String(userId)],
    [STORAGE_KEYS.USER,    JSON.stringify(user)],
  ]);
};

export const getToken   = ()  => AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
export const getUserId  = ()  => AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
export const getUser    = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () =>
  AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

// ── Register ──────────────────────────────────────────────────────────────────
export const registerWorker = async (name, phone, email, city, platform) => {
  const res = await apiClient.post('/auth/register', { name, phone, email, city, platform });
  const { token, user } = res.data;
  await storeSession(token, user.id, user);
  return { token, user };
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginWorker = async (phone) => {
  const res = await apiClient.post('/auth/login', { phone });
  const { token, user_id, user } = res.data;
  await storeSession(token, user_id, user);
  return { token, user_id, user };
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutWorker = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER,
      "city"
    ]);

    console.log("✅ Cleared all storage properly");
  } catch (error) {
    console.log("❌ Logout error:", error);
  }
};