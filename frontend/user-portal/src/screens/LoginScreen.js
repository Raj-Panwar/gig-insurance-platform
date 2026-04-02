// src/screens/LoginScreen.js
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
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleLogin = async () => {
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (phone.trim().length < 10) { setError('Enter a valid 10-digit phone number.'); return; }

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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.shield}>🛡️</Text>
          <Text style={styles.brand}>GigShield</Text>
          <Text style={styles.tagline}>Welcome back, partner</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, SHADOW.lg]}>
          <Text style={styles.cardTitle}>Login</Text>
          <Text style={styles.cardSubtitle}>Enter your registered phone number</Text>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
            maxLength={10}
            error={error}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
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
  scroll:       { flexGrow: 1, backgroundColor: COLORS.primary, paddingBottom: 40 },
  header:       { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  shield:       { fontSize: 52, marginBottom: 12 },
  brand:        { fontSize: 32, fontWeight: FONTS.extrabold, color: COLORS.white, letterSpacing: 1 },
  tagline:      { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  card:         { backgroundColor: COLORS.white, borderRadius: 28, marginHorizontal: 20,
                  padding: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  cardTitle:    { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
  loginBtn:     { marginTop: 4 },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.textLight },
  registerBold: { color: COLORS.primary, fontWeight: FONTS.bold },
});