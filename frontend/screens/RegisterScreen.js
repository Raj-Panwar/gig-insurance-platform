// screens/register.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
      // registerWorker stores token + user_id automatically
      await registerWorker(name.trim(), phone.trim(), city.trim(), platform.trim());
      Alert.alert('Success', 'Registered successfully! Please log in.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Registration failed. Try a different phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Name"     style={styles.input} value={name}     onChangeText={setName} />
      <TextInput placeholder="Phone"    style={styles.input} value={phone}    onChangeText={setPhone}    keyboardType="phone-pad" />
      <TextInput placeholder="City"     style={styles.input} value={city}     onChangeText={setCity} />
      <TextInput placeholder="Platform (e.g. Swiggy)" style={styles.input} value={platform} onChangeText={setPlatform} />
      {loading
        ? <ActivityIndicator size="large" color="#0000ff" />
        : <Button title="Register" onPress={handleRegister} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  title:     { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});