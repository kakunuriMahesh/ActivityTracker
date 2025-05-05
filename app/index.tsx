
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          router.push('/login');
          return;
        }
        const userData = JSON.parse(currentUser);
        setUser(userData);
        const response = await axios.get(`http://localhost:5000/api/notifications/${userData.userId}`);
        const unread = response.data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => router.push('/notifications')}
      >
        <MaterialIcons name="notifications" size={30} color="#007AFF" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>View Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/tasks')}
      >
        <Text style={styles.buttonText}>View Tasks & Challenges</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/challenge')}
      >
        <Text style={styles.buttonText}>Create Challenge</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  notificationButton: { position: 'absolute', top: 20, right: 20 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: 'white', fontSize: 12 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  error: { color: 'red', marginTop: 20, textAlign: 'center' },
});

// FIXME: below is woring but fixing profile

// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import axios from 'axios';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function HomeScreen() {
//   const [user, setUser] = useState<any>(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           router.push('/login');
//           return;
//         }
//         const userData = JSON.parse(currentUser);
//         setUser(userData);
//         const response = await axios.get(`http://localhost:5000/api/users/${userData.userId}/notifications`);
//         const unread = response.data.filter((n: any) => !n.read).length;
//         setUnreadCount(unread);
//       } catch (err) {
//         setError('Failed to load user data');
//       }
//     };
//     loadUser();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
//       <TouchableOpacity
//         style={styles.notificationButton}
//         onPress={() => router.push('/notifications')}
//       >
//         <MaterialIcons name="notifications" size={30} color="#007AFF" />
//         {unreadCount > 0 && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>{unreadCount}</Text>
//           </View>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => router.push('/tasks')}
//       >
//         <Text style={styles.buttonText}>View Tasks & Challenges</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => router.push('/challenge')}
//       >
//         <Text style={styles.buttonText}>Create Challenge</Text>
//       </TouchableOpacity>
//       {error && <Text style={styles.error}>{error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   notificationButton: { position: 'absolute', top: 20, right: 20 },
//   badge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: 'red',
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   badgeText: { color: 'white', fontSize: 12 },
//   button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, marginTop: 10 },
//   buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
//   error: { color: 'red', marginTop: 20, textAlign: 'center' },
// });

// TODO: adding home screen

// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, Image } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import { User } from '../constants/schema';
// import { initializeMockData } from '../constants/mockData';

// export default function DashboardScreen() {
//   const [user, setUser] = useState<User | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         // Debug AsyncStorage
//         console.log('Users:', await AsyncStorage.getItem('users'));
//         console.log('Current User:', await AsyncStorage.getItem('currentUser'));

//         // Clear AsyncStorage (run once, then comment out)
//         // await AsyncStorage.clear();
//         // console.log('AsyncStorage cleared');

//         // Initialize mock data if not present
//         const users = await AsyncStorage.getItem('users');
//         if (!users) {
//           await initializeMockData();
//           console.log('Mock data initialized');
//         }

//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (currentUser) {
//           try {
//             const parsedUser = JSON.parse(currentUser);
//             setUser(parsedUser);
//           } catch (parseError) {
//             console.error('Error parsing currentUser:', parseError);
//             setError('Invalid user data. Please log in again.');
//             await AsyncStorage.removeItem('currentUser');
//             router.replace('/login');
//           }
//         } else {
//           router.replace('/login');
//         }
//       } catch (error) {
//         console.error('Error loading user:', error);
//         setError('Failed to load user data');
//         router.replace('/login');
//       }
//     };
//     loadUser();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('currentUser');
//       router.replace('/login');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.error}>{error}</Text>
//         <Button title="Go to Login" onPress={() => router.replace('/login')} />
//       </View>
//     );
//   }

//   if (!user) {
//     return <View><Text>Loading...</Text></View>;
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome, {user.name}!</Text>
//       {user.image && (
//         <Image
//           source={{ uri: user.image }}
//           style={styles.profileImage}
//           accessibilityLabel="User profile picture"
//         />
//       )}
//       <Text style={styles.subtitle}>Email: {user.email}</Text>
//       <Button title="Go to Tasks" onPress={() => router.push('/tasks')} />
//       <Button title="Create Task" onPress={() => router.push('/task')} />
//       <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
//       <Button title="View Profile" onPress={() => router.push('/profile')} />
//       <Button title="Search Users" onPress={() => router.push('/search')} />
//       <Button title="Logout" onPress={handleLogout} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 20,
//   },
//   error: {
//     fontSize: 16,
//     color: 'red',
//     marginBottom: 20,
//   },
// });

// TODO: IN Phone signUp error

// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, Image } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import { User } from '../constants/schema';

// export default function DashboardScreen() {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (currentUser) {
//           setUser(JSON.parse(currentUser));
//         } else {
//           router.replace('/login');
//         }
//       } catch (error) {
//         console.error('Error loading user:', error);
//         router.replace('/login');
//       }
//     };
//     loadUser();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('currentUser');
//       router.replace('/login');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   if (!user) {
//     return <View><Text>Loading...</Text></View>;
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome, {user.name}!</Text>
//       {user.image && (
//         <Image
//           source={{ uri: user.image }}
//           style={styles.profileImage}
//           accessibilityLabel="User profile picture"
//         />
//       )}
//       <Text style={styles.subtitle}>Email: {user.email}</Text>
//       <Button title="Go to Tasks" onPress={() => router.push('/tasks')} />
//       <Button title="Create Task" onPress={() => router.push('/task')} />
//       <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
//       <Button title="View Profile" onPress={() => router.push('/profile')} />
//       <Button title="Search Users" onPress={() => router.push('/search')} />
//       <Button title="Logout" onPress={handleLogout} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 20,
//   },
// });



// TODO: adding Google details

// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';

// export default function DashboardScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Dashboard</Text>
//       <ActivityChart />
//       <Button title="Create Task" onPress={() => router.push('/task')} />
//       <Button title="View Tasks" onPress={() => router.push('/tasks')} />
//       <Button title="Search Users" onPress={() => router.push('/search')} />
//       <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
//       <Button title="View Profile" onPress={() => router.push('/profile')} />
//       <Button title="View Leaderboard" onPress={() => router.push('/profile')} />
//       <Button title="Logout" onPress={() => router.push('/login')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
// });

// TODO: adding mockData

// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';

// export default function DashboardScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Dashboard</Text>
//       <ActivityChart />
//       <Button title="Create Task" onPress={() => router.push('/task')} />
//       <Button
//         title="View Tasks"
//         onPress={() => {
//           try {
//             router.push('/tasks');
//           } catch (error) {
//             console.error('Navigation error:', error);
//             alert('Failed to navigate to Tasks');
//           }
//         }}
//       />
//       <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
//       <Button title="View Profile" onPress={() => router.push('/profile')} />
//       <Button title="View Leaderboard" onPress={() => router.push('/profile')} />
//       <Button title="Logout" onPress={() => router.push('/login')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
// });