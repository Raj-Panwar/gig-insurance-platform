import axios from "axios";

export const calculatePremiumAPI = async () => {
  return { premium: Math.floor(Math.random() * 50) + 20 };
};