// js/claims.js
requireAdmin();
let allClaims = [];

const USER_MAP = {
  2: "Amit",
  3: "Priya",
  4: "Rahul",
  5: "Sneha",
  6: "Karan",
  7: "Ananya",
  8: "Vikram",
  9: "Isha",
  10: "Rohan",
  11: "Meera"
};

const STATUS_BADGE = {
  APPROVED: "badge-active",
  PENDING: "badge-yellow",
  FLAGGED: "badge-orange",
  REJECTED: "badge-red",
  PAID: "badge-blue"
};

function getUserDisplay(user, userId) {
  // If backend gives name → use it
  if (user && user.name) return user.name;

  // Otherwise use your mapping
  if (USER_MAP[userId]) return USER_MAP[userId];

  // Final fallback
  return `User ${userId}`;
}

async function loadClaims() {
  try {
    const res = await apiClient.get("/admin/claims");
    allClaims = res.data.claims || [];

    document.getElementById("claim-count").textContent =
      `Total Claims: ${allClaims.length}`;

    renderTable(allClaims);

    document.getElementById("loading").style.display = "none";
    document.getElementById("content").style.display = "block";

  } catch (err) {
    document.getElementById("loading").textContent =
      "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(claims) {
  const tbody = document.getElementById("claims-tbody");

  if (!claims.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">
          No claims found. Go to Simulate to trigger a disruption.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = claims.map(c => `
    <tr>
      <!-- ❌ Removed # -->
      <td>${c.claim_id}</td>

      <!-- ✅ Clean user display -->
      <td>${getUserDisplay(c.user, c.user_id)}</td>

      <!-- ❌ Removed Policy ID column -->

      <!-- ❌ Removed Trigger Type from table -->

      <td>
        <span class="badge ${STATUS_BADGE[c.status] || 'badge-grey'}">
          ${c.status}
        </span>
      </td>

      <!-- ❌ Removed Created At -->

      <td>
        <button class="btn-view" onclick="viewClaim(${c.claim_id})">
          View
        </button>

        ${c.status === "PENDING"
          ? `<button class="process-btn" onclick="processPayout(${c.claim_id}, this)">
               Process
             </button>`
          : ``
        }
      </td>
    </tr>
  `).join("");
}

function viewClaim(claimId) {
  const claim = allClaims.find(c => c.claim_id === claimId);
  if (!claim) return;

  const modal = document.getElementById("claim-modal");
  const modalContent = document.getElementById("claim-modal-content");

  modalContent.innerHTML = `
    <div class="modal-header">📄 Claim Details</div>

    <div class="modal-row">
      <span class="modal-label">Claim ID</span>
      <span class="modal-value">${claim.claim_id}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">User</span>
      <span class="modal-value">
      ${getUserDisplay(claim.user, claim.user_id)} (ID: ${claim.user_id})
      </span>
    </div>

    <!-- ✅ Moved Policy ID here -->
    <div class="modal-row">
      <span class="modal-label">Policy ID</span>
      <span class="modal-value">${claim.policy_id}</span>
    </div>

    <!-- ✅ Moved Trigger Type here -->
    <div class="modal-row">
      <span class="modal-label">Trigger Type</span>
      <span class="modal-value">${claim.trigger_type?.toUpperCase()}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Status</span>
      <span class="modal-value">${claim.status}</span>
    </div>

    <!-- ✅ Moved Created At here -->
    <div class="modal-row">
      <span class="modal-label">Created At</span>
      <span class="modal-value">
        ${claim.created_at
          ? new Date(claim.created_at).toLocaleString()
          : "—"}
      </span>
    </div>
  `;

  modal.classList.add("show");
}

function closeModal() {
  document.getElementById("claim-modal").classList.remove("show");
}

async function processPayout(claimId, btn) {
  if (!confirm(`Process payout for Claim ${claimId}?`)) return;

  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    const res = await apiClient.post("/payout/process", {
      claim_id: claimId
    });

    const txn = res.data?.transaction;

    alert(`✅ Payout processed!
Transaction: ${txn?.transaction_id}
Amount: ₹${txn?.amount}
Method: ${txn?.method}`);

    loadClaims();

  } catch (err) {
    alert("❌ " + (err.message || "Payout failed."));
    btn.disabled = false;
    btn.textContent = "Process";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadClaims();

  // Status filter
  document.getElementById("status-filter").addEventListener("change", (e) => {
    const val = e.target.value;

    const filtered =
      val === "ALL"
        ? allClaims
        : allClaims.filter(c => c.status === val);

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

  // ✅ Close modal on outside click
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("claim-modal");
    if (e.target === modal) closeModal();
  });

  // ✅ Close modal on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});