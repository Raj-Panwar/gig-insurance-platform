import React from "react";
import PayoutsScreen from "../../features/payouts/PayoutsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../../shared/SplashScreen";
import OnboardingScreen from "../../shared/OnboardingScreen";
import LanguageScreen from "../../shared/LanguageScreen";

import Dashboard from "../../features/dashboard/Dashboard";
import LoginScreen from "../../features/auth/LoginScreen";

// ✅ EXISTING SCREENS
import ClaimsScreen from "../../features/claims/ClaimsScreen";
import WorkersScreen from "../../features/workers/WorkersScreen";
import PolicyScreen from "../../features/policy/PolicyScreen";

// ✅ ADDED (NEW — SAFE)
import PolicyListScreen from "../../features/policy/PolicyListScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {/* CORE FLOW */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* MAIN APP */}
        <Stack.Screen name="Dashboard" component={Dashboard} />

        {/* FEATURE SCREENS */}
        <Stack.Screen name="Claims" component={ClaimsScreen} />
        <Stack.Screen name="Workers" component={WorkersScreen} />
        <Stack.Screen name="Policies" component={PolicyScreen} />

        {/* ✅ NEW SCREEN (SAFE ADD) */}
        <Stack.Screen name="PoliciesList" component={PolicyListScreen} />

        {/* 🔥 ADD THIS (YOU MISSED THIS) */}
        <Stack.Screen name="Payouts" component={PayoutsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}