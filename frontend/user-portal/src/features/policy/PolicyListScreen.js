// 📂 src/features/policy/PolicyScreen.js

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function PolicyScreen() {

  // ✅ MOCK DATA (SAFE)
  const [policies] = useState([
    {
      id: "P1023",
      user: "Ravi Kumar",
      zoneName: "Delhi NCR",
      premium: 35,
      coverage: 1000,
    },
    {
      id: "P1024",
      user: "Amit Singh",
      zoneName: "Mumbai Central",
      premium: 42,
      coverage: 1200,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // ✅ SEARCH FILTER
  const filteredPolicies = policies.filter(
    (p) =>
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617", padding: 20 }}>

      {/* HEADER */}
      <Text style={{
        color: "#E2E8F0",
        fontSize: 28,
        fontWeight: "700"
      }}>
        📑 Policies
      </Text>

      {/* SEARCH */}
      <View style={{
        marginTop: 16,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}>
        <TextInput
          placeholder="Search by user or ID..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          style={{ color: "#fff" }}
        />
      </View>

      {/* LIST */}
      {filteredPolicies.map((policy, index) => (
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
          {/* TOP */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <View>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {policy.user}
              </Text>

              {/* ✅ NO HASH SYMBOL */}
              <Text style={{ color: "#64748B", fontSize: 12 }}>
                ID: {policy.id}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPolicy(policy)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 10,
                backgroundColor: "#6366F1",
                shadowColor: "#6366F1",
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                View
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ SHOW ZONE NAME (NOT ID) */}
          <Text style={{ color: "#94A3B8", marginTop: 6 }}>
            Zone: {policy.zoneName}
          </Text>

          <Text style={{ color: "#22C55E", marginTop: 4 }}>
            ₹{policy.premium}/week
          </Text>
        </Animated.View>
      ))}

      {/* MODAL */}
      <Modal visible={!!selectedPolicy} transparent animationType="fade">
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

            {selectedPolicy && (
              <>
                <Text style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "700"
                }}>
                  Policy Details
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 10 }}>
                  User: {selectedPolicy.user}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Policy ID: {selectedPolicy.id}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Zone: {selectedPolicy.zoneName}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Premium: ₹{selectedPolicy.premium}/week
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Coverage: ₹{selectedPolicy.coverage}
                </Text>

                {/* CLOSE */}
                <TouchableOpacity
                  onPress={() => setSelectedPolicy(null)}
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