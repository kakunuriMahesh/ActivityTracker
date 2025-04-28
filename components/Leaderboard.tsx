import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface User {
  email: string;
  totalDistance: number;
}

interface LeaderboardProps {
  users: User[];
}

export default function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.totalDistance - a.totalDistance);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={sortedUsers}
        keyExtractor={(item) => item.email}
        renderItem={({ item, index }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>
              {index + 1}. {item.email} - {item.totalDistance} km
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});