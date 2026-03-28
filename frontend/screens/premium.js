// screens/PremiumScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { calculatePremium } from '../services/api';

export default function PremiumScreen({ navigation, route }) {
  const { userId } = route.params;
  const [zoneId, setZoneId] = useState('');
  const [premium, setPremium] = useState(null);

  const handleCalculate = async () => {
    try {
      const res = await calculatePremium({ zone_id: zoneId });
      setPremium(res.data.weekly_premium);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to calculate premium');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculate Premium</Text>
      <TextInput placeholder="Zone ID" style={styles.input} value={zoneId} onChangeText={setZoneId}/>
      <Button title="Calculate" onPress={handleCalculate}/>
      {premium && <Text style={{marginTop:20}}>Weekly Premium: ${premium}</Text>}
      {premium && <Button title="Buy Policy" onPress={() => navigation.navigate('BuyPolicyScreen', { userId, zoneId, premium })}/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  input: { borderWidth:1, borderColor:'#ccc', padding:10, marginVertical:5, borderRadius:5 },
  title: { fontSize:24, marginBottom:20, textAlign:'center' },
});