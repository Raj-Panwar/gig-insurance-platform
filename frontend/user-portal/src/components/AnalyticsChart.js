import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsChart() {
  return (
    <View style={{ alignItems: "center" }}>
      <LineChart
        data={{
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            {
              data: [200, 450, 300, 600, 500],
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
          color: (opacity = 1) => `rgba(34,197,94, ${opacity})`,
          labelColor: () => "#94A3B8",
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
}