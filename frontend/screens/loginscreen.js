// screens/loginscreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { loginWorker } from '../src/services/authService';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Validation', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      // loginWorker stores token + user_id in AsyncStorage automatically
      const { user_id } = await loginWorker(phone.trim());
      Alert.alert('Success', 'Logged in!');
      navigation.navigate('PremiumScreen', { userId: user_id });
    } catch (err) {
      Alert.alert('Error', err?.message || 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {loading
        ? <ActivityIndicator size="large" color="#0000ff" />
        : <Button title="Login" onPress={handleLogin} />
      }
      <Button
        title="Don't have an account? Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  title:     { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});