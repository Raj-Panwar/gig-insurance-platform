// js/policies.js
requireAdmin();
let allPolicies = [];

const STATUS_BADGE = { ACTIVE: "badge-active", EXPIRED: "badge-grey", CANCELLED: "badge-red" };

async function loadPolicies() {
  try {
    const res   = await apiClient.get("/admin/policies");
    allPolicies  = res.data.policies || [];
    document.getElementById("policy-count").textContent = `Total Policies: ${allPolicies.length}`;
    renderTable(allPolicies);
    document.getElementById("loading").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (err) {
    document.getElementById("loading").textContent = "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(policies) {
  const tbody = document.getElementById("policies-tbody");
  if (!policies.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">No policies found.</td></tr>`;
    return;
  }
  tbody.innerHTML = policies.map(p => `
    <tr>
      <td>#${p.policy_id}</td>
      <td>${p.user_id}</td>
      <td>${p.zone_id}</td>
      <td>₹${parseFloat(p.weekly_premium).toFixed(2)}</td>
      <td>₹${parseFloat(p.coverage_amount).toFixed(2)}</td>
      <td><span class="badge ${STATUS_BADGE[p.status]||'badge-grey'}">${p.status}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadPolicies();
  document.getElementById("status-filter").addEventListener("change", (e) => {
    const val      = e.target.value;
    const filtered = val === "ALL" ? allPolicies : allPolicies.filter(p => p.status === val);
    renderTable(filtered);
  });
});