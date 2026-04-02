// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SHADOW } from '../constants';

// Screens
import SplashScreen    from '../screens/SplashScreen';
import LoginScreen     from '../screens/LoginScreen';
import RegisterScreen  from '../screens/RegisterScreen';
import HomeScreen      from '../screens/HomeScreen';
import PolicyScreen    from '../screens/PolicyScreen';
import ClaimsScreen    from '../screens/ClaimsScreen';
import PayoutsScreen   from '../screens/PayoutsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab Icon ─────────────────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle:  tabStyles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) =>
          <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Policy"
        component={PolicyScreen}
        options={{ tabBarIcon: ({ focused }) =>
          <TabIcon emoji="📋" label="Policy" focused={focused} /> }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsScreen}
        options={{ tabBarIcon: ({ focused }) =>
          <TabIcon emoji="🗂️" label="Claims" focused={focused} /> }}
      />
      <Tab.Screen
        name="Payouts"
        component={PayoutsScreen}
        options={{ tabBarIcon: ({ focused }) =>
          <TabIcon emoji="💰" label="Payouts" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Root Stack ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"    component={SplashScreen} />
        <Stack.Screen name="Login"     component={LoginScreen} />
        <Stack.Screen name="Register"  component={RegisterScreen} />
        <Stack.Screen name="MainTabs"  component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
    ...SHADOW.md,
  },
  iconWrap:       { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4,
                    borderRadius: 12, minWidth: 64 },
  iconWrapActive: { backgroundColor: COLORS.primary + '12' },
  emoji:          { fontSize: 22, marginBottom: 2 },
  label:          { fontSize: 10, fontWeight: FONTS.semibold, color: COLORS.textMuted },
  labelActive:    { color: COLORS.primary },
});