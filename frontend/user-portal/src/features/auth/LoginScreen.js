import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // ✅ NEW
  const [otp, setOtp] = useState(""); // ✅ NEW
  const [showOtp, setShowOtp] = useState(false); // ✅ NEW

  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState(""); // ✅ NEW

  // ✅ VALIDATION FUNCTIONS
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ STEP 1: SEND OTP
  const handleSendOtp = () => {
    let valid = true;

    if (!isValidPhone(phone)) {
      setPhoneError("Enter valid 10-digit phone number");
      valid = false;
    } else setPhoneError("");

    if (!isValidEmail(email)) {
      setEmailError("Enter valid email");
      valid = false;
    } else setEmailError("");

    if (!valid) return;

    // 👉 MOCK OTP FLOW (no backend change)
    setShowOtp(true);
  };

  // ✅ STEP 2: VERIFY OTP
  const handleVerifyOtp = () => {
    if (otp.length !== 4) return;

    // 👉 MOCK SUCCESS
    navigation.replace("Dashboard");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Continue to GigShield AI
        </Text>
      </Animated.View>

      {/* PHONE INPUT */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            setPhone(cleaned);
          }}
          placeholder="Enter your phone"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
        />
        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : null}
      </Animated.View>

      {/* EMAIL INPUT (NEW) */}
      <Animated.View entering={FadeInDown.delay(250)}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          style={styles.input}
        />
        {emailError ? (
          <Text style={styles.errorText}>{emailError}</Text>
        ) : null}
      </Animated.View>

      {/* OTP INPUT (NEW — CONDITIONAL) */}
      {showOtp && (
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.label}>Enter OTP</Text>
          <TextInput
            value={otp}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setOtp(cleaned);
            }}
            placeholder="4-digit OTP"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={4}
            style={styles.input}
          />
        </Animated.View>
      )}

      {/* BUTTON */}
      <Animated.View entering={FadeInDown.delay(400)}>
        {!showOtp ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Verify & Continue</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* FOOTER */}
      <Animated.View entering={FadeIn.delay(600)}>
        <Text style={styles.footer}>
          Secure login powered by AI
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 8,
    fontSize: 14,
  },
  label: {
    color: "#64748B",
    marginTop: 30,
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    color: "#0F172A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  errorText: {
    color: "red",
    marginTop: 6,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#6366F1",
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
  },
});