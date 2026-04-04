// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../constants';
// ⬇️ Added: import AsyncStorage so we can check token directly
import AsyncStorage from '@react-native-async-storage/async-storage';
// ⬇️ Added: still keep isLoggedIn helper, but now it should use AsyncStorage
import { isLoggedIn } from '../services/authService';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const check = async () => {
      await new Promise(r => setTimeout(r, 1200)); // brief brand moment

      // ⬇️ Added: check token from AsyncStorage
      const token = await AsyncStorage.getItem('token');

      // ⬇️ If token exists, skip login. Otherwise, go to Login.
      if (token) {
        // Optionally: verify token with backend here
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }

      // ⬇️ Alternatively, you can still call isLoggedIn() if it wraps this logic
      // const loggedIn = await isLoggedIn();
      // navigation.replace(loggedIn ? 'MainTabs' : 'Login');
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.shield}>🛡️</Text>
      <Text style={styles.brand}>GigShield</Text>
      <Text style={styles.tagline}>Income Protection for Gig Workers</Text>
      <ActivityIndicator color={COLORS.white} size="large" style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary,
               alignItems: 'center', justifyContent: 'center' },
  shield:    { fontSize: 64, marginBottom: 16 },
  brand:     { fontSize: 36, fontWeight: FONTS.extrabold, color: COLORS.white, letterSpacing: 1 },
  tagline:   { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
});
