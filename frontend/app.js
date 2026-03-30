// App.js
console.log("APP STARTED");
import 'react-native-gesture-handler'; // Must be the very first import
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}