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
      <td>${c.user?.name || "Unknown"} (ID: ${c.user_id})</td>
      <td>#${c.policy_id}</td>
      <td>${c.trigger_type?.toUpperCase()}</td>
      <td><span class="badge ${STATUS_BADGE[c.status]||'badge-grey'}">${c.status}</span></td>
      <td>${c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</td>
      <td>
        <button class="btn-view" onclick="viewClaim(${c.claim_id})">View</button>
        ${c.status === "PENDING"
          ? `<button class="process-btn" onclick="processPayout(${c.claim_id}, this)">Process Payout</button>`
          : `<span class="text-muted">—</span>`
        }
      </td>
    </tr>
  `).join("");
}

function viewClaim(claimId) {
  const claim = allClaims.find(c => c.claim_id === claimId);
  if (!claim) return alert("Claim not found.");

  const modal = document.getElementById("claim-modal");
  const modalContent = document.getElementById("claim-modal-content");

  modalContent.innerHTML = `
    <h3>Claim #${claim.claim_id}</h3>
    <p><strong>User:</strong> ${claim.user?.name || "Unknown"} (ID: ${claim.user_id})</p>
    <p><strong>Policy ID:</strong> #${claim.policy_id}</p>
    <p><strong>Trigger Type:</strong> ${claim.trigger_type}</p>
    <p><strong>Status:</strong> ${claim.status}</p>
    <p><strong>Created At:</strong> ${claim.created_at ? new Date(claim.created_at).toLocaleString() : "—"}</p>
  `;

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("claim-modal").style.display = "none";
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

  // Status filter
  document.getElementById("status-filter").addEventListener("change", (e) => {
    const val      = e.target.value;
    const filtered = val === "ALL" ? allClaims : allClaims.filter(c => c.status === val);
    renderTable(filtered);
  });

  // Search filter
  document.getElementById("search-bar").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = !val
      ? allClaims
      : allClaims.filter(c =>
          String(c.claim_id).toLowerCase().includes(val) ||
          String(c.user_id).toLowerCase().includes(val) ||
          (c.user?.name || "").toLowerCase().includes(val) ||
          String(c.policy_id).toLowerCase().includes(val) ||
          (c.trigger_type || "").toLowerCase().includes(val)
        );
    renderTable(filtered);
  });
});
