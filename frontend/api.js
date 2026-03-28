// services/api.js
import axios from 'axios';

const BASE_URL = "http://192.168.1.45:5000"; // Use your PC's IP

export const registerUser = (data) => {
  return axios.post(`${BASE_URL}/auth/register`, data);
};

export const loginUser = (data) => {
  return axios.post(`${BASE_URL}/auth/login`, data);
};

export const calculatePremium = (data) => {
  return axios.post(`${BASE_URL}/premium/calculate`, data);
};

export const buyPolicy = (data) => {
  return axios.post(`${BASE_URL}/policy/create`, data);
};

export const getMyPolicy = (userId) => {
  return axios.get(`${BASE_URL}/policy/${userId}`);
};

export const getDashboardStats = () => {
  return axios.get(`${BASE_URL}/dashboard/stats`);
};