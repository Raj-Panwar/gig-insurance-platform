// js/dashboard.js — GigShield Admin Portal

requireAdmin();

let allRecentClaims = [];

// Status badge mapping
const BADGE_CLASSES = {
  APPROVED: "badge-active",
  PENDING:  "badge-yellow",
  FLAGGED:  "badge-orange",
  REJECTED: "badge-red",
  PAID:     "badge-blue"
};

// ✅ User mapping (REAL NAMES)
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

// ✅ Format date (clean UI)
function formatDate(dateString) {
  if (!dateString) return "—";

  const d = new Date(dateString);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Load dashboard stats
 */
async function loadDashboard() {
  const loadingEl   = document.getElementById("loading");
  const statsGridEl = document.getElementById("stats-grid");

  try {
    const res = await apiClient.get("/dashboard/stats");
    const stats = res.data;

    document.getElementById("total-users").textContent     = stats.total_users ?? 0;
    document.getElementById("active-policies").textContent = stats.active_policies ?? 0;
    document.getElementById("total-claims").textContent    = stats.total_claims ?? 0;
    document.getElementById("approved-claims").textContent = stats.approved_claims ?? 0;
    document.getElementById("total-payouts").textContent   = stats.payouts ?? 0;

    loadingEl.style.display   = "none";
    statsGridEl.style.display = "grid";

    await loadRecentClaims();

  } catch (err) {
    loadingEl.textContent = `❌ ${err.message || "Failed to load dashboard stats."}`;
    statsGridEl.style.display = "none";
  }
}

/**
 * Load recent claims (latest 5)
 */
async function loadRecentClaims() {
  const section = document.getElementById("recent-section");
  const tbody   = document.getElementById("recent-tbody");

  try {
    const res = await apiClient.get("/admin/claims");
    allRecentClaims = (res.data.claims || []).slice(0, 5);

    if (!allRecentClaims.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty">No claims yet.</td>
        </tr>`;
      section.style.display = "block";
      return;
    }

    tbody.innerHTML = allRecentClaims.map(c => `
      <tr>
        <td>${c.claim_id}</td>
        <td>${USER_MAP[c.user_id] || "User"} (ID: ${c.user_id})</td>
        <td>${(c.trigger_type || "—").toUpperCase()}</td>
        <td>
          <span class="badge ${BADGE_CLASSES[c.status] || 'badge-grey'}">
            ${c.status}
          </span>
        </td>
        <td>${formatDate(c.created_at)}</td>
        <td>
          <button class="btn-view" onclick="viewClaim(${c.claim_id})">
            View
          </button>
        </td>
      </tr>
    `).join("");

    section.style.display = "block";

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">Failed to load recent claims.</td>
      </tr>`;
    section.style.display = "block";
  }
}

/**
 * View claim in modal (🔥 same style as other pages)
 */
function viewClaim(claimId) {
  const claim = allRecentClaims.find(c => c.claim_id === claimId);
  if (!claim) return;

  const modal = document.getElementById("claim-modal");
  const content = document.getElementById("claim-modal-content");

  content.innerHTML = `
    <div class="modal-header">📄 Claim Details</div>

    <div class="modal-row">
      <span class="modal-label">Claim ID</span>
      <span class="modal-value">${claim.claim_id}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Worker</span>
      <span class="modal-value">
        ${USER_MAP[claim.user_id] || "User"} (ID: ${claim.user_id})
      </span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Trigger</span>
      <span class="modal-value">${claim.trigger_type}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Status</span>
      <span class="modal-value">${claim.status}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Created At</span>
      <span class="modal-value">${formatDate(claim.created_at)}</span>
    </div>
  `;

  modal.classList.add("show");
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById("claim-modal").classList.remove("show");
}

/**
 * Close modal on ESC + outside click
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

window.addEventListener("click", (e) => {
  const modal = document.getElementById("claim-modal");
  if (e.target === modal) closeModal();
});

/**
 * Display admin profile
 */
function displayAdminProfile(adminData) {
  const nameEl = document.getElementById("admin-name");
  if (!nameEl) return;
  nameEl.textContent = adminData.name || "Admin";
}

/**
 * Init
 */
document.addEventListener("DOMContentLoaded", async () => {
  const adminData = {
    name: localStorage.getItem("adminName") || "Platform Admin"
  };

  displayAdminProfile(adminData);
  await loadDashboard();
});