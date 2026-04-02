// src/screens/HomeScreen.js
// Changes: removed Quick Actions section, show recent claims only,
//          policy banner shows policy type (not coverage amount),
//          event popup for new claims, logout fixed (uses navigation.replace)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants';
import { Card, Badge, EmptyState, StatCard } from '../components';
import { getWorkerDashboard, getWorkerClaims } from '../services/dashboardService';
import { getUserId, getUser, logoutWorker } from '../services/authService';
import { trackAndSendLocation } from '../services/locationService';

const TRIGGER_ICONS = { rain: '🌧️', aqi: '🏭', heat: '🌡️' };

export default function HomeScreen({ navigation }) {
  const [dashboard,    setDashboard]    = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [user,         setUser]         = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [newClaimPopup, setNewClaimPopup] = useState(null); // holds newest claim if new
  const prevClaimCount = useRef(0);

  const load = useCallback(async (isRefresh = false) => {
    try {
      const u  = await getUser();
      const id = await getUserId();
      setUser(u);
      if (!id) return;

      const [dash, claimsData] = await Promise.all([
        getWorkerDashboard(parseInt(id)),
        getWorkerClaims(parseInt(id)),
      ]);
      setDashboard(dash);
      const claims = claimsData.claims || [];

      // Show popup if a new claim appeared since last load
      if (isRefresh && claims.length > prevClaimCount.current && claims.length > 0) {
        setNewClaimPopup(claims[0]);
      }
      prevClaimCount.current = claims.length;
      setRecentClaims(claims.slice(0, 5));

      trackAndSendLocation().catch(() => {});
    } catch (err) {
      if (err?.status === 401) {
        await logoutWorker();
        navigation.replace('Login'); // fixed: was .navigate, now .replace
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(false); }, []);
  const onRefresh = () => { setRefreshing(true); load(true); };

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive',
        onPress: async () => { await logoutWorker(); navigation.replace('Login'); } },
    ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* ── New Claim Popup ── */}
      <Modal visible={!!newClaimPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>
              {TRIGGER_ICONS[newClaimPopup?.trigger_type?.toLowerCase()] || '⚡'}
            </Text>
            <Text style={styles.modalTitle}>New Claim Generated!</Text>
            <Text style={styles.modalBody}>
              A {newClaimPopup?.trigger_type?.toUpperCase()} disruption was detected in your city.
              A claim has been automatically created for you.
            </Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Status</Text>
              <Badge label={newClaimPopup?.status} />
            </View>
            {newClaimPopup?.payout_amount > 0 && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payout</Text>
                <Text style={styles.modalValue}>₹{newClaimPopup?.payout_amount}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => setNewClaimPopup(null)}>
              <Text style={styles.modalBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroGreeting}>Hello, {user?.name?.split(' ')[0] || 'Worker'} 👋</Text>
          <Text style={styles.heroSub}>{user?.city} · {user?.platform}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ── Policy Banner — shows policy type only, NOT coverage amount ── */}
      {dashboard && (
        <TouchableOpacity
          style={[styles.policyBanner,
            dashboard.active_policy ? styles.policyBannerActive : styles.policyBannerInactive]}
          onPress={() => navigation.navigate('Policy')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.policyBannerLabel}>
              {dashboard.active_policy ? '✅ Policy Active' : '⚠️ No Active Policy'}
            </Text>
            <Text style={styles.policyBannerValue}>
              {dashboard.active_policy
                ? `${dashboard.policy_type || 'Standard'} Plan`
                : 'Tap to buy income protection →'}
            </Text>
          </View>
          <Text style={styles.policyArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* ── Stat Row ── */}
      {dashboard && (
        <View style={styles.statRow}>
          <StatCard icon="🗂️" label="Claims"  value={dashboard.total_claims}  color={COLORS.accent} />
          <View style={{ width: 12 }} />
          <StatCard icon="💰" label="Payouts" value={`₹${dashboard.total_payout || 0}`} color={COLORS.success} />
        </View>
      )}

      {/* ── Recent Claims (no Quick Actions) ── */}
      <Text style={styles.sectionTitle}>Recent Claims</Text>
      {recentClaims.length === 0
        ? <EmptyState icon="🗂️" title="No claims yet"
            subtitle="Pull down to refresh. Claims appear when a disruption hits your city." />
        : recentClaims.map(c => (
            <Card key={c.claim_id} style={styles.claimCard}>
              <View style={styles.claimRow}>
                <View style={styles.claimLeft}>
                  <Text style={styles.claimIcon}>
                    {TRIGGER_ICONS[c.trigger_type?.toLowerCase()] || '⚡'}
                  </Text>
                  <View>
                    <Text style={styles.claimType}>{c.trigger_type?.toUpperCase()}</Text>
                    <Text style={styles.claimDate}>{c.created_at}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Badge label={c.status} />
                  {c.payout_amount > 0 && <Text style={styles.claimAmount}>₹{c.payout_amount}</Text>}
                </View>
              </View>
            </Card>
          ))
      }

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: COLORS.background },
  content:              { paddingBottom: 32 },

  // Modal
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                          alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard:            { backgroundColor: COLORS.white, borderRadius: 20, padding: 24,
                          width: '100%', alignItems: 'center' },
  modalIcon:            { fontSize: 48, marginBottom: 12 },
  modalTitle:           { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 8 },
  modalBody:            { fontSize: 14, color: COLORS.textLight, textAlign: 'center',
                          lineHeight: 20, marginBottom: 16 },
  modalRow:             { flexDirection: 'row', justifyContent: 'space-between',
                          width: '100%', marginBottom: 8, alignItems: 'center' },
  modalLabel:           { fontSize: 14, color: COLORS.textLight },
  modalValue:           { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.success },
  modalBtn:             { backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
                          paddingVertical: 12, paddingHorizontal: 32, marginTop: 8 },
  modalBtnText:         { color: COLORS.white, fontWeight: FONTS.bold, fontSize: 15 },

  hero:                 { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 28,
                          paddingHorizontal: 20, flexDirection: 'row',
                          alignItems: 'flex-start', justifyContent: 'space-between' },
  heroGreeting:         { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.white },
  heroSub:              { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  logoutBtn:            { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14,
                          paddingVertical: 7, borderRadius: RADIUS.full },
  logoutText:           { color: COLORS.white, fontSize: 13, fontWeight: FONTS.semibold },

  policyBanner:         { marginHorizontal: 20, marginTop: -16, borderRadius: RADIUS.lg,
                          padding: 18, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', ...SHADOW.md },
  policyBannerActive:   { backgroundColor: COLORS.success },
  policyBannerInactive: { backgroundColor: COLORS.accent },
  policyBannerLabel:    { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.white },
  policyBannerValue:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  policyArrow:          { fontSize: 28, color: COLORS.white, fontWeight: FONTS.bold },

  statRow:              { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  sectionTitle:         { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.text,
                          marginHorizontal: 20, marginTop: 20, marginBottom: 12 },

  claimCard:            { marginHorizontal: 20, marginBottom: 10 },
  claimRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimLeft:            { flexDirection: 'row', alignItems: 'center', gap: 12 },
  claimIcon:            { fontSize: 24 },
  claimType:            { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text },
  claimDate:            { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  claimAmount:          { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.success, marginTop: 4 },
});