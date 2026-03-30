// js/workers.js
requireAdmin();
let allWorkers = [];

async function loadWorkers() {
  try {
    const res  = await apiClient.get("/admin/workers");
    allWorkers  = res.data || [];
    document.getElementById("worker-count").textContent = `Total Workers: ${allWorkers.length}`;
    renderTable(allWorkers);
    document.getElementById("loading").style.display  = "none";
    document.getElementById("content").style.display  = "block";
  } catch (err) {
    document.getElementById("loading").textContent = "❌ " + (err.message || "Failed to load.");
  }
}

function renderTable(workers) {
  const tbody = document.getElementById("workers-tbody");
  if (!workers.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">No workers registered yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = workers.map(w => `
    <tr>
      <td>${w.user_id}</td>
      <td>${w.name}</td>
      <td>${w.email || "—"}</td>
      <td><span class="badge badge-active">${w.role?.toUpperCase()}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadWorkers();
  document.getElementById("search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    renderTable(allWorkers.filter(w => w.name.toLowerCase().includes(q)));
  });
});