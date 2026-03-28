import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CardItem from '../components/CardItem';

const DATA = [
  { id: '1', title: 'Item One' },
  { id: '2', title: 'Item Two' },
  { id: '3', title: 'Item Three' },
];

export default function HomeScreen() {
  const handlePress = (title) => {
    Alert.alert('Clicked', `You pressed ${title}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GigShieldApp</Text>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardItem title={item.title} onPress={() => handlePress(item.title)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});