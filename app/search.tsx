

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
  const { challengeId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; email: string }[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search`, {
        params: { query: searchQuery },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to search users');
    }
  };

  const toggleUserSelection = (user: { userId: string; email: string }) => {
    if (selectedUsers.find((u) => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleConfirm = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (!currentUser) {
        alert('No user logged in');
        return;
      }
      const user = JSON.parse(currentUser);
      // Update challenge with assigneeIds and create notifications
      await axios.patch(`http://localhost:5000/api/challenges/${challengeId}`, {
        assigneeIds: selectedUsers.map((u) => u.userId),
        creatorId: user.userId,
      });
      alert('Challenge assigned!');
      router.push('/');
    } catch (err) {
      setError('Failed to assign challenge');
    }
  };

  const renderUser = ({ item }: { item: { userId: string; email: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUsers.find((u) => u.userId === item.userId) && styles.selectedUser,
      ]}
      onPress={() => toggleUserSelection(item)}
    >
      <Text>{item.name} ({item.email})</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Opponents</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by userId or email"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
      />
      <Text style={styles.sectionTitle}>Selected Users:</Text>
      <FlatList
        data={selectedUsers}
        renderItem={({ item }) => (
          <View style={styles.tag}>
            <Text>{item.email}</Text>
            <Button
              title="Remove"
              onPress={() => toggleUserSelection(item)}
              color="red"
            />
          </View>
        )}
        keyExtractor={(item) => item.userId}
        horizontal
      />
      <Button title="Confirm" onPress={handleConfirm} disabled={selectedUsers.length === 0} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  userItem: { padding: 10, borderBottomWidth: 1 },
  selectedUser: { backgroundColor: '#e0e0e0' },
  tag: { flexDirection: 'row', alignItems: 'center', padding: 5, marginRight: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  error: { color: 'red', marginBottom: 10 },
});

// TODO: adding DB

// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router, useLocalSearchParams } from 'expo-router';
// import { User, Challenge } from '../constants/schema';

// export default function SearchScreen() {
//   const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const storedUsers = await AsyncStorage.getItem('users');
//         if (storedUsers) {
//           setUsers(JSON.parse(storedUsers));
//         }
//       } catch (error) {
//         console.error('Error loading users:', error);
//       }
//     };
//     loadUsers();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredUsers([]);
//     } else {
//       const lowerQuery = searchQuery.toLowerCase();
//       setFilteredUsers(
//         users.filter(
//           (user) =>
//             user.name.toLowerCase().includes(lowerQuery) ||
//             user.email.toLowerCase().includes(lowerQuery) ||
//             user.userId.toLowerCase().includes(lowerQuery)
//         )
//       );
//     }
//   }, [searchQuery, users]);

//   const toggleUserSelection = (userId: string) => {
//     setSelectedUserIds((prev) =>
//       prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
//     );
//   };

//   const handleSendChallenge = async () => {
//     if (!challengeId || selectedUserIds.length === 0) {
//       alert('Please select at least one user');
//       return;
//     }
//     try {
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       allChallenges = allChallenges.map((c) =>
//         c.challengeId === challengeId ? { ...c, assigneeIds: selectedUserIds, status: 'Active' } : c
//       );
//       await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));
//       alert('Challenge sent to selected users');
//       router.push('/tasks');
//     } catch (error) {
//       console.error('Error sending challenge:', error);
//       alert('Error sending challenge');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Opponents</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Search by name, email, or user ID"
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       <FlatList
//         data={filteredUsers}
//         keyExtractor={(item) => item.userId}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={[
//               styles.userItem,
//               selectedUserIds.includes(item.userId) && styles.selectedUserItem,
//             ]}
//             onPress={() => toggleUserSelection(item.userId)}
//           >
//             <Text>{item.name} ({item.email})</Text>
//             <Text>User ID: {item.userId}</Text>
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>
//             {searchQuery.trim() === '' ? 'Enter a search query' : 'No users found'}
//           </Text>
//         }
//       />
//       <Button title="Send Challenge" onPress={handleSendChallenge} />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 20,
//     borderRadius: 5,
//   },
//   userItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   selectedUserItem: {
//     backgroundColor: '#e0f7fa',
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginTop: 20,
//   },
// });