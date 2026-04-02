// 📂 src/features/claims/ClaimsScreen.js

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function ClaimsScreen() {
  // ✅ MOCK DATA (SAFE — replace with API later)
  const [claims] = useState([
    {
      id: "C1023",
      user: "Ravi Kumar",
      event: "Heavy Rain",
      payout: 500,
      createdAt: new Date(),
      status: "APPROVED",
    },
    {
      id: "C1024",
      user: "Amit Singh",
      event: "AQI Spike",
      payout: 300,
      createdAt: new Date(),
      status: "APPROVED",
    },
  ]);

  // ✅ VIEW MODAL STATE
  const [selectedClaim, setSelectedClaim] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617", padding: 20 }}>

      {/* HEADER */}
      <Text style={{
        color: "#E2E8F0",
        fontSize: 28,
        fontWeight: "700"
      }}>
        📄 Claims
      </Text>

      {/* CLAIM LIST */}
      {claims.map((claim, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * 100)}
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            padding: 16,
            borderRadius: 18,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {/* TOP ROW */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {claim.user}
            </Text>

            <Text style={{ color: "#22C55E", fontWeight: "700" }}>
              ₹{claim.payout}
            </Text>
          </View>

          {/* EVENT */}
          <Text style={{
            color: "#94A3B8",
            marginTop: 6
          }}>
            {claim.event}
          </Text>

          {/* STATUS */}
          <Text style={{
            color: "#22C55E",
            marginTop: 4,
            fontSize: 12
          }}>
            ● {claim.status}
          </Text>

          {/* VIEW BUTTON */}
          <TouchableOpacity
            onPress={() => setSelectedClaim(claim)}
            style={{
              marginTop: 12,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: "#6366F1",
              shadowColor: "#6366F1",
              shadowOpacity: 0.4,
              shadowRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              View Details
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* MODAL */}
      <Modal visible={!!selectedClaim} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          padding: 20
        }}>
          <View style={{
            backgroundColor: "#020617",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)"
          }}>

            {selectedClaim && (
              <>
                <Text style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "700"
                }}>
                  Claim Details
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 10 }}>
                  User: {selectedClaim.user}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Event: {selectedClaim.event}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Status: {selectedClaim.status}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Payout: ₹{selectedClaim.payout}
                </Text>

                {/* ✅ CREATED AT MOVED HERE */}
                <Text style={{ color: "#64748B", marginTop: 10 }}>
                  {formatDate(selectedClaim.createdAt)}
                </Text>

                {/* CLOSE BUTTON */}
                <TouchableOpacity
                  onPress={() => setSelectedClaim(null)}
                  style={{
                    marginTop: 20,
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <Text style={{ color: "#fff" }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}