// src/screens/PayoutsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants';
import { Card, EmptyState, SectionHeader } from '../components';
import { getWorkerPayouts } from '../services/dashboardService';
import { getUserId } from '../services/authService';

export default function PayoutsScreen() {
  const [payouts,    setPayouts]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const id = await getUserId();
    if (!id) return;
    try {
      const data = await getWorkerPayouts(parseInt(id));
      // Backend returns: { user_id, total_payouts, total_amount, payouts[] }
      setPayouts(data.payouts    || []);
      setTotal(data.total_amount || 0);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const renderPayout = ({ item: p, index }) => (
    <Card style={styles.payoutCard}>
      <View style={styles.payoutTop}>
        <View style={styles.payoutLeft}>
          <View style={styles.payoutIconWrap}>
            <Text style={styles.payoutEmoji}>💸</Text>
          </View>
          <View>
            {/* Backend field: transaction_id */}
            <Text style={styles.txnId}>{p.transaction_id}</Text>
            {/* Backend field: processed_at */}
            <Text style={styles.payoutDate}>{p.processed_at || '—'}</Text>
          </View>
        </View>
        {/* Backend field: amount */}
        <Text style={styles.payoutAmount}>₹{p.amount}</Text>
      </View>
      <View style={styles.payoutBottom}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
        {/* Backend field: status */}
        <Text style={styles.statusText}>{p.status} · Income Protection Payout</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader
          title="💰 Payout History"
          subtitle="Income protection payments received"
        />
      </View>

      {/* Total Banner */}
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total Income Protected</Text>
        <Text style={styles.totalValue}>₹{total}</Text>
        <Text style={styles.totalSub}>{payouts.length} payouts received</Text>
      </View>

      <FlatList
        data={payouts}
        keyExtractor={(p, i) => String(p.transaction_id || i)}
        renderItem={renderPayout}
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
                icon="💰"
                title="No payouts yet"
                subtitle="Payouts are sent automatically when your claims are approved"
              />
            : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  totalBanner:  { marginHorizontal: 20, marginBottom: 16, backgroundColor: COLORS.primary,
                  borderRadius: RADIUS.lg, padding: 20, alignItems: 'center' },
  totalLabel:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                  letterSpacing: 0.5, marginBottom: 6 },
  totalValue:   { fontSize: 38, fontWeight: FONTS.extrabold, color: COLORS.white },
  totalSub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  list:         { paddingHorizontal: 16, paddingBottom: 32 },
  payoutCard:   { marginBottom: 10 },
  payoutTop:    { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 10 },
  payoutLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payoutIconWrap:{ width: 44, height: 44, borderRadius: 12,
                  backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center' },
  payoutEmoji:  { fontSize: 22 },
  txnId:        { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text },
  payoutDate:   { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  payoutAmount: { fontSize: 20, fontWeight: FONTS.extrabold, color: COLORS.success },
  payoutBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusText:   { fontSize: 12, color: COLORS.textLight },
});