// screens/WorkerDashboard.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { getWorkerDashboard, getWorkerClaims, getWorkerPayouts } from '../src/services/dashboardService';
import { getUserId, getUser, logoutWorker } from '../src/services/authService';
import { autoCalculatePremium } from '../src/services/policyService';
import { trackAndSendLocation } from '../src/services/locationService';

const COVERAGE_AMOUNT = 2000;

export default function WorkerDashboard({ navigation }) {
  const [dashboard, setDashboard]   = useState(null);
  const [claims, setClaims]         = useState([]);
  const [payouts, setPayouts]       = useState([]);
  const [premiumData, setPremiumData] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        navigation.replace('Login');
        return;
      }

      const id   = parseInt(userId);
      const user = await getUser();

      // Fetch dashboard + claims + payouts in parallel
      const [dashData, claimsData, payoutsData] = await Promise.all([
        getWorkerDashboard(id),
        getWorkerClaims(id),
        getWorkerPayouts(id),
      ]);

      setDashboard(dashData);
      setClaims(claimsData.claims    || []);
      setPayouts(payoutsData.payouts || []);

      // Auto-calculate premium using registered city — no user input needed
      if (user?.city) {
        try {
          const premData = await autoCalculatePremium(user.city, COVERAGE_AMOUNT);
          setPremiumData(premData);
        } catch {
          // Non-fatal — dashboard still shows without premium
        }
      }

      // Send GPS location silently for fraud detection
      trackAndSendLocation().catch(() => {});

    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutWorker();
    navigation.replace('Login');
  };

  const handleActivatePolicy = async () => {
    const userId = await getUserId();
    if (!premiumData) {
      Alert.alert('Not ready', 'Premium data is still loading. Please wait.');
      return;
    }
    navigation.navigate('BuyPolicyScreen', {
      userId:         parseInt(userId),
      zoneId:         premiumData.zone_id,
      premium:        premiumData.weekly_premium,
      coverageAmount: premiumData.coverage_amount,
      riskLevel:      premiumData.risk_level,
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 80 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Worker Dashboard</Text>

      {/* ── Insurance Overview ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Insurance Overview</Text>
        <Text>Active Policy: {dashboard?.active_policy ? '✅ Yes' : '❌ None'}</Text>
        <Text>Weekly Premium: ₹{dashboard?.weekly_premium ?? premiumData?.weekly_premium ?? '—'}</Text>
        <Text>Coverage:       ₹{dashboard?.coverage_amount ?? COVERAGE_AMOUNT}</Text>
        <Text>Total Claims:   {dashboard?.total_claims  ?? 0}</Text>
        <Text>Total Payouts:  ₹{dashboard?.total_payout ?? 0}</Text>
      </View>

      {/* ── Auto-Calculated Premium Card ── */}
      {premiumData && !dashboard?.active_policy && (
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>🛡️ Your Protection Plan</Text>
          <Text style={styles.premiumRow}>Risk Level:     <Text style={styles.bold}>{premiumData.risk_level}</Text></Text>
          <Text style={styles.premiumRow}>Weekly Premium: <Text style={styles.bold}>₹{premiumData.weekly_premium}</Text></Text>
          <Text style={styles.premiumRow}>Coverage:       <Text style={styles.bold}>₹{premiumData.coverage_amount}</Text></Text>
          <Text style={styles.riskFactor}>{premiumData.risk_factor}</Text>

          <TouchableOpacity style={styles.activateBtn} onPress={handleActivatePolicy}>
            <Text style={styles.activateBtnText}>Activate Protection</Text>
          </TouchableOpacity>
        </View>
      )}

      {dashboard?.active_policy && (
        <View style={styles.activeCard}>
          <Text style={styles.cardTitle}>✅ Policy Active</Text>
          <Text>You are covered for ₹{dashboard.coverage_amount}.</Text>
          <Text>Weekly premium: ₹{dashboard.weekly_premium}</Text>
        </View>
      )}

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

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { padding: 20 },
  title:          { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  sectionTitle:   { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  card:           { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 10, marginVertical: 6 },
  cardTitle:      { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  premiumCard:    { backgroundColor: '#e8f4fd', padding: 16, borderRadius: 12, marginVertical: 8,
                    borderWidth: 1, borderColor: '#90caf9' },
  activeCard:     { backgroundColor: '#e8f5e9', padding: 16, borderRadius: 12, marginVertical: 8,
                    borderWidth: 1, borderColor: '#a5d6a7' },
  premiumRow:     { fontSize: 15, marginVertical: 2 },
  bold:           { fontWeight: 'bold' },
  riskFactor:     { marginTop: 6, fontSize: 13, color: '#555', fontStyle: 'italic' },
  activateBtn:    { marginTop: 14, backgroundColor: '#1976d2', paddingVertical: 12,
                    borderRadius: 8, alignItems: 'center' },
  activateBtnText:{ color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty:          { color: '#999', fontStyle: 'italic', marginBottom: 10 },
  logoutBtn:      { marginTop: 24, backgroundColor: '#d32f2f', paddingVertical: 12,
                    borderRadius: 8, alignItems: 'center' },
  logoutText:     { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});