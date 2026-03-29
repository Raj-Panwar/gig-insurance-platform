// screens/homescreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getUserId, getUser } from '../src/services/authService';

const MENU = [
  { id: '1', title: '📊 Dashboard',      screen: 'WorkerDashboard' },
  { id: '2', title: '💰 Calculate Premium', screen: 'PremiumScreen' },
  { id: '3', title: '📋 My Policy',       screen: 'BuyPolicyScreen' },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser]     = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u  = await getUser();
      const id = await getUserId();
      setUser(u);
      setUserId(id ? parseInt(id) : null);
    };
    load();
  }, []);

  const handleNav = (screen) => {
    if (!userId) {
      Alert.alert('Not logged in', 'Please log in first.');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate(screen, { userId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GigShield</Text>
      {user && <Text style={styles.subtitle}>Hello, {user.name} 👋</Text>}

      {MENU.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => handleNav(item.screen)}
        >
          <Text style={styles.cardText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title:     { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle:  { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#555' },
  card:      { backgroundColor: '#fff', padding: 18, marginVertical: 8, borderRadius: 12,
               shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 },
               shadowRadius: 5, elevation: 3 },
  cardText:  { fontSize: 18 },
});