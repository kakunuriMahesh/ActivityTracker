import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState('');
  const [responseReason, setResponseReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          return;
        }
        const user = JSON.parse(currentUser);
        setUserId(user.userId);
        const response = await axios.get(`http://localhost:5000/api/notifications/${user.userId}`);
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to load notifications');
      }
    };
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map((n: any) =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const clearNotification = async (notificationId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
      setNotifications(notifications.filter((n: any) => n._id !== notificationId));
    } catch (err) {
      setError('Failed to clear notification');
    }
  };

  const handleResponse = async (challengeId: string, resp: 'agree' | 'reject' | 'skip') => {
    try {
      await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
        userId,
        response: resp,
        responseReason: resp !== 'agree' ? responseReason : undefined,
      });
      setNotifications(notifications.filter((n: any) => n.challengeId !== challengeId));
      setSelectedChallenge(null);
      setResponse('');
      setResponseReason('');
    } catch (err) {
      setError('Failed to respond to challenge');
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <View style={[styles.notificationItem, !item.read && styles.unread]}>
      <TouchableOpacity
        onPress={async () => {
          await markAsRead(item._id);
          if (item.type === 'challenge_received') {
            const response = await axios.get(`http://localhost:5000/api/challenges/${item.challengeId}`);
            setSelectedChallenge(response.data);
          }
        }}
      >
        <Text>{item.message}</Text>
        <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => clearNotification(item._id)}>
        <Text style={styles.clearButton}>Clear</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No notifications</Text>}
      />
      <Modal visible={!!selectedChallenge} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedChallenge && (
            <>
              <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
              <Text>Activity: {selectedChallenge.taskId.activity}</Text>
              <Text>Distance: {selectedChallenge.taskId.distance} km</Text>
              <Text>Duration: {selectedChallenge.duration}</Text>
              <Text>Rules: {selectedChallenge.rules.join(', ')}</Text>
              <Text>Exceptions: {selectedChallenge.exceptions.join(', ')}</Text>
              <Text>Reward: {selectedChallenge.reward}</Text>
              <View style={styles.responseContainer}>
                <Button title="Agree" onPress={() => handleResponse(selectedChallenge._id, 'agree')} />
                <Button title="Reject" onPress={() => setResponse('reject')} />
                <Button title="Skip" onPress={() => setResponse('skip')} />
              </View>
              {response && (
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Reason for rejection/skip"
                    value={responseReason}
                    onChangeText={setResponseReason}
                  />
                  <Button
                    title={`Confirm ${response}`}
                    onPress={() => handleResponse(selectedChallenge._id, response as 'reject' | 'skip')}
                  />
                </View>
              )}
              <Button title="Close" onPress={() => setSelectedChallenge(null)} />
            </>
          )}
        </View>
      </Modal>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  notificationItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unread: { backgroundColor: '#e0f7fa' },
  modalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  responseContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10 },
  clearButton: { color: 'red', fontWeight: 'bold' },
});

// FIXME: TODO: below is working but nor clearing the notifications

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   Button,
//   TextInput,
//   StyleSheet,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// export default function NotificationsScreen() {
//   const [notifications, setNotifications] = useState([]);
//   const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadNotifications = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(`http://localhost:5000/api/users/${user.userId}/notifications`);
//         setNotifications(response.data);
//       } catch (err) {
//         setError('Failed to load notifications');
//       }
//     };
//     loadNotifications();
//   }, []);

//   const markAsRead = async (notificationId: string) => {
//     try {
//       await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
//       setNotifications(notifications.map((n: any) =>
//         n._id === notificationId ? { ...n, read: true } : n
//       ));
//     } catch (err) {
//       setError('Failed to mark notification as read');
//     }
//   };

//   const handleResponse = async (challengeId: string, resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       setNotifications(notifications.filter((n: any) => n.challengeId !== challengeId));
//       setSelectedChallenge(null);
//       setResponse('');
//       setResponseReason('');
//     } catch (err) {
//       setError('Failed to respond to challenge');
//     }
//   };

//   const renderNotification = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={[styles.notificationItem, !item.read && styles.unread]}
//       onPress={async () => {
//         await markAsRead(item._id);
//         if (item.type === 'challenge_received') {
//           const response = await axios.get(`http://localhost:5000/api/challenges/${item.challengeId}`);
//           setSelectedChallenge(response.data);
//         }
//       }}
//     >
//       <Text>{item.message}</Text>
//       <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Notifications</Text>
//       {error && <Text style={styles.error}>{error}</Text>}
//       <FlatList
//         data={notifications}
//         renderItem={renderNotification}
//         keyExtractor={(item) => item._id}
//         ListEmptyComponent={<Text>No notifications</Text>}
//       />
//       <Modal visible={!!selectedChallenge} animationType="slide">
//         <View style={styles.modalContainer}>
//           {selectedChallenge && (
//             <>
//               <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
//               <Text>Activity: {selectedChallenge.taskId.activity}</Text>
//               <Text>Distance: {selectedChallenge.taskId.distance} km</Text>
//               <Text>Duration: {selectedChallenge.duration}</Text>
//               <Text>Rules: {selectedChallenge.rules.join(', ')}</Text>
//               <Text>Exceptions: {selectedChallenge.exceptions.join(', ')}</Text>
//               <Text>Reward: {selectedChallenge.reward}</Text>
//               <View style={styles.responseContainer}>
//                 <Button title="Agree" onPress={() => handleResponse(selectedChallenge._id, 'agree')} />
//                 <Button title="Reject" onPress={() => setResponse('reject')} />
//                 <Button title="Skip" onPress={() => setResponse('skip')} />
//               </View>
//               {response && (
//                 <View>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Reason for rejection/skip"
//                     value={responseReason}
//                     onChangeText={setResponseReason}
//                   />
//                   <Button
//                     title={`Confirm ${response}`}
//                     onPress={() => handleResponse(selectedChallenge._id, response as 'reject' | 'skip')}
//                   />
//                 </View>
//               )}
//               <Button title="Close" onPress={() => setSelectedChallenge(null)} />
//             </>
//           )}
//         </View>
//       </Modal>
//       <Button title="Back" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   notificationItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
//   unread: { backgroundColor: '#e0f7fa' },
//   modalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
//   modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   responseContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
// });

// TODO: display notifications

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function NotificationsScreen() {
//   const [notifications, setNotifications] = useState([]);
//   const [userId, setUserId] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadUser = async () => {
//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const parsedUser = JSON.parse(currentUser);
//         setUserId(parsedUser.userId);
//         // Fetch notifications
//         try {
//           const response = await axios.get(`http://localhost:5000/api/users/${parsedUser.userId}/notifications`);
//           setNotifications(response.data);
//         } catch (err) {
//           setError('Failed to fetch notifications');
//         }
//       }
//     };
//     loadUser();
//   }, []);

//   const renderNotification = ({ item }) => (
//     <View style={styles.notification}>
//       <Text>{item.message}</Text>
//       <Text>{new Date(item.createdAt).toLocaleString()}</Text>
//       <Text>{item.read ? 'Read' : 'Unread'}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Notifications</Text>
//       {error && <Text style={styles.error}>{error}</Text>}
//       <FlatList
//         data={notifications}
//         renderItem={renderNotification}
//         keyExtractor={item => item.notificationId}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   notification: { padding: 10, borderBottomWidth: 1, marginBottom: 10 },
//   error: { color: 'red', marginBottom: 10 },
// });