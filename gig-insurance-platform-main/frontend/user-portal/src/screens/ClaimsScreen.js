// src/screens/ClaimsScreen.js
// Changes: removed APPROVED from filter tabs, added manual claim button (FAB),
//          manual claim sends location + selected time
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity, Modal,
  Alert, Platform,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants';
import { Card, Badge, EmptyState, SectionHeader, Button, Input } from '../components';
import { getWorkerClaims } from '../services/dashboardService';
import { getUserId } from '../services/authService';
import { getCurrentCoords, getCityFromCoords } from '../services/locationService';
import apiClient from '../api/apiClient';

const TRIGGER_ICONS = { rain: '🌧️', aqi: '🏭', heat: '🌡️' };
// Removed APPROVED from filter tabs as requested
const FILTER_OPTIONS = ['ALL', 'PAID', 'PENDING', 'FLAGGED', 'REJECTED'];

const STATUS_DESC = {
  APPROVED: 'Claim verified — payout processing',
  PAID:     'Payout disbursed to your account',
  PENDING:  'Under review',
  FLAGGED:  'Location mismatch detected',
  REJECTED: 'Does not meet trigger criteria',
};

// Time options for manual claim
const TIME_OPTIONS = ['Now', 'Past 1 hour', 'Past 3 hours', 'Past 6 hours', 'Earlier today'];

export default function ClaimsScreen() {
  const [claims,       setClaims]       = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [activeTab,    setActiveTab]    = useState('ALL');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // Manual claim modal state
  const [showManual,   setShowManual]   = useState(false);
  const [manualType,   setManualType]   = useState('rain');
  const [manualTime,   setManualTime]   = useState('Now');
  const [submitting,   setSubmitting]   = useState(false);

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

  const handleManualClaim = async () => {
  console.log("🔥 BUTTON CLICKED");

  setSubmitting(true);

  try {
    const id = await getUserId();

    const city = "Chandigarh";   // ✅ FIXED

    console.log("🔥 SENDING CLAIM:", {
      user_id: id,
      event_type: manualType,
      location: city,
    });

    await apiClient.post('/trigger/event', {
      user_id: parseInt(id),
      event_type: manualType.toUpperCase(),
      location: city,
      severity: 60,
    });

    console.log("✅ API CALLED");

    setShowManual(false);
    Alert.alert('✅ Claim Submitted', 'Your manual claim has been submitted!');
    load();

  } catch (err) {
    console.log("❌ ERROR:", err);
    Alert.alert('Error', err?.message || 'Failed to submit claim.');
  } finally {
    setSubmitting(false);
  }
};





  const renderClaim = ({ item: c }) => (
    <Card style={styles.claimCard}>
      <View style={styles.claimTop}>
        <View style={styles.claimLeft}>
          <Text style={styles.claimIcon}>
            {TRIGGER_ICONS[c.trigger_type?.toLowerCase()] || '⚡'}
          </Text>
          <View>
            <Text style={styles.claimType}>{c.trigger_type?.toUpperCase() || 'DISRUPTION'}</Text>
            <Text style={styles.claimDate}>{c.created_at}</Text>
          </View>
        </View>
        <Badge label={c.status} />
      </View>
      <View style={styles.claimBottom}>
        <Text style={styles.claimDesc}>{STATUS_DESC[c.status] || c.status}</Text>
        {c.payout > 0 && (
          <Text style={styles.claimAmount}>₹{c.payout}</Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title="🗂️ My Claims" subtitle="Auto-generated when disruptions are detected" />
      </View>

      {/* Filter tabs — APPROVED removed */}
      <FlatList
        horizontal data={FILTER_OPTIONS} keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={{ flexGrow: 0, marginBottom: 8 }}
        renderItem={({ item: tab }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => onTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
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
            ? <EmptyState icon="🗂️" title="No claims found"
                subtitle="Claims appear automatically when a disruption hits your city" />
            : null
        }
      />

      {/* ── Manual Claim FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowManual(true)}>
        <Text style={styles.fabText}>+ Claim</Text>
      </TouchableOpacity>

      {/* ── Manual Claim Modal ── */}
      <Modal visible={showManual} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manual Claim</Text>
            <Text style={styles.modalSubtitle}>
              Your current location will be sent automatically
            </Text>

            <Text style={styles.modalLabel}>Event Type</Text>
            <View style={styles.typeGrid}>
              {[
                { key: 'rain', icon: '🌧️', label: 'Heavy Rain' },
                { key: 'aqi',  icon: '🏭', label: 'Pollution'  },
                { key: 'heat', icon: '🌡️', label: 'Heatwave'   },
              ].map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeChip, manualType === t.key && styles.typeChipActive]}
                  onPress={() => setManualType(t.key)}
                >
                  <Text style={styles.typeEmoji}>{t.icon}</Text>
                  <Text style={[styles.typeChipText, manualType === t.key && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { marginTop: 16 }]}>When did it happen?</Text>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, manualTime === t && styles.timeChipActive]}
                  onPress={() => setManualTime(t)}
                >
                  <Text style={[styles.timeText, manualTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowManual(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Button
                title={submitting ? 'Submitting...' : 'Submit Claim'}
                onPress={handleManualClaim}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  header:          { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  tabs:            { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tab:             { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.full,
                     backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  tabActive:       { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:         { fontSize: 12, fontWeight: FONTS.semibold, color: COLORS.textLight },
  tabTextActive:   { color: COLORS.white },
  list:            { paddingHorizontal: 16, paddingBottom: 100 },
  claimCard:       { marginBottom: 10 },
  claimTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  claimLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  claimIcon:       { fontSize: 28 },
  claimType:       { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text },
  claimDate:       { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  claimBottom:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimDesc:       { fontSize: 12, color: COLORS.textLight, flex: 1 },
  claimAmount:     { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.success },

  fab:             { position: 'absolute', bottom: 24, right: 20,
                     backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
                     paddingHorizontal: 20, paddingVertical: 14,
                     shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  fabText:         { color: COLORS.white, fontWeight: FONTS.bold, fontSize: 14 },

  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                     justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: COLORS.white, borderTopLeftRadius: 24,
                     borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:      { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  modalSubtitle:   { fontSize: 13, color: COLORS.textLight, marginBottom: 20 },
  modalLabel:      { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: 10 },

  typeGrid:        { flexDirection: 'row', gap: 10 },
  typeChip:        { flex: 1, alignItems: 'center', padding: 12, borderRadius: RADIUS.md,
                     borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  typeChipActive:  { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary },
  typeEmoji:       { fontSize: 22, marginBottom: 4 },
  typeChipText:    { fontSize: 12, color: COLORS.textLight, fontWeight: FONTS.semibold },
  typeChipTextActive: { color: COLORS.primary },

  timeGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
                     borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  timeChipActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText:        { fontSize: 12, color: COLORS.textLight, fontWeight: FONTS.medium },
  timeTextActive:  { color: COLORS.white },

  modalActions:    { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 14,
                     borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  cancelText:      { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.textLight },
});