// js/claims.js
requireAdmin();
let allClaims = [];

const STATUS_BADGE = {
  APPROVED: "badge-active", PENDING: "badge-yellow",
  FLAGGED:  "badge-orange", REJECTED: "badge-red", PAID: "badge-blue"
};

async function loadClaims() {
  try {
    const res  = await apiClient.get("/admin/claims");
    allClaims   = res.data.claims || [];
    document.getElementById("claim-count").textContent = `Total Claims: ${allClaims.length}`;
    renderTable(allClaims);
    document.getElementById("loading").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (err) {
    document.getElementById("loading").textContent = "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(claims) {
  const tbody = document.getElementById("claims-tbody");
  if (!claims.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">No claims found. Go to Simulate to trigger a disruption.</td></tr>`;
    return;
  }
  tbody.innerHTML = claims.map(c => `
    <tr>
      <td>#${c.claim_id}</td>
      <td>${c.user_id}</td>
      <td>#${c.policy_id}</td>
      <td>${c.trigger_type?.toUpperCase()}</td>
      <td><span class="badge ${STATUS_BADGE[c.status]||'badge-grey'}">${c.status}</span></td>
      <td>${c.created_at || "—"}</td>
      <td>
        ${c.status === "PENDING"
          ? `<button class="process-btn" onclick="processPayout(${c.claim_id}, this)">Process Payout</button>`
          : `<span class="text-muted">—</span>`
        }
      </td>
    </tr>
  `).join("");
}

async function processPayout(claimId, btn) {
  if (!confirm(`Process payout for Claim #${claimId}?`)) return;
  btn.disabled    = true;
  btn.textContent = "Processing...";
  try {
    const res = await apiClient.post("/payout/process", { claim_id: claimId });
    const txn = res.data?.transaction;
    alert(`✅ Payout processed!\nTransaction: ${txn?.transaction_id}\nAmount: ₹${txn?.amount}\nMethod: ${txn?.method}`);
    loadClaims(); // refresh table
  } catch (err) {
    alert("❌ " + (err.message || "Payout failed."));
    btn.disabled    = false;
    btn.textContent = "Process Payout";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadClaims();
  document.getElementById("status-filter").addEventListener("change", (e) => {
    const val      = e.target.value;
    const filtered = val === "ALL" ? allClaims : allClaims.filter(c => c.status === val);
    renderTable(filtered);
  });
});