// src/services/dashboardService.js
import apiClient from '../api/apiClient';

// ── Worker Dashboard ──────────────────────────────────────────────────────────
// GET /worker/dashboard/<user_id>
// Returns: { user_id, name, active_policy, weekly_premium, coverage_amount, total_claims, total_payout }
export const getWorkerDashboard = async (user_id) => {
  const res = await apiClient.get(`/worker/dashboard/${user_id}`);
  return res.data;
};

// ── Worker Claims ─────────────────────────────────────────────────────────────
// GET /worker/claims/<user_id>
// Returns: { user_id, total_claims, claims: [{ claim_id, trigger_type, status, payout_amount, created_at }] }
// NOTE: backend field is "trigger_type" NOT "event_type"
export const getWorkerClaims = async (user_id) => {
  const res = await apiClient.get(`/worker/claims/${user_id}`);
  return res.data;
};

// ── Worker Payouts ────────────────────────────────────────────────────────────
// GET /worker/payouts/<user_id>
// Returns: { user_id, total_payouts, total_amount, payouts: [{ transaction_id, amount, status, processed_at }] }
// NOTE: no "method" field in response — backend does not return it here
export const getWorkerPayouts = async (user_id) => {
  const res = await apiClient.get(`/worker/payouts/${user_id}`);
  return res.data;
};