// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import PremiumScreen from '../screens/PremiumScreen';
import BuyPolicyScreen from '../screens/BuyPolicyScreen';
import WorkerDashboard from '../screens/WorkerDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PremiumScreen" component={PremiumScreen} />
        <Stack.Screen name="BuyPolicyScreen" component={BuyPolicyScreen} />
        <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}