// src/screens/PolicyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants';
import { Button, Input, Card, Badge, SectionHeader } from '../components';
import { calculatePremium, createPolicy, getWorkerPolicy } from '../services/policyService';
import { getUserId } from '../services/authService';

const COVERAGE_OPTIONS = [500, 1000, 2000, 5000];
const ZONE_OPTIONS = [
  { id: 1, city: 'Delhi',     risk: 'HIGH' },
  { id: 2, city: 'Mumbai',    risk: 'HIGH' },
  { id: 3, city: 'Chennai',   risk: 'HIGH' },
  { id: 5, city: 'Bangalore', risk: 'MEDIUM' },
  { id: 6, city: 'Hyderabad', risk: 'MEDIUM' },
  { id: 7, city: 'Pune',      risk: 'MEDIUM' },
  { id: 11, city: 'Surat',    risk: 'LOW' },
  { id: 14, city: 'Nagpur',   risk: 'LOW' },
];

export default function PolicyScreen({ navigation }) {
  const [activePolicy, setActivePolicy] = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(true);

  const [selectedZone,     setSelectedZone]     = useState(null);
  const [selectedCoverage, setSelectedCoverage] = useState(1000);
  const [premium,          setPremium]          = useState(null);
  const [riskFactor,       setRiskFactor]       = useState('');
  const [calcLoading,      setCalcLoading]      = useState(false);
  const [buyLoading,       setBuyLoading]       = useState(false);

  useEffect(() => {
    const load = async () => {
      const id = await getUserId();
      if (!id) return;
      try {
        const data = await getWorkerPolicy(parseInt(id));
        if (data.active_policy) setActivePolicy(data);
      } catch (_) {}
      setLoadingPolicy(false);
    };
    load();
  }, []);

  const handleCalculate = async () => {
    if (!selectedZone) { Alert.alert('Select Zone', 'Please select your city/zone.'); return; }
    setCalcLoading(true);
    setPremium(null);
    try {
      const res = await calculatePremium(selectedZone.risk, selectedCoverage);
      setPremium(res.weekly_premium);
      setRiskFactor(res.risk_factor || '');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to calculate premium.');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!premium) return;
    Alert.alert(
      'Confirm Purchase',
      `Weekly Premium: ₹${premium}\nCoverage: ₹${selectedCoverage}\n\nPurchase this policy?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: async () => {
          setBuyLoading(true);
          try {
            const id = await getUserId();
            await createPolicy(parseInt(id), selectedZone.id, premium, selectedCoverage);
            Alert.alert('🎉 Policy Purchased!', 'Your income is now protected.', [
              { text: 'OK', onPress: () => navigation.replace('MainTabs') }
            ]);
          } catch (err) {
            Alert.alert('Error', err?.message || 'Failed to purchase policy.');
          } finally {
            setBuyLoading(false);
          }
        }},
      ]
    );
  };

  if (loadingPolicy) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Active Policy ── */}
      {activePolicy && (
        <Card style={styles.activePolicyCard}>
          <View style={styles.activePolicyHeader}>
            <Text style={styles.activePolicyTitle}>✅ Active Policy</Text>
            <Badge label="ACTIVE" />
          </View>
          <View style={styles.activePolicyRow}>
            <View style={styles.activePolicyStat}>
              <Text style={styles.activePolicyValue}>₹{activePolicy.coverage_amount}</Text>
              <Text style={styles.activePolicyLabel}>Coverage Amount</Text>
            </View>
            <View style={styles.activePolicyStat}>
              <Text style={styles.activePolicyValue}>₹{activePolicy.weekly_premium}</Text>
              <Text style={styles.activePolicyLabel}>Weekly Premium</Text>
            </View>
          </View>
          <Text style={styles.activePolicyNote}>
            🗓️ Active since {activePolicy.start_date}
          </Text>
        </Card>
      )}

      {/* ── New Policy Header ── */}
      <SectionHeader
        title={activePolicy ? '📋 Upgrade / New Policy' : '📋 Get Income Protection'}
        subtitle="Select your zone and coverage amount"
      />

      {/* ── Zone Selection ── */}
      <Text style={styles.label}>Your City / Zone</Text>
      <View style={styles.zoneGrid}>
        {ZONE_OPTIONS.map(z => (
          <TouchableOpacity
            key={z.id}
            style={[styles.zoneCard, selectedZone?.id === z.id && styles.zoneCardSelected]}
            onPress={() => { setSelectedZone(z); setPremium(null); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.zoneCity, selectedZone?.id === z.id && styles.zoneCitySelected]}>
              {z.city}
            </Text>
            <View style={[styles.riskBadge, styles[`risk${z.risk}`]]}>
              <Text style={styles.riskBadgeText}>{z.risk}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Coverage Amount ── */}
      <Text style={[styles.label, { marginTop: 16 }]}>Coverage Amount (₹)</Text>
      <View style={styles.coverageGrid}>
        {COVERAGE_OPTIONS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.coverageChip, selectedCoverage === c && styles.coverageChipSelected]}
            onPress={() => { setSelectedCoverage(c); setPremium(null); }}
          >
            <Text style={[styles.coverageText, selectedCoverage === c && styles.coverageTextSelected]}>
              ₹{c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Calculate Button ── */}
      <Button
        title="Calculate Weekly Premium"
        onPress={handleCalculate}
        loading={calcLoading}
        variant="outline"
        style={{ marginTop: 20 }}
      />

      {/* ── Premium Result ── */}
      {premium !== null && (
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumLabel}>Your Weekly Premium</Text>
          <Text style={styles.premiumValue}>₹{premium}</Text>
          <Text style={styles.premiumCoverage}>for ₹{selectedCoverage} income protection</Text>
          {riskFactor ? <Text style={styles.riskFactor}>📊 {riskFactor}</Text> : null}

          <Button
            title={`Buy Policy — ₹${premium}/week`}
            onPress={handleBuy}
            loading={buyLoading}
            style={{ marginTop: 16 }}
          />
        </Card>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: COLORS.background },
  content:             { padding: 20, paddingBottom: 40 },
  center:              { flex: 1, alignItems: 'center', justifyContent: 'center' },

  activePolicyCard:    { backgroundColor: COLORS.success, marginBottom: 24 },
  activePolicyHeader:  { flexDirection: 'row', justifyContent: 'space-between',
                         alignItems: 'center', marginBottom: 16 },
  activePolicyTitle:   { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.white },
  activePolicyRow:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  activePolicyStat:    { alignItems: 'center' },
  activePolicyValue:   { fontSize: 22, fontWeight: FONTS.extrabold, color: COLORS.white },
  activePolicyLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, textTransform: 'uppercase' },
  activePolicyNote:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },

  label:               { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: 10 },

  zoneGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  zoneCard:            { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md,
                         borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
                         alignItems: 'center', minWidth: '22%' },
  zoneCardSelected:    { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  zoneCity:            { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text },
  zoneCitySelected:    { color: COLORS.primary },
  riskBadge:           { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  riskBadgeText:       { fontSize: 10, fontWeight: FONTS.bold },
  riskHIGH:            { backgroundColor: COLORS.dangerLight },
  riskMEDIUM:          { backgroundColor: COLORS.warningLight },
  riskLOW:             { backgroundColor: COLORS.successLight },

  coverageGrid:        { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  coverageChip:        { paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full,
                         borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  coverageChipSelected:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  coverageText:        { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.textLight },
  coverageTextSelected:{ color: COLORS.white },

  premiumCard:         { marginTop: 16, alignItems: 'center', ...SHADOW.md },
  premiumLabel:        { fontSize: 13, color: COLORS.textLight, textTransform: 'uppercase',
                         letterSpacing: 0.5, marginBottom: 6 },
  premiumValue:        { fontSize: 48, fontWeight: FONTS.extrabold, color: COLORS.primary },
  premiumCoverage:     { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  riskFactor:          { fontSize: 13, color: COLORS.textLight, marginTop: 8,
                         backgroundColor: COLORS.background, padding: 10, borderRadius: RADIUS.md,
                         alignSelf: 'stretch', textAlign: 'center' },
});