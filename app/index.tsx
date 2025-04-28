import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ActivityChart from '../components/ActivityChart';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracker - Dashboard</Text>
      <ActivityChart />
      <Button title="Create Task" onPress={() => router.push('/task')} />
      <Button
        title="View Tasks"
        onPress={() => {
          try {
            router.push('/tasks');
          } catch (error) {
            console.error('Navigation error:', error);
            alert('Failed to navigate to Tasks');
          }
        }}
      />
      <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
      <Button title="View Profile" onPress={() => router.push('/profile')} />
      <Button title="View Leaderboard" onPress={() => router.push('/profile')} />
      <Button title="Logout" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});