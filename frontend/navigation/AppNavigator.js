// navigation/AppNavigator.js
console.log("APP NAVIAGATRO");
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RegisterScreen  from '../screens/RegisterScreen';
import LoginScreen     from '../screens/LoginScreen';
import WorkerDashboard from '../screens/WorkerDashboard';
import BuyPolicyScreen from '../screens/BuyPolicyScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  console.log("log 1");
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Register"
        screenOptions={{
          headerStyle: { backgroundColor: '#1976d2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Register"        component={RegisterScreen}  options={{ title: 'Create Account' }} />
        <Stack.Screen name="Login"           component={LoginScreen}     options={{ title: 'Login' }} />
        <Stack.Screen
          name="WorkerDashboard"
          component={WorkerDashboard}
          options={{ title: 'GigShield Dashboard', headerLeft: () => null }}
        />
        <Stack.Screen name="BuyPolicyScreen" component={BuyPolicyScreen} options={{ title: 'Activate Policy' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}