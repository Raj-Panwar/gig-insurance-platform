// screens/WorkerDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { getDashboardStats } from '../services/api';

export default function WorkerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.log(err);
        Alert.alert('Error', 'Failed to load dashboard');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <Text style={{textAlign:'center', marginTop:50}}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Worker Dashboard</Text>
      <Text>Active Policies: {stats.active_policies}</Text>
      <Text>Claims: {stats.claims}</Text>
      <Text>Payouts: {stats.payouts}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding:20 },
  title: { fontSize:24, marginBottom:20, textAlign:'center' },
});