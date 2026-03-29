// screens/dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Button } from 'react-native';
import { getWorkerDashboard, getWorkerClaims, getWorkerPayouts } from '../src/services/dashboardService';
import { getUserId, logoutWorker } from '../src/services/authService';
import { trackAndSendLocation } from '../src/services/locationService';

export default function WorkerDashboard({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims]       = useState([]);
  const [payouts, setPayouts]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        navigation.navigate('Login');
        return;
      }

      const id = parseInt(userId);

      // Fetch all three in parallel for speed
      const [dashData, claimsData, payoutsData] = await Promise.all([
        getWorkerDashboard(id),
        getWorkerClaims(id),
        getWorkerPayouts(id),
      ]);

      setDashboard(dashData);
      setClaims(claimsData.claims     || []);
      setPayouts(payoutsData.payouts  || []);

      // Send GPS location silently in background for fraud detection
      trackAndSendLocation().catch(() => {});

    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutWorker();
    navigation.navigate('Login');
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 80 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Worker Dashboard</Text>

      {/* ── Overview ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <Text>Active Policy: {dashboard?.active_policy ? '✅ Yes' : '❌ None'}</Text>
        <Text>Weekly Premium: ₹{dashboard?.weekly_premium  ?? '—'}</Text>
        <Text>Coverage:       ₹{dashboard?.coverage_amount ?? '—'}</Text>
        <Text>Total Claims:   {dashboard?.total_claims  ?? 0}</Text>
        <Text>Total Payouts:  ₹{dashboard?.total_payout ?? 0}</Text>
      </View>

      {/* ── Claims ── */}
      <Text style={styles.sectionTitle}>Claims</Text>
      {claims.length === 0
        ? <Text style={styles.empty}>No claims yet.</Text>
        : claims.map((c) => (
            <View key={c.claim_id} style={styles.card}>
              <Text>Claim #{c.claim_id} — {c.event_type?.toUpperCase()}</Text>
              <Text>Status: {c.status}</Text>
              <Text>Amount: ₹{c.amount}</Text>
              <Text>Date:   {c.created_at}</Text>
            </View>
          ))
      }

      {/* ── Payouts ── */}
      <Text style={styles.sectionTitle}>Payouts</Text>
      {payouts.length === 0
        ? <Text style={styles.empty}>No payouts yet.</Text>
        : payouts.map((p, i) => (
            <View key={i} style={styles.card}>
              <Text>TXN: {p.transaction_id}</Text>
              <Text>Amount: ₹{p.amount}</Text>
              <Text>Status: {p.status}</Text>
              <Text>Date:   {p.processed_at}</Text>
            </View>
          ))
      }

      <Button title="Logout" color="red" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 20 },
  title:        { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  card:         { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 10, marginVertical: 6 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  empty:        { color: '#999', fontStyle: 'italic', marginBottom: 10 },
});