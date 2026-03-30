// js/auth.js
// Auth helpers. Load after api.js on every page.

function requireAdmin() {
  if (!localStorage.getItem("gigshield_admin_token")) {
    window.location.href = "/login.html";
  }
  // Show admin name in navbar if element exists
  const el = document.getElementById("admin-name");
  if (el) el.textContent = localStorage.getItem("gigshield_admin_name") || "Admin";
}

function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}

async function handleLogin(phone) {
  try {
    const res = await apiClient.post("/auth/login", { phone });
    const { token, user_id, role, user } = res.data;
    if (role !== "admin") {
      return { success: false, message: "Access denied. Admin accounts only." };
    }
    localStorage.setItem("gigshield_admin_token", token);
    localStorage.setItem("gigshield_admin_id",    String(user_id));
    localStorage.setItem("gigshield_admin_name",  user?.name || "Admin");
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Login failed. Check phone number." };
  }
}