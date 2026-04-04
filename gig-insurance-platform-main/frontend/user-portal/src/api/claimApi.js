import apiClient from "./apiClient";

// 🔥 Trigger Claim API
export const triggerClaim = async (event, user_id) => {
  console.log("🚀 Calling Trigger API");

  try {
    const response = await apiClient.post("/trigger/event", {
      event,
      user_id,
    });

    console.log("✅ API RESPONSE:", response.data);

    return response.data;

  } catch (error) {
    console.log("❌ API ERROR:", error);
    return error;
  }
};