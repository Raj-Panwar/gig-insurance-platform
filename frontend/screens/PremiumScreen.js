// screens/premium.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { calculatePremium } from '../src/services/policyService';

const COVERAGE_AMOUNT = 1000; // Fixed coverage for now

export default function PremiumScreen({ navigation, route }) {
  const { userId } = route.params;
  const [zoneId, setZoneId]   = useState('');
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!zoneId.trim()) {
      Alert.alert('Validation', 'Please enter a Zone ID.');
      return;
    }
    setLoading(true);
    try {
      // calculatePremium now correctly sends both zone_id and coverage_amount
      const data = await calculatePremium(parseInt(zoneId), COVERAGE_AMOUNT);
      setPremium(data.weekly_premium);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to calculate premium.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculate Premium</Text>
      <TextInput
        placeholder="Zone ID (e.g. 1)"
        style={styles.input}
        value={zoneId}
        onChangeText={setZoneId}
        keyboardType="numeric"
      />
      {loading
        ? <ActivityIndicator size="large" color="#0000ff" />
        : <Button title="Calculate" onPress={handleCalculate} />
      }

      {premium !== null && (
        <View style={styles.result}>
          <Text style={styles.resultText}>Weekly Premium: ₹{premium}</Text>
          <Text style={styles.resultText}>Coverage: ₹{COVERAGE_AMOUNT}</Text>
          <Button
            title="Buy Policy"
            onPress={() => navigation.navigate('BuyPolicyScreen', {
              userId,
              zoneId: parseInt(zoneId),
              premium,
              coverageAmount: COVERAGE_AMOUNT,
            })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', padding: 20 },
  input:      { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  title:      { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  result:     { marginTop: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 },
  resultText: { fontSize: 16, marginBottom: 10 },
});