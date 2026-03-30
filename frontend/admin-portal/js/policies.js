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
      <td>${p.zone_id}</td>
      <td>₹${parseFloat(p.weekly_premium).toFixed(2)}</td>
      <td>₹${parseFloat(p.coverage_amount).toFixed(2)}</td>
      <td><span class="badge ${STATUS_BADGE[p.status]||'badge-grey'}">${p.status}</span></td>
      <td>
        <button class="btn-view" onclick="viewPolicy(${p.policy_id})">View</button>
      </td>
    </tr>
  `).join("");
}

// Show details in a modal instead of alert
function viewPolicy(policyId) {
  const policy = allPolicies.find(p => p.policy_id === policyId);
  if (!policy) return alert("Policy not found.");

  const modal = document.getElementById("policy-modal");
  const modalContent = document.getElementById("policy-modal-content");

  modalContent.innerHTML = `
    <h3>Policy #${policy.policy_id}</h3>
    <p><strong>Zone:</strong> ${policy.zone_id}</p>
    <p><strong>Weekly Premium:</strong> ₹${parseFloat(policy.weekly_premium).toFixed(2)}</p>
    <p><strong>Coverage Amount:</strong> ₹${parseFloat(policy.coverage_amount).toFixed(2)}</p>
    <p><strong>Status:</strong> ${policy.status}</p>
  `;

  modal.style.display = "block";
}

// Close modal
function closeModal() {
  document.getElementById("policy-modal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  loadPolicies();

  // Status filter
  document.getElementById("status-filter").addEventListener("change", (e) => {
    const val      = e.target.value;
    const filtered = val === "ALL" ? allPolicies : allPolicies.filter(p => p.status === val);
    renderTable(filtered);
  });

  // Search filter
  document.getElementById("search-bar").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = !val
      ? allPolicies
      : allPolicies.filter(p =>
          String(p.policy_id).toLowerCase().includes(val) ||
          String(p.zone_id).toLowerCase().includes(val)
        );
    renderTable(filtered);
  });
});
