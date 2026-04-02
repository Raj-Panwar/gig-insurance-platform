// src/screens/ClaimsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants';
import { Card, Badge, EmptyState, SectionHeader } from '../components';
import { getWorkerClaims } from '../services/dashboardService';
import { getUserId } from '../services/authService';

// Backend returns trigger_type: "rain", "aqi", "heat"
const TRIGGER_ICONS = { rain: '🌧️', aqi: '🏭', heat: '🌡️' };
const FILTER_OPTIONS = ['ALL', 'APPROVED', 'PAID', 'PENDING', 'FLAGGED', 'REJECTED'];

const STATUS_DESC = {
  APPROVED: 'Claim verified — payout processing',
  PAID:     'Payout disbursed to your account',
  PENDING:  'Under review',
  FLAGGED:  'Location mismatch detected',
  REJECTED: 'Does not meet trigger criteria',
};

export default function ClaimsScreen() {
  const [claims,     setClaims]     = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [activeTab,  setActiveTab]  = useState('ALL');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const id = await getUserId();
    if (!id) return;
    try {
      const data = await getWorkerClaims(parseInt(id));
      const c    = data.claims || [];
      setClaims(c);
      applyFilter(c, activeTab);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, [activeTab]);

  useEffect(() => { load(); }, []);

  const applyFilter = (list, tab) =>
    setFiltered(tab === 'ALL' ? list : list.filter(c => c.status === tab));

  const onTabChange = (tab) => {
    setActiveTab(tab);
    applyFilter(claims, tab);
  };

  const renderClaim = ({ item: c }) => (
    <Card style={styles.claimCard}>
      <View style={styles.claimTop}>
        <View style={styles.claimLeft}>
          {/* Backend field: trigger_type (not event_type) */}
          <Text style={styles.claimIcon}>
            {TRIGGER_ICONS[c.trigger_type?.toLowerCase()] || '⚡'}
          </Text>
          <View>
            <Text style={styles.claimType}>
              {c.trigger_type?.toUpperCase() || 'DISRUPTION'}
            </Text>
            <Text style={styles.claimDate}>{c.created_at}</Text>
          </View>
        </View>
        <Badge label={c.status} />
      </View>
      <View style={styles.claimBottom}>
        <Text style={styles.claimDesc}>{STATUS_DESC[c.status] || c.status}</Text>
        {/* Backend field: payout_amount (not amount) */}
        {c.payout_amount > 0 && (
          <Text style={styles.claimAmount}>₹{c.payout_amount}</Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader
          title="🗂️ My Claims"
          subtitle="Auto-generated when disruptions are detected"
        />
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal
        data={FILTER_OPTIONS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={{ flexGrow: 0, marginBottom: 8 }}
        renderItem={({ item: tab }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => onTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={c => String(c.claim_id)}
        renderItem={renderClaim}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          !loading
            ? <EmptyState
                icon="🗂️"
                title="No claims found"
                subtitle="Claims appear automatically when a weather disruption hits your city"
              />
            : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  tabs:          { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tab:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.full,
                   backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  tabActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:       { fontSize: 12, fontWeight: FONTS.semibold, color: COLORS.textLight },
  tabTextActive: { color: COLORS.white },
  list:          { paddingHorizontal: 16, paddingBottom: 32 },
  claimCard:     { marginBottom: 10 },
  claimTop:      { flexDirection: 'row', justifyContent: 'space-between',
                   alignItems: 'center', marginBottom: 10 },
  claimLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  claimIcon:     { fontSize: 28 },
  claimType:     { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text },
  claimDate:     { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  claimBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimDesc:     { fontSize: 12, color: COLORS.textLight, flex: 1 },
  claimAmount:   { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.success },
});