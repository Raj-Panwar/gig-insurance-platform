// src/services/policyService.js
// Handles all policy-related API calls:
// - Calculate premium before buying
// - Create (buy) a new policy
// - Fetch worker's existing policies

import apiClient from '../api/apiClient';


// ── Calculate Premium ─────────────────────────────────────────────────────────

/**
 * Get the weekly premium for a given zone and coverage amount.
 * Call this before showing the "Buy Policy" confirmation screen.
 *
 * @param {number} zone_id
 * @param {number} coverage_amount
 * @returns {{ weekly_premium: number }}
 *
 * Usage:
 *   const { weekly_premium } = await calculatePremium(3, 500);
 */
export const calculatePremium = async (zone_id, coverage_amount) => {
  const response = await apiClient.post('/premium/calculate', {
    zone_id,
    coverage_amount,
  });
  return response.data;  // { weekly_premium: 45 }
};


// ── Create Policy (Buy) ───────────────────────────────────────────────────────

/**
 * Purchase a new insurance policy for the worker.
 * Call calculatePremium() first to get weekly_premium.
 *
 * @param {number} user_id
 * @param {number} zone_id
 * @param {number} weekly_premium   — from calculatePremium()
 * @param {number} coverage_amount
 * @returns {{ message, policy }}
 *
 * Usage:
 *   const result = await createPolicy(1, 3, 45, 500);
 */
export const createPolicy = async (user_id, zone_id, weekly_premium, coverage_amount) => {
  const response = await apiClient.post('/policy/create', {
    user_id,
    zone_id,
    weekly_premium,
    coverage_amount,
  });
  return response.data;  // { message: "Policy created successfully.", policy: {...} }
};


// ── Get Worker Policies ───────────────────────────────────────────────────────

/**
 * Fetch all policies belonging to a worker.
 *
 * @param {number} user_id
 * @returns {{ policies: Array, total: number }}
 *
 * Usage:
 *   const { policies } = await getPolicies(1);
 */
export const getPolicies = async (user_id) => {
  const response = await apiClient.get(`/worker/policy/${user_id}`);
  return response.data;
};