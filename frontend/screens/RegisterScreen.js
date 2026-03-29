// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  Alert, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { registerWorker } from '../src/services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [city, setCity]         = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !city.trim() || !platform.trim()) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await registerWorker(name.trim(), phone.trim(), city.trim(), platform.trim());
      // Registration succeeded → go to Login with phone prefilled
      Alert.alert('Success', 'Registered! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login', { prefillPhone: phone.trim() }) },
      ]);
    } catch (err) {
      // 409 = phone already registered
      if (err?.status === 409) {
        Alert.alert(
          'Already Registered',
          'This phone number is already registered.',
          [
            { text: 'Go to Login', onPress: () => navigation.navigate('Login', { prefillPhone: phone.trim() }) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', err?.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Name"                    style={styles.input} value={name}     onChangeText={setName} />
      <TextInput placeholder="Phone"                   style={styles.input} value={phone}    onChangeText={setPhone}    keyboardType="phone-pad" />
      <TextInput placeholder="City (e.g. Delhi)"       style={styles.input} value={city}     onChangeText={setCity} />
      <TextInput placeholder="Platform (Swiggy/Zomato)" style={styles.input} value={platform} onChangeText={setPlatform} />
      {loading
        ? <ActivityIndicator size="large" color="#0000ff" />
        : <Button title="Register" onPress={handleRegister} />
      }
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  title:     { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  link:      { marginTop: 16, alignItems: 'center' },
  linkText:  { color: '#0066cc', fontSize: 14 },
});