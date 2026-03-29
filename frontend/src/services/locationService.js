// src/services/locationService.js
// Handles GPS location collection and sending to backend.
// Used for fraud detection — backend checks if worker is
// actually in the city where the disruption event occurred.

import * as Location from 'expo-location';
import apiClient from '../api/apiClient';


// ── Request Location Permission ───────────────────────────────────────────────

/**
 * Ask the device for foreground location permission.
 * Call this once when the app starts or before tracking begins.
 *
 * @returns {boolean} true if permission granted, false if denied
 *
 * Usage:
 *   const allowed = await requestLocationPermission();
 */
export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};


// ── Get Current GPS Coordinates ───────────────────────────────────────────────

/**
 * Get the device's current latitude and longitude.
 * Requires permission to be granted first.
 *
 * @returns {{ latitude: number, longitude: number }}
 *
 * Usage:
 *   const { latitude, longitude } = await getCurrentCoords();
 */
export const getCurrentCoords = async () => {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude:  location.coords.latitude,
    longitude: location.coords.longitude,
  };
};


// ── Reverse Geocode → City Name ───────────────────────────────────────────────

/**
 * Convert GPS coordinates into a city name string.
 * Used to send `city` to the backend alongside lat/lng.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} city name, e.g. "Delhi"
 *
 * Usage:
 *   const city = await getCityFromCoords(28.6139, 77.2090);
 */
export const getCityFromCoords = async (latitude, longitude) => {
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return place?.city || place?.district || place?.region || 'Unknown';
};


// ── Send Location to Backend ──────────────────────────────────────────────────

/**
 * Send worker GPS coordinates to the backend.
 * Backend stores and uses this for fraud detection during claim creation.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} city
 * @returns {{ status, user_id, latitude, longitude, city, timestamp }}
 *
 * Usage:
 *   await sendWorkerLocation(28.6139, 77.2090, 'Delhi');
 */
export const sendWorkerLocation = async (latitude, longitude, city) => {
  const response = await apiClient.post('/worker/location', {
    latitude,
    longitude,
    city,
  });
  return response.data;
};


// ── Full Flow: Get + Send in One Call ─────────────────────────────────────────

/**
 * Convenience function — gets device GPS and sends it to backend in one step.
 * Handles permission check, coordinate fetch, city lookup, and API call.
 *
 * @returns {{ success: boolean, city?: string, error?: string }}
 *
 * Usage:
 *   const result = await trackAndSendLocation();
 *   if (result.success) console.log('Location sent:', result.city);
 */
export const trackAndSendLocation = async () => {
  try {
    const allowed = await requestLocationPermission();
    if (!allowed) {
      return { success: false, error: 'Location permission denied.' };
    }

    const { latitude, longitude } = await getCurrentCoords();
    const city = await getCityFromCoords(latitude, longitude);

    await sendWorkerLocation(latitude, longitude, city);

    return { success: true, city, latitude, longitude };
  } catch (error) {
    console.error('locationService: failed to track location', error);
    return {
      success: false,
      error: error?.message || 'Failed to send location.',
    };
  }
};