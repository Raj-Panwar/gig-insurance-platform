// js/dashboard.js
requireAdmin();

async function loadDashboard() {
  try {
    const res = await apiClient.get("/dashboard/stats");
    const d   = res.data;

    document.getElementById("total-users").textContent     = d.total_users     ?? 0;
    document.getElementById("active-policies").textContent  = d.active_policies  ?? 0;
    document.getElementById("total-claims").textContent    = d.total_claims    ?? 0;
    document.getElementById("approved-claims").textContent = d.approved_claims ?? 0;
    document.getElementById("total-payouts").textContent   = d.total_payouts   ?? 0;

    document.getElementById("loading").style.display    = "none";
    document.getElementById("stats-grid").style.display = "grid";

    // Load recent claims for quick view
    loadRecentClaims();
  } catch (err) {
    document.getElementById("loading").textContent = "❌ " + (err.message || "Failed to load.");
  }
}

async function loadRecentClaims() {
  try {
    const res    = await apiClient.get("/admin/claims");
    const claims = (res.data.claims || []).slice(0, 5); // last 5
    const tbody  = document.getElementById("recent-tbody");

    if (!claims.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty">No claims yet. Try simulating a disruption.</td></tr>`;
      return;
    }

    const BADGE = { APPROVED:"badge-active", PENDING:"badge-yellow", FLAGGED:"badge-orange", REJECTED:"badge-red", PAID:"badge-blue" };
    tbody.innerHTML = claims.map(c => `
      <tr>
        <td>#${c.claim_id}</td>
        <td>User ${c.user_id}</td>
        <td>${c.trigger_type?.toUpperCase()}</td>
        <td><span class="badge ${BADGE[c.status]||'badge-grey'}">${c.status}</span></td>
        <td>${c.created_at || "—"}</td>
      </tr>
    `).join("");

    document.getElementById("recent-section").style.display = "block";
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", loadDashboard);