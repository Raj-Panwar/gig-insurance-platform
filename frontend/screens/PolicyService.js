// src/services/policyService.js
// Handles all policy-related API calls:
// - Look up zone risk data by city name
// - Calculate premium (automatic, no user input needed)
// - Create (buy) a new policy
// - Fetch worker's existing policies

import apiClient from '../api/apiClient';


// ── Zone Lookup by City ───────────────────────────────────────────────────────

/**
 * Look up zone risk data for a given city.
 * Returns zone_risk_level, weather_risk, zone_id, etc.
 *
 * @param {string} city  e.g. "Delhi"
 * @returns {{ found, zone_id, risk_level, weather_risk, flood_risk, pollution_risk, heat_risk }}
 *
 * Usage:
 *   const zone = await getZoneByCity('Delhi');
 */
export const getZoneByCity = async (city) => {
  const response = await apiClient.get(`/zone/by-city/${encodeURIComponent(city)}`);
  return response.data;
};


// ── Calculate Premium ─────────────────────────────────────────────────────────

/**
 * Calculate weekly premium from zone risk data.
 * The backend expects zone_risk_level (string), weather_risk (float), coverage_amount (number).
 *
 * @param {string} zone_risk_level  e.g. "HIGH", "MEDIUM", "LOW"
 * @param {number} weather_risk     float 0.0–1.0
 * @param {number} coverage_amount  e.g. 2000
 * @returns {{ weekly_premium: number, risk_factor: string }}
 *
 * Usage:
 *   const { weekly_premium } = await calculatePremium('HIGH', 0.73, 2000);
 */
export const calculatePremium = async (zone_risk_level, weather_risk, coverage_amount) => {
  const response = await apiClient.post('/premium/calculate', {
    zone_risk_level,
    weather_risk,
    coverage_amount,
  });
  return response.data;
};


// ── Full Auto-Calculate (city → zone → premium) ───────────────────────────────

/**
 * Convenience function: looks up zone by city, then calculates premium.
 * This is the one-call version for the Dashboard auto-load.
 *
 * @param {string} city
 * @param {number} coverage_amount  default 2000
 * @returns {{ weekly_premium, risk_factor, zone_id, risk_level, weather_risk }}
 */
export const autoCalculatePremium = async (city, coverage_amount = 2000) => {
  const zone = await getZoneByCity(city);
  const premium = await calculatePremium(
    zone.risk_level,
    zone.weather_risk,
    coverage_amount,
  );
  return {
    weekly_premium:  premium.weekly_premium,
    risk_factor:     premium.risk_factor,
    zone_id:         zone.zone_id,
    risk_level:      zone.risk_level,
    weather_risk:    zone.weather_risk,
    coverage_amount,
  };
};


// ── Create Policy (Buy) ───────────────────────────────────────────────────────

/**
 * Purchase a new insurance policy for the worker.
 *
 * @param {number} user_id
 * @param {number} zone_id
 * @param {number} weekly_premium
 * @param {number} coverage_amount
 * @returns {{ message, policy }}
 */
export const createPolicy = async (user_id, zone_id, weekly_premium, coverage_amount) => {
  const response = await apiClient.post('/policy/create', {
    user_id,
    zone_id,
    weekly_premium,
    coverage_amount,
  });
  return response.data;
};


// ── Get Worker Policies ───────────────────────────────────────────────────────

/**
 * Fetch all policies belonging to a worker.
 *
 * @param {number} user_id
 * @returns {{ policies: Array, total: number }}
 */
export const getPolicies = async (user_id) => {
  const response = await apiClient.get(`/worker/policy/${user_id}`);
  return response.data;
};