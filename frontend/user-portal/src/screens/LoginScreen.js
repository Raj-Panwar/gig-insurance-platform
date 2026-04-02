// src/screens/LoginScreen.js
// Changes: OTP mock verification step added, logout fix is in navigation (replace not navigate)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants';
import { Button, Input } from '../components';
import { loginWorker } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [phone,   setPhone]   = useState('');
  // const [otp,     setOtp]     = useState('');              // 🔒 OTP state (disabled for testing)
  // const [step,    setStep]    = useState('phone');         // 🔒 Step state (disabled for testing)
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // 🔒 Step 1 — send OTP (disabled for testing)
  /*
  const handleSendOtp = () => {
    setError('');
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    Alert.alert('OTP Sent', 'Your OTP is: 1234 (demo mode)');
    setStep('otp');
  };
  */

  // 🔒 Step 2 — verify OTP and login (disabled for testing)
  /*
  const handleVerifyOtp = async () => {
    setError('');
    if (otp.trim() !== '1234') {
      setError('Invalid OTP. Use 1234 for demo.');
      return;
    }
    setLoading(true);
    try {
      await loginWorker(phone.trim());
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err?.message || 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };
  */

  // ✅ Direct login without OTP (temporary for testing)
  const handleLogin = async () => {
    setError('');
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      await loginWorker(phone.trim());
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err?.message || 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.shield}>🛡️</Text>
          <Text style={styles.brand}>GigShield</Text>
          <Text style={styles.tagline}>Welcome back, partner</Text>
        </View>

        <View style={[styles.card, SHADOW.lg]}>
          <Text style={styles.cardTitle}>Login</Text>
          <Text style={styles.cardSubtitle}>
            {/* 🔒 Original: step-based subtitle */}
            {/* {step === 'phone' ? 'Enter your registered phone number' : 'Enter the OTP sent to your phone'} */}
            Enter your registered phone number
          </Text>

          {/* 🔒 Original step-based UI commented out */}
          {/*
          {step === 'phone' ? (
            <>
              <Input ... />
              <Button title="Send OTP" onPress={handleSendOtp} ... />
            </>
          ) : (
            <>
              <Text style={styles.phoneDisplay}>📱 {phone}</Text>
              <Input ... />
              <Button title="Verify & Login" onPress={handleVerifyOtp} ... />
              <TouchableOpacity ... />
            </>
          )}
          */}

          {/* ✅ Temporary direct login UI */}
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
            maxLength={10}
            error={error}
          />
          <Button title="Login" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              New gig worker? <Text style={styles.registerBold}>Register here →</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flexGrow: 1, backgroundColor: COLORS.primary, paddingBottom: 40 },
  header:        { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  shield:        { fontSize: 52, marginBottom: 12 },
  brand:         { fontSize: 32, fontWeight: FONTS.extrabold, color: COLORS.white, letterSpacing: 1 },
  tagline:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  card:          { backgroundColor: COLORS.white, borderRadius: 28, marginHorizontal: 20, padding: 28 },
  cardTitle:     { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  cardSubtitle:  { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
  loginBtn:      { marginTop: 4 },
  phoneDisplay:  { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.primary,
                   backgroundColor: COLORS.background, padding: 12, borderRadius: RADIUS.md, marginBottom: 16 },
  backLink:      { marginTop: 12, alignItems: 'center' },
  backText:      { fontSize: 13, color: COLORS.textLight },
  registerLink:  { marginTop: 20, alignItems: 'center' },
  registerText:  { fontSize: 14, color: COLORS.textLight },
  registerBold:  { color: COLORS.primary, fontWeight: FONTS.bold },
});
