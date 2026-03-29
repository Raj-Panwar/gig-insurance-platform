// screens/BuyPolicyScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { createPolicy } from '../src/services/policyService';

export default function BuyPolicyScreen({ navigation, route }) {
  const { userId, zoneId, premium, coverageAmount, riskLevel } = route.params;
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      await createPolicy(userId, zoneId, premium, coverageAmount);
      Alert.alert('Policy Activated! 🎉', `You are now covered for ₹${coverageAmount}.`, [
        { text: 'View Dashboard', onPress: () => navigation.replace('WorkerDashboard') },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to activate policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate Policy</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Policy Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Risk Level</Text>
          <Text style={[styles.value, styles.bold]}>{riskLevel || '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Coverage Amount</Text>
          <Text style={styles.value}>₹{coverageAmount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Weekly Premium</Text>
          <Text style={[styles.value, styles.highlight]}>₹{premium}/week</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Your premium is calculated based on your city's risk level and current weather conditions.
      </Text>

      {loading
        ? <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 20 }} />
        : (
          <TouchableOpacity style={styles.activateBtn} onPress={handleActivate}>
            <Text style={styles.activateBtnText}>Activate Policy</Text>
          </TouchableOpacity>
        )
      }

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title:          { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  card:           { backgroundColor: '#f0f7ff', padding: 20, borderRadius: 14,
                    borderWidth: 1, borderColor: '#90caf9', marginBottom: 16 },
  cardTitle:      { fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  row:            { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  label:          { fontSize: 15, color: '#555' },
  value:          { fontSize: 15 },
  bold:           { fontWeight: 'bold' },
  highlight:      { fontWeight: 'bold', color: '#1976d2', fontSize: 17 },
  divider:        { height: 1, backgroundColor: '#cce0f5', marginVertical: 8 },
  note:           { fontSize: 13, color: '#777', textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  activateBtn:    { backgroundColor: '#1976d2', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  activateBtnText:{ color: '#fff', fontWeight: 'bold', fontSize: 17 },
  backBtn:        { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  backBtnText:    { color: '#555', fontSize: 14 },
});