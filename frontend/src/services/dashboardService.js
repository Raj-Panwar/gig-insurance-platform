// src/services/dashboardService.js
// Handles all dashboard-related API calls:
// - Worker overview summary
// - Claims history
// - Payout history

import apiClient from '../api/apiClient';


// ── Worker Dashboard Summary ──────────────────────────────────────────────────

/**
 * Fetch the worker's insurance overview.
 * Used on the main dashboard/home screen.
 *
 * @param {number} user_id
 * @returns {{
 *   user_id, name, active_policy,
 *   weekly_premium, coverage_amount,
 *   total_claims, total_payout
 * }}
 *
 * Usage:
 *   const dashboard = await getWorkerDashboard(1);
 */
export const getWorkerDashboard = async (user_id) => {
  const response = await apiClient.get(`/worker/dashboard/${user_id}`);
  return response.data;
};


// ── Worker Claims ─────────────────────────────────────────────────────────────

/**
 * Fetch all claims filed for the worker.
 * Shows claim status: APPROVED / PENDING / FLAGGED / REJECTED.
 *
 * @param {number} user_id
 * @returns {{ user_id, total_claims, claims: Array }}
 *
 * Each claim:
 * {
 *   claim_id, event_type, status,
 *   amount, created_at
 * }
 *
 * Usage:
 *   const { claims } = await getWorkerClaims(1);
 */
export const getWorkerClaims = async (user_id) => {
  const response = await apiClient.get(`/worker/claims/${user_id}`);
  return response.data;
};


// ── Worker Payouts ────────────────────────────────────────────────────────────

/**
 * Fetch the full payout history for the worker.
 *
 * @param {number} user_id
 * @returns {{ user_id, total_payouts, total_amount, payouts: Array }}
 *
 * Each payout:
 * {
 *   transaction_id, amount,
 *   status, processed_at
 * }
 *
 * Usage:
 *   const { payouts, total_amount } = await getWorkerPayouts(1);
 */
export const getWorkerPayouts = async (user_id) => {
  const response = await apiClient.get(`/worker/payouts/${user_id}`);
  return response.data;
};