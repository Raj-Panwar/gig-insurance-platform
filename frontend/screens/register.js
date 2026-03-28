// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [platform, setPlatform] = useState('');

  const handleRegister = async () => {
    try {
      const res = await registerUser({ name, phone, city, platform });
      Alert.alert('Success', 'Registered successfully!');
      navigation.navigate('Login');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Phone" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
      <TextInput placeholder="City" style={styles.input} value={city} onChangeText={setCity}/>
      <TextInput placeholder="Platform" style={styles.input} value={platform} onChangeText={setPlatform}/>
      <Button title="Register" onPress={handleRegister}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  input: { borderWidth:1, borderColor:'#ccc', padding:10, marginVertical:5, borderRadius:5 },
  title: { fontSize:24, marginBottom:20, textAlign:'center' },
});