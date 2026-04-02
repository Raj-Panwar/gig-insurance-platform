import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

export default function PolicyScreen({ navigation }) {
  const plans = [
    {
      id: 1,
      name: "Basic Shield",
      price: "₹29/week",
      coverage: "Up to ₹500 payout",
      color: "#22C55E",
    },
    {
      id: 2,
      name: "Pro Shield",
      price: "₹39/week",
      coverage: "Up to ₹1000 payout",
      color: "#6366F1",
    },
    {
      id: 3,
      name: "Elite Shield",
      price: "₹49/week",
      coverage: "Up to ₹2000 payout",
      color: "#F59E0B",
    },
  ];

  const handleSelect = (plan) => {
    // 👉 keep navigation safe
    navigation.navigate("Premium", { selectedPlan: plan });
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Protect your income with AI-powered insurance
        </Text>
      </Animated.View>

      {/* PLANS */}
      {plans.map((plan, index) => (
        <Animated.View
          key={plan.id}
          entering={FadeInDown.delay(200 + index * 100)}
          style={[styles.card, { borderColor: plan.color }]}
        >
          <Text style={styles.planName}>{plan.name}</Text>

          <Text style={styles.price}>{plan.price}</Text>

          <Text style={styles.coverage}>{plan.coverage}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: plan.color }]}
            onPress={() => handleSelect(plan)}
          >
            <Text style={styles.buttonText}>Select Plan</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    color: "#111827",
  },
  coverage: {
    marginTop: 6,
    color: "#64748B",
  },
  button: {
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});