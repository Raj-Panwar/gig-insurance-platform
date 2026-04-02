// src/services/policyService.js
import apiClient from '../api/apiClient';

// ── Calculate Premium ─────────────────────────────────────────────────────────
// Backend expects: zone_risk_level ("LOW"/"MEDIUM"/"HIGH"), weather_risk (0-1), coverage_amount
export const calculatePremium = async (zone_risk_level, coverage_amount) => {
  const res = await apiClient.post('/premium/calculate', {
    zone_risk_level,
    weather_risk:    0.5,   // default moderate — real weather API in Phase 3
    coverage_amount,
  });
  return res.data; // { weekly_premium, risk_factor }
};

// ── Create Policy ─────────────────────────────────────────────────────────────
// Backend expects: user_id, zone_id, weekly_premium, coverage_amount
export const createPolicy = async (user_id, zone_id, weekly_premium, coverage_amount, policy_type = 'standard') => {
  const res = await apiClient.post('/policy/create', {
    user_id,
    zone_id,
    weekly_premium,
    coverage_amount,
  });
  return res.data; // { message, policy }
};

// ── Get Worker Policy ─────────────────────────────────────────────────────────
// Backend returns: { active_policy, policy_id, weekly_premium, coverage_amount, status, start_date }
export const getWorkerPolicy = async (user_id) => {
  const res = await apiClient.get(`/worker/policy/${user_id}`);
  return res.data;
};