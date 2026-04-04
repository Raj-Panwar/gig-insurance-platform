// src/screens/PolicyScreen.js
// Changes: 3 policy type cards (Basic/Standard/Premium), active policy shows type+weekly amount+dates,
//          auto-calculates premium per type, no manual zone entry
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants';
import { Button, Card, Badge } from '../components';
import { calculatePremium, createPolicy, getWorkerPolicy } from '../services/policyService';
import { getUserId, getUser } from '../services/authService';
import apiClient from '../api/apiClient';

// ── 3 Policy types ────────────────────────────────────────────────────────────
const POLICY_TYPES = [
  {
    key:      'basic',
    label:    'Basic',
    icon:     '🌱',
    coverage: 500,
    color:    COLORS.info,
    features: ['Rain disruption', 'Heatwave cover', '₹500 coverage'],
  },
  {
    key:      'standard',
    label:    'Standard',
    icon:     '⭐',
    coverage: 1000,
    color:    COLORS.primary,
    features: ['Rain + AQI + Heat', 'Fraud protection', '₹1000 coverage'],
    recommended: true,
  },
  {
    key:      'premium',
    label:    'Premium',
    icon:     '💎',
    coverage: 2000,
    color:    COLORS.accent,
    features: ['All disruptions', 'Priority payouts', '₹2000 coverage'],
  },
];

export default function PolicyScreen({ navigation }) {
  const [activePolicy,  setActivePolicy]  = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [selectedType,  setSelectedType]  = useState(null); // key: 'basic'|'standard'|'premium'
  const [premiums,      setPremiums]      = useState({});   // { basic: 30, standard: 45, premium: 55 }
  const [calcLoading,   setCalcLoading]   = useState(false);
  const [buyLoading,    setBuyLoading]    = useState(false);
  const [zoneId,        setZoneId]        = useState(1);
  const [zoneRisk,      setZoneRisk]      = useState('MEDIUM');

  useEffect(() => {
    const load = async () => {
      try {
        const id   = await getUserId();
        const user = await getUser();
        if (!id) return;

        // Get zone from user's city
        if (user?.city) {
          try {
            const zRes = await apiClient.get(`/zone/by-city/${user.city}`);
            if (zRes.data?.zone_id) {
              setZoneId(zRes.data.zone_id);
              setZoneRisk(zRes.data.risk_level || 'MEDIUM');
            }
          } catch (_) {}
        }

        const data = await getWorkerPolicy(parseInt(id));
        if (data.active_policy) setActivePolicy(data);
      } catch (_) {}
      setLoadingPolicy(false);
    };
    load();
  }, []);

  // Auto-calculate premiums for all 3 types when zone is known
  useEffect(() => {
    if (!zoneRisk) return;
    const calc = async () => {
      setCalcLoading(true);
      const results = {};
      for (const t of POLICY_TYPES) {
        try {
          const r = await calculatePremium(zoneRisk, t.coverage);
          results[t.key] = r.weekly_premium;
        } catch (_) {
          results[t.key] = t.coverage === 500 ? 30 : t.coverage === 1000 ? 45 : 60;
        }
      }
      setPremiums(results);
      setCalcLoading(false);
    };
    calc();
  }, [zoneRisk]);

  const handleBuy = async () => {
  if (!selectedType) return;

  const type    = POLICY_TYPES.find(t => t.key === selectedType);
  const premium = premiums[selectedType];

  try {
    setBuyLoading(true);

    const id = await getUserId();
    console.log("🔥 BUY USER:", id);

    await createPolicy(
      parseInt(id),
      zoneId,
      premium,
      type.coverage,
      type.key
    );

    console.log("🔥 POLICY API CALLED");

    Alert.alert("✅ Success", "Policy Activated!");

    navigation.navigate('Home'); // 🔥 go back

  } catch (err) {
    console.log("❌ ERROR:", err);
    Alert.alert('Error', err?.message || 'Failed to purchase.');
  } finally {
    setBuyLoading(false);
  }
};
  if (loadingPolicy) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Active Policy — takes main area ── */}
      {activePolicy ? (
        <Card style={styles.activePolicyCard}>
          <View style={styles.activePolicyHeader}>
            <Text style={styles.activePolicyTitle}>✅ Your Active Plan</Text>
            <Badge label="ACTIVE" />
          </View>
          <Text style={styles.activePlanType}>{activePolicy.policy_type || 'Standard'} Plan</Text>

          <View style={styles.activePolicyStats}>
            <View style={styles.activeStat}>
              <Text style={styles.activeStatVal}>₹{activePolicy.weekly_premium}</Text>
              <Text style={styles.activeStatLabel}>This Week's Premium</Text>
            </View>
            <View style={styles.activeDivider} />
            <View style={styles.activeStat}>
              <Text style={styles.activeStatVal}>₹{activePolicy.coverage_amount}</Text>
              <Text style={styles.activeStatLabel}>Expected Coverage</Text>
            </View>
          </View>

          <View style={styles.activeDates}>
            <Text style={styles.dateText}>📅 Start: {activePolicy.start_date}</Text>
            <Text style={styles.dateText}>🏁 End: {activePolicy.end_date || 'Ongoing'}</Text>
          </View>

          <Text style={styles.changeHint}>Scroll down to upgrade your plan</Text>
        </Card>
      ) : (
        <View style={styles.noPolicyHint}>
          <Text style={styles.noPolicyText}>Choose a plan to protect your income ↓</Text>
        </View>
      )}

      {/* ── Policy Type Cards — bottom half ── */}
      <Text style={styles.sectionTitle}>
        {activePolicy ? 'Change Plan' : 'Choose a Plan'}
      </Text>

      {calcLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.calcText}>Calculating premiums for your area...</Text>
        </View>
      ) : (
        POLICY_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setSelectedType(t.key)}
            activeOpacity={0.85}
          >
            <Card style={[
              styles.typeCard,
              selectedType === t.key && { borderWidth: 2, borderColor: t.color },
              t.recommended && styles.recommendedCard,
            ]}>
              {t.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: t.color }]}>
                  <Text style={styles.recommendedText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.typeHeader}>
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <View style={styles.typeTitleWrap}>
                  <Text style={[styles.typeLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={styles.typeCoverage}>₹{t.coverage} coverage</Text>
                </View>
                <View style={styles.premiumWrap}>
                  <Text style={[styles.premiumAmt, { color: t.color }]}>
                    ₹{premiums[t.key] ?? '—'}
                  </Text>
                  <Text style={styles.premiumPer}>/week</Text>
                </View>
              </View>
              <View style={styles.featureList}>
                {t.features.map(f => (
                  <Text key={f} style={styles.feature}>✓ {f}</Text>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      {selectedType && (
        <Button
          title={`Buy ${POLICY_TYPES.find(t => t.key === selectedType)?.label} — ₹${premiums[selectedType] ?? '?'}/week`}
          onPress={handleBuy}
          loading={buyLoading}
          style={{ marginTop: 8 }}
        />
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  content:            { padding: 20, paddingBottom: 48 },
  center:             { alignItems: 'center', padding: 24 },
  calcText:           { fontSize: 13, color: COLORS.textLight, marginTop: 8 },

  activePolicyCard:   { backgroundColor: COLORS.primary, marginBottom: 8 },
  activePolicyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activePolicyTitle:  { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.white },
  activePlanType:     { fontSize: 26, fontWeight: FONTS.extrabold, color: COLORS.white, marginBottom: 16 },
  activePolicyStats:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: RADIUS.md, padding: 16, marginBottom: 14 },
  activeStat:         { flex: 1, alignItems: 'center' },
  activeStatVal:      { fontSize: 22, fontWeight: FONTS.extrabold, color: COLORS.white },
  activeStatLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3, textAlign: 'center' },
  activeDivider:      { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  activeDates:        { gap: 4, marginBottom: 12 },
  dateText:           { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  changeHint:         { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  noPolicyHint:       { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.md,
                        padding: 14, marginBottom: 8, alignItems: 'center' },
  noPolicyText:       { fontSize: 14, color: COLORS.warning, fontWeight: FONTS.semibold },

  sectionTitle:       { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.text,
                        marginBottom: 12, marginTop: 8 },

  typeCard:           { marginBottom: 12, position: 'relative', overflow: 'hidden' },
  recommendedCard:    { borderWidth: 1, borderColor: COLORS.primary + '40' },
  recommendedBadge:   { position: 'absolute', top: 0, right: 0, paddingHorizontal: 12,
                        paddingVertical: 4, borderBottomLeftRadius: RADIUS.md },
  recommendedText:    { fontSize: 11, color: COLORS.white, fontWeight: FONTS.bold },
  typeHeader:         { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  typeIcon:           { fontSize: 28, marginRight: 12 },
  typeTitleWrap:      { flex: 1 },
  typeLabel:          { fontSize: 18, fontWeight: FONTS.bold },
  typeCoverage:       { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  premiumWrap:        { alignItems: 'flex-end' },
  premiumAmt:         { fontSize: 24, fontWeight: FONTS.extrabold },
  premiumPer:         { fontSize: 11, color: COLORS.textLight },
  featureList:        { gap: 4 },
  feature:            { fontSize: 13, color: COLORS.textLight },
});