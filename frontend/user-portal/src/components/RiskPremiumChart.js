import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function RiskPremiumChart() {
  return (
    <View style={{ alignItems: "center" }}>
      <LineChart
        data={{
          labels: ["Low", "Med", "High"],
          datasets: [
            {
              data: [25, 35, 48],
            },
          ],
        }}
        width={screenWidth - 40}
        height={180}
        yAxisSuffix="₹"
        chartConfig={{
          backgroundGradientFrom: "#020617",
          backgroundGradientTo: "#020617",
          decimalPlaces: 0,
          color: () => "#6366F1",
          labelColor: () => "#94A3B8",
        }}
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
}