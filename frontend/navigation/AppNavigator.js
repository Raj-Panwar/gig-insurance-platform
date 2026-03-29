// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen  from '../screens/RegisterScreen';
import LoginScreen     from '../screens/LoginScreen';
import WorkerDashboard from '../screens/WorkerDashboard';
import BuyPolicyScreen from '../screens/BuyPolicyScreen';

// Flow: Register → Login → WorkerDashboard → BuyPolicyScreen
// PremiumScreen removed — premium is auto-calculated on the Dashboard.

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Register"        component={RegisterScreen}  options={{ title: 'Create Account' }} />
        <Stack.Screen name="Login"           component={LoginScreen}     options={{ title: 'Login' }} />
        <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} options={{ title: 'Dashboard', headerLeft: () => null }} />
        <Stack.Screen name="BuyPolicyScreen" component={BuyPolicyScreen} options={{ title: 'Activate Policy' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}