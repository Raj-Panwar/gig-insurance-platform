// js/payouts.js
requireAdmin();
let allPayouts = [];

// ✅ USER MAP
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

function getUserName(id) {
  return USER_MAP[id] || `User ${id}`;
}

async function loadPayouts() {
  try {
    const res = await apiClient.get("/dashboard/payouts");

    allPayouts = res.data.payouts || [];
    const total = res.data.total_payout || 0;

    document.getElementById("total-amount").textContent =
      `₹${parseFloat(total).toFixed(2)}`;

    document.getElementById("total-count").textContent =
      allPayouts.length;

    document.getElementById("processed-count").textContent =
      allPayouts.filter(p => p.status === "PROCESSED").length;

    renderTable(allPayouts);

    document.getElementById("loading").style.display = "none";
    document.getElementById("content").style.display = "block";

  } catch (err) {
    document.getElementById("loading").textContent =
      "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(payouts) {
  const tbody = document.getElementById("payouts-tbody");

  if (!payouts.length) {
    tbody.innerHTML =
      `<tr><td colspan="5" class="empty">No payouts yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = payouts.map(p => `
    <tr>
      <!-- Claim ID -->
      <td>${p.claim_id}</td>

      <!-- ❌ Removed User ID column -->

      <!-- Amount -->
      <td><strong>₹${parseFloat(p.payout_amount).toFixed(2)}</strong></td>

      <!-- Status -->
      <td>
        <span class="badge badge-active">PROCESSED</span>
      </td>

      <!-- ✅ Date + Time -->
      <td>
        ${p.processed_at
          ? new Date(p.processed_at).toLocaleString()
          : "—"}
      </td>

      <!-- ✅ View Button -->
      <td>
        <button class="btn-view" onclick="viewPayout(${p.claim_id})">
          View
        </button>
      </td>
    </tr>
  `).join("");
}

// ✅ VIEW POPUP
function viewPayout(claimId) {
  const payout = allPayouts.find(p => p.claim_id === claimId);
  if (!payout) return;

  const modal = document.getElementById("payout-modal");
  const content = document.getElementById("payout-modal-content");

  content.innerHTML = `
    <div class="modal-header">💰 Payout Details</div>

    <div class="modal-row">
      <span class="modal-label">Claim ID</span>
      <span class="modal-value">${payout.claim_id}</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">User</span>
      <span class="modal-value">
        ${getUserName(payout.user_id)} (ID: ${payout.user_id})
      </span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Amount</span>
      <span class="modal-value">
        ₹${parseFloat(payout.payout_amount).toFixed(2)}
      </span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Status</span>
      <span class="modal-value">PROCESSED</span>
    </div>

    <div class="modal-row">
      <span class="modal-label">Processed At</span>
      <span class="modal-value">
        ${payout.processed_at
          ? new Date(payout.processed_at).toLocaleString()
          : "—"}
      </span>
    </div>
  `;

  modal.classList.add("show");
}

// ✅ CLOSE MODAL
function closeModal() {
  document.getElementById("payout-modal").classList.remove("show");
}

// ✅ CLOSE ON OUTSIDE CLICK
window.addEventListener("click", (e) => {
  const modal = document.getElementById("payout-modal");
  if (e.target === modal) closeModal();
});

// ✅ CLOSE ON ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", loadPayouts);