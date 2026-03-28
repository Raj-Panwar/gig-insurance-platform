// screens/BuyPolicyScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { buyPolicy } from '../services/api';

export default function BuyPolicyScreen({ navigation, route }) {
  const { userId, zoneId, premium } = route.params;
  const coverageAmount = 1000; // Example fixed coverage

  const handleBuy = async () => {
    try {
      await buyPolicy({ user_id: userId, zone_id: zoneId, weekly_premium: premium, coverage_amount: coverageAmount });
      Alert.alert('Success', 'Policy purchased!');
      navigation.navigate('WorkerDashboard');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to buy policy');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buy Policy</Text>
      <Text>Weekly Premium: ${premium}</Text>
      <Text>Coverage Amount: ${coverageAmount}</Text>
      <Button title="Confirm Purchase" onPress={handleBuy}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  title: { fontSize:24, marginBottom:20, textAlign:'center' },
});