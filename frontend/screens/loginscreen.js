// screens/LoginScreen.js
console.log("LOGIN SCREEN"); //remove later
return (
  <View style={{flex:1,backgroundColor:'yellow'}}>
    <Text>HELLO</Text>
  </View>
);
// import React, { useState } from 'react';
// import {
//   View, Text, TextInput, Button, StyleSheet,
//   Alert, ActivityIndicator, TouchableOpacity,
// } from 'react-native';
// import { loginWorker } from '../src/services/authService';

// export default function LoginScreen({ navigation, route }) {
//   // Prefill phone if coming from RegisterScreen
//   const [phone, setPhone]     = useState(route.params?.prefillPhone || '');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!phone.trim()) {
//       Alert.alert('Validation', 'Please enter your phone number.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const { user_id } = await loginWorker(phone.trim());
//       // Correct flow: Login → WorkerDashboard
//       navigation.replace('WorkerDashboard', { userId: user_id });
//     } catch (err) {
//       Alert.alert('Error', err?.message || 'Login failed. Check your phone number.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <TextInput
//         placeholder="Phone"
//         style={styles.input}
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//         autoFocus={!phone}
//       />
//       {loading
//         ? <ActivityIndicator size="large" color="#0000ff" />
//         : <Button title="Login" onPress={handleLogin} />
//       }
//       <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
//         <Text style={styles.linkText}>Don't have an account? Register</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   input:     { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
//   title:     { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
//   link:      { marginTop: 16, alignItems: 'center' },
//   linkText:  { color: '#0066cc', fontSize: 14 },
// });