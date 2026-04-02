// src/screens/RegisterScreen.js
// Changes: removed city field — fetched automatically from GPS
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, PLATFORMS } from '../constants';
import { Button, Input } from '../components';
import { registerWorker } from '../services/authService';
import { getCurrentCoords, getCityFromCoords, requestLocationPermission } from '../services/locationService';

export default function RegisterScreen({ navigation }) {
  const [form,    setForm]    = useState({ name: '', phone: '', platform: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [detectedCity, setDetectedCity] = useState('Detecting...');

  // Auto-detect city on mount
  // Auto-detect city on mount
React.useEffect(() => {
  (async () => {
    try {
      const allowed = await requestLocationPermission();
      if (!allowed) { 
        // ❌ Location not allowed — fallback to Delhi
        Alert.alert(
        "Location Unavailable",
        "City could not be detected. Defaulting to Delhi."
      );
        setDetectedCity('Delhi'); 
        return; 
      }
      const { latitude, longitude } = await getCurrentCoords();
      const city = await getCityFromCoords(latitude, longitude);
      setDetectedCity(city || 'Delhi'); // ✅ If city is null/undefined, fallback to Delhi
    } catch (_) {
      // ❌ Location error — fallback to Delhi
      setDetectedCity('Delhi');
    }
  })();
}, []);


  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required.';
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Enter a valid 10-digit phone.';
    if (!form.platform.trim()) e.platform = 'Select your platform.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // city is auto-detected, not entered by user
      await registerWorker(form.name.trim(), form.phone.trim(), detectedCity, form.platform.trim());
      navigation.replace('MainTabs');
    } catch (err) {
      setErrors({ general: err?.message || 'Registration failed. Try a different phone number.' });
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
          <Text style={styles.tagline}>Protect your income today</Text>
        </View>

        <View style={[styles.card, SHADOW.lg]}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Register as a gig worker to get income protection</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errors.general}</Text>
            </View>
          ) : null}

          <Input label="Full Name" value={form.name} onChangeText={v => set('name', v)}
                 placeholder="e.g. Rahul Sharma" error={errors.name} />

          <Input label="Phone Number" value={form.phone} onChangeText={v => set('phone', v)}
                 placeholder="10-digit mobile number" keyboardType="phone-pad"
                 maxLength={10} error={errors.phone} />

          {/* City auto-detected — shown but not editable */}
          <View style={styles.cityRow}>
            <Text style={styles.label}>Your City (Auto-detected)</Text>
            <View style={styles.cityChip}>
              <Text style={styles.cityIcon}>📍</Text>
              <Text style={styles.cityText}>{detectedCity}</Text>
            </View>
          </View>

          <Text style={styles.label}>Delivery Platform</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => set('platform', p)}
                style={[styles.platformChip, form.platform === p && styles.platformChipActive]}
              >
                <Text style={[styles.platformText, form.platform === p && styles.platformTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.platform ? <Text style={styles.fieldError}>{errors.platform}</Text> : null}

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 20 }} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already registered? <Text style={styles.loginBold}>Login here →</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:             { flexGrow: 1, backgroundColor: COLORS.primary, paddingBottom: 40 },
  header:             { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  shield:             { fontSize: 48, marginBottom: 10 },
  brand:              { fontSize: 30, fontWeight: FONTS.extrabold, color: COLORS.white },
  tagline:            { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card:               { backgroundColor: COLORS.white, borderRadius: 28, marginHorizontal: 20, padding: 28 },
  cardTitle:          { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  cardSubtitle:       { fontSize: 13, color: COLORS.textLight, marginBottom: 20, lineHeight: 18 },
  errorBanner:        { backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  errorBannerText:    { color: COLORS.danger, fontSize: 13 },
  label:              { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: 8 },
  cityRow:            { marginBottom: 16 },
  cityChip:           { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
                        borderRadius: RADIUS.md, padding: 12, gap: 8 },
  cityIcon:           { fontSize: 16 },
  cityText:           { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.primary },
  platformGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  platformChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
                        borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  platformChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  platformText:       { fontSize: 13, color: COLORS.textLight, fontWeight: FONTS.medium },
  platformTextActive: { color: COLORS.white, fontWeight: FONTS.bold },
  fieldError:         { fontSize: 12, color: COLORS.danger, marginTop: 4, marginBottom: 8 },
  loginLink:          { marginTop: 20, alignItems: 'center' },
  loginText:          { fontSize: 14, color: COLORS.textLight },
  loginBold:          { color: COLORS.primary, fontWeight: FONTS.bold },
});