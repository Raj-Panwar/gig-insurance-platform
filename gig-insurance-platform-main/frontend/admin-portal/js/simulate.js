// js/simulate.js
requireAdmin();

async function triggerEvent(endpoint, body, resultId, btnId) {
  const box = document.getElementById(resultId);
  const btn = document.getElementById(btnId);

  btn.disabled    = true;
  btn.textContent = "Triggering...";
  box.className   = "result-box";
  box.innerHTML   = "";

  try {
    const res  = await apiClient.post(endpoint, body);
    const data = res.data;

    if (data.trigger === "not_activated") {
      box.className = "result-box result-warning show";
      box.innerHTML = `⚠️ <strong>Below threshold</strong> — No claims generated.<br>
        Severity sent is below the trigger threshold for this event type.`;
    } else {
      box.className = "result-box result-success show";
      box.innerHTML = `
        ✅ <strong>${data.message || "Disruption simulated successfully."}</strong>
        <hr style="border:none;border-top:1px solid rgba(0,0,0,0.1);margin:10px 0">
        <div class="result-row"><span class="result-key">📍 Location</span><span>${body.location}</span></div>
        <div class="result-row"><span class="result-key">🗂️ Claims Created</span><span>${data.claims_created ?? 0}</span></div>
        <div class="result-row"><span class="result-key">💰 Payouts Generated</span><span>${data.payouts_generated ?? 0}</span></div>
        <div class="result-row"><span class="result-key">🚨 Fraud Flags</span><span>${data.fraud_flags ?? 0}</span></div>
        ${data.claims_rejected > 0 ? `<div class="result-row"><span class="result-key">❌ Claims Rejected</span><span>${data.claims_rejected}</span></div>` : ""}
      `;
    }
  } catch (err) {
    box.className = "result-box result-error show";
    box.textContent = "❌ Error: " + (err.message || "Simulation failed.");
  } finally {
    btn.disabled    = false;
    btn.textContent = btn.dataset.label;
  }
}

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("rain-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const location    = document.getElementById("rain-location").value.trim();
    const rainfall_mm = parseFloat(document.getElementById("rain-mm").value);
    if (!location || isNaN(rainfall_mm)) return;
    triggerEvent("/simulate/rain", { location, rainfall_mm }, "rain-result", "rain-btn");
  });

  document.getElementById("heat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const location    = document.getElementById("heat-location").value.trim();
    const temperature = parseFloat(document.getElementById("heat-temp").value);
    if (!location || isNaN(temperature)) return;
    triggerEvent("/simulate/heatwave", { location, temperature }, "heat-result", "heat-btn");
  });

  document.getElementById("pollution-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const location = document.getElementById("poll-location").value.trim();
    const aqi      = parseFloat(document.getElementById("poll-aqi").value);
    if (!location || isNaN(aqi)) return;
    triggerEvent("/simulate/pollution", { location, aqi }, "poll-result", "poll-btn");
  });

});