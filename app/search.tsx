import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { User, Challenge } from '../constants/schema';

export default function SearchScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery) ||
            user.userId.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, users]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSendChallenge = async () => {
    if (!challengeId || selectedUserIds.length === 0) {
      alert('Please select at least one user');
      return;
    }
    try {
      const storedChallenges = await AsyncStorage.getItem('challenges');
      let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
      allChallenges = allChallenges.map((c) =>
        c.challengeId === challengeId ? { ...c, assigneeIds: selectedUserIds, status: 'Active' } : c
      );
      await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));
      alert('Challenge sent to selected users');
      router.push('/tasks');
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert('Error sending challenge');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Opponents</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name, email, or user ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUserIds.includes(item.userId) && styles.selectedUserItem,
            ]}
            onPress={() => toggleUserSelection(item.userId)}
          >
            <Text>{item.name} ({item.email})</Text>
            <Text>User ID: {item.userId}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery.trim() === '' ? 'Enter a search query' : 'No users found'}
          </Text>
        }
      />
      <Button title="Send Challenge" onPress={handleSendChallenge} />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedUserItem: {
    backgroundColor: '#e0f7fa',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});