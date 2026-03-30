// js/payouts.js
requireAdmin();
let allPayouts = [];

async function loadPayouts() {
  try {
    const res   = await apiClient.get("/dashboard/payouts");
    allPayouts   = res.data.payouts || [];
    const total  = res.data.total_payout || 0;

    document.getElementById("total-amount").textContent  = `₹${parseFloat(total).toFixed(2)}`;
    document.getElementById("total-count").textContent   = allPayouts.length;
    document.getElementById("processed-count").textContent =
      allPayouts.filter(p => p.status === "PROCESSED").length;

    renderTable(allPayouts);
    document.getElementById("loading").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (err) {
    document.getElementById("loading").textContent = "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(payouts) {
  const tbody = document.getElementById("payouts-tbody");
  if (!payouts.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">No payouts yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = payouts.map(p => `
    <tr>
      <td><code>${p.claim_id}</code></td>
      <td>${p.user_id}</td>
      <td><strong>₹${parseFloat(p.payout_amount).toFixed(2)}</strong></td>
      <td><span class="badge badge-active">PROCESSED</span></td>
      <td>${p.processed_at || "—"}</td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadPayouts);