// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  const handleLogin = async () => {
    try {
      const res = await loginUser({ phone });
      Alert.alert('Success', 'Logged in!');
      navigation.navigate('PremiumScreen', { userId: res.data.user_id });
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Phone" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
      <Button title="Login" onPress={handleLogin}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  input: { borderWidth:1, borderColor:'#ccc', padding:10, marginVertical:5, borderRadius:5 },
  title: { fontSize:24, marginBottom:20, textAlign:'center' },
});