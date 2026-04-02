// src/components/index.js
// All shared components exported from one place

import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, FONTS } from '../constants';

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ title, onPress, loading, variant = 'primary', style, disabled }) {
  const bg = {
    primary: COLORS.primary,
    success: COLORS.success,
    danger:  COLORS.danger,
    outline: 'transparent',
    ghost:   'transparent',
  }[variant] || COLORS.primary;

  const textColor = variant === 'outline' ? COLORS.primary : COLORS.white;
  const border    = variant === 'outline' ? { borderWidth: 1.5, borderColor: COLORS.primary } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg }, border,
              (disabled || loading) && styles.btnDisabled, style]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} size="small" />
        : <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  ACTIVE:   { bg: '#e8f5e9', text: '#2e7d32' },
  APPROVED: { bg: '#e8f5e9', text: '#2e7d32' },
  PAID:     { bg: '#e3f2fd', text: '#1565c0' },
  PENDING:  { bg: '#fff8e1', text: '#f57f17' },
  FLAGGED:  { bg: '#fff3e0', text: '#e65100' },
  REJECTED: { bg: '#ffebee', text: '#c62828' },
  EXPIRED:  { bg: '#f5f5f5', text: '#757575' },
  HIGH:     { bg: '#ffebee', text: '#c62828' },
  MEDIUM:   { bg: '#fff8e1', text: '#f57f17' },
  LOW:      { bg: '#e8f5e9', text: '#2e7d32' },
};

export function Badge({ label }) {
  const s = BADGE_STYLES[label?.toUpperCase()] || { bg: '#f5f5f5', text: '#757575' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
    </View>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = COLORS.primary }) {
  return (
    <View style={[styles.statCard, SHADOW.sm]}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── Screen Header ─────────────────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: { borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 20,
         alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontSize: 15, fontWeight: FONTS.bold, letterSpacing: 0.3 },

  // Input
  inputWrap:      { marginBottom: 16 },
  inputLabel:     { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: 6 },
  input:          { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
                    paddingVertical: 12, paddingHorizontal: 14, fontSize: 15,
                    color: COLORS.text, backgroundColor: COLORS.white },
  inputError:     { borderColor: COLORS.danger },
  inputErrorText: { fontSize: 12, color: COLORS.danger, marginTop: 4 },

  // Card
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16,
          ...SHADOW.sm },

  // Badge
  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: 11, fontWeight: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.4 },

  // Section Header
  sectionHeader:   { marginBottom: 12, marginTop: 8 },
  sectionTitle:    { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.text },
  sectionSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },

  // Stat Card
  statCard:  { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 16,
               alignItems: 'center', flex: 1 },
  statIcon:  { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: FONTS.extrabold, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: FONTS.semibold,
               textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },

  // Empty State
  emptyState:    { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon:     { fontSize: 48, marginBottom: 16 },
  emptyTitle:    { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },

  // Screen Header
  screenHeader:   { marginBottom: 20 },
  screenTitle:    { fontSize: 24, fontWeight: FONTS.extrabold, color: COLORS.text },
  screenSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
});