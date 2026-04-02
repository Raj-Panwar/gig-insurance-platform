import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import apiClient from "../src/api/apiClient";

export default function Page() {
  const [premium, setPremium] = useState(null);

  const [zoneRisk, setZoneRisk] = useState("");
  const [weatherRisk, setWeatherRisk] = useState("");
  const [coverage, setCoverage] = useState("");

  const calculatePremium = async () => {
    try {
      console.log("SENDING:", {
        zone_risk_level: zoneRisk,
        weather_risk: weatherRisk,
        coverage_amount: coverage,
      });

      const res = await apiClient.post("/premium/calculate", {
        zone_risk_level: zoneRisk,
        weather_risk: Number(weatherRisk),
        coverage_amount: Number(coverage),
      });

      console.log("API RESPONSE:", res.data);

      // handle both possible response formats
      setPremium(res.data.premium || res.data.result);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Insurance App</Text>
        <Text style={styles.subtitle}>Calculate your premium</Text>

        {/* INPUTS */}
        <TextInput
          placeholder="Zone Risk (LOW / MEDIUM / HIGH)"
          value={zoneRisk}
          onChangeText={setZoneRisk}
          style={styles.input}
        />

        <TextInput
          placeholder="Weather Risk (0 - 1)"
          value={weatherRisk}
          onChangeText={setWeatherRisk}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Coverage Amount"
          value={coverage}
          onChangeText={setCoverage}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* BUTTON */}
        <View style={{ marginTop: 20 }}>
          <Button title="Calculate Premium" onPress={calculatePremium} />
        </View>

        {/* RESULT */}
        <Text style={{ marginTop: 20, fontSize: 24 }}>
          Premium: {premium ?? "Not calculated"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
});