// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../constants';
import { Card, Badge, EmptyState, StatCard } from '../components';
import { getWorkerDashboard, getWorkerClaims } from '../services/dashboardService';
import { getUserId, getUser, logoutWorker } from '../services/authService';
import { trackAndSendLocation } from '../services/locationService';

export default function HomeScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
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
      setRecentClaims((claimsData.claims || []).slice(0, 3));

      // Silent GPS update for fraud detection
      trackAndSendLocation().catch(() => {});
    } catch (err) {
      if (err?.status === 401) {
        await logoutWorker();
        navigation.replace('Login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const STATUS_COLOR = {
    APPROVED: COLORS.success, PENDING: COLORS.warning,
    FLAGGED: COLORS.accent,   REJECTED: COLORS.danger, PAID: COLORS.info,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroGreeting}>Hello, {user?.name?.split(' ')[0] || 'Worker'} 👋</Text>
          <Text style={styles.heroSub}>{user?.city} · {user?.platform}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive',
              onPress: async () => { await logoutWorker(); navigation.replace('Login'); }},
          ])}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ── Policy Status Banner ── */}
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
            {dashboard.active_policy
              ? <Text style={styles.policyBannerValue}>
                  ₹{dashboard.coverage_amount} coverage · ₹{dashboard.weekly_premium}/week
                </Text>
              : <Text style={styles.policyBannerValue}>Tap to buy income protection →</Text>
            }
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

      {/* ── Quick Actions ── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        {[
          { icon: '📋', label: 'Buy Policy',   screen: 'Policy',   color: COLORS.primary },
          { icon: '💰', label: 'Payouts',       screen: 'Payouts',  color: COLORS.success },
          { icon: '🗂️', label: 'My Claims',    screen: 'Claims',   color: COLORS.accent },
          { icon: '📍', label: 'Update Location', screen: null,    color: COLORS.info },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[styles.actionCard, SHADOW.sm]}
            onPress={async () => {
              if (a.screen) navigation.navigate(a.screen);
              else {
                const r = await trackAndSendLocation();
                Alert.alert(r.success ? '📍 Location Updated' : '❌ Failed',
                  r.success ? `City: ${r.city}` : r.error);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
              <Text style={styles.actionEmoji}>{a.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent Claims ── */}
      <Text style={styles.sectionTitle}>Recent Claims</Text>
      {recentClaims.length === 0
        ? <EmptyState icon="🗂️" title="No claims yet"
            subtitle="Claims are auto-created when a disruption is detected in your city" />
        : recentClaims.map(c => (
            <Card key={c.claim_id} style={styles.claimCard}>
              <View style={styles.claimRow}>
                <View>
                  <Text style={styles.claimType}>{c.trigger_type?.toUpperCase()}</Text>
                  <Text style={styles.claimDate}>{c.created_at}</Text>
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
  container:           { flex: 1, backgroundColor: COLORS.background },
  content:             { paddingBottom: 32 },

  hero:                { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 28,
                         paddingHorizontal: 20, flexDirection: 'row',
                         alignItems: 'flex-start', justifyContent: 'space-between' },
  heroGreeting:        { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.white },
  heroSub:             { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  logoutBtn:           { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14,
                         paddingVertical: 7, borderRadius: RADIUS.full },
  logoutText:          { color: COLORS.white, fontSize: 13, fontWeight: FONTS.semibold },

  policyBanner:        { marginHorizontal: 20, marginTop: -16, borderRadius: RADIUS.lg,
                         padding: 18, flexDirection: 'row', alignItems: 'center',
                         justifyContent: 'space-between', ...SHADOW.md },
  policyBannerActive:  { backgroundColor: COLORS.success },
  policyBannerInactive:{ backgroundColor: COLORS.accent },
  policyBannerLabel:   { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.white },
  policyBannerValue:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  policyArrow:         { fontSize: 28, color: COLORS.white, fontWeight: FONTS.bold },

  statRow:             { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },

  sectionTitle:        { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.text,
                         marginHorizontal: 20, marginTop: 20, marginBottom: 12 },

  actionGrid:          { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 12 },
  actionCard:          { width: '45%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
                         padding: 18, alignItems: 'center' },
  actionIcon:          { width: 52, height: 52, borderRadius: 16,
                         alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionEmoji:         { fontSize: 24 },
  actionLabel:         { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text, textAlign: 'center' },

  claimCard:           { marginHorizontal: 20, marginBottom: 10 },
  claimRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimType:           { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text },
  claimDate:           { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  claimAmount:         { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.success, marginTop: 4 },
});