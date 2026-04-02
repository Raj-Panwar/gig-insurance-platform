// 📂 src/features/workers/WorkersScreen.js

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function WorkersScreen() {

  // ✅ MOCK DATA (replace with API later — SAFE)
  const [workers] = useState([
    {
      id: "W101",
      name: "Ravi Kumar",
      email: "ravi@example.com",
      location: "Delhi",
    },
    {
      id: "W102",
      name: "Amit Singh",
      email: "amit@example.com",
      location: "Mumbai",
    },
    {
      id: "W103",
      name: "Priya Sharma",
      email: "priya@example.com",
      location: "Bangalore",
    },
  ]);

  // ✅ SEARCH STATE
  const [search, setSearch] = useState("");

  // ✅ VIEW MODAL
  const [selectedWorker, setSelectedWorker] = useState(null);

  // ✅ FILTER LOGIC (name + id)
  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617", padding: 20 }}>

      {/* HEADER */}
      <Text style={{
        color: "#E2E8F0",
        fontSize: 28,
        fontWeight: "700"
      }}>
        👷 Workers
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
          placeholder="Search by name or ID..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          style={{ color: "#fff" }}
        />
      </View>

      {/* LIST */}
      {filteredWorkers.map((worker, index) => (
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
                {worker.name}
              </Text>

              <Text style={{ color: "#64748B", fontSize: 12 }}>
                ID: {worker.id}
              </Text>
            </View>

            {/* VIEW BUTTON */}
            <TouchableOpacity
              onPress={() => setSelectedWorker(worker)}
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

          {/* EMAIL */}
          <Text style={{
            color: "#94A3B8",
            marginTop: 6
          }}>
            {worker.email}
          </Text>
        </Animated.View>
      ))}

      {/* MODAL */}
      <Modal visible={!!selectedWorker} transparent animationType="fade">
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

            {selectedWorker && (
              <>
                <Text style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "700"
                }}>
                  Worker Details
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 10 }}>
                  Name: {selectedWorker.name}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  ID: {selectedWorker.id}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Email: {selectedWorker.email}
                </Text>

                <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                  Location: {selectedWorker.location}
                </Text>

                {/* CLOSE */}
                <TouchableOpacity
                  onPress={() => setSelectedWorker(null)}
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