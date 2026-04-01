// js/api.js
// Shared Axios instance. Load this first on every page.
// Automatically attaches JWT. Handles 401 globally.

const BASE_URL = "http://192.168.1.40:5000"; // ← update to your machine IP

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gigshield_admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        window.location.href = "/login.html";
      }
      return Promise.reject({
        status:  error.response.status,
        message: error.response.data?.error || error.response.data?.message || "Request failed.",
      });
    }
    return Promise.reject({
      status:  0,
      message: "Cannot connect to server. Make sure the backend is running.",
    });
  }
);