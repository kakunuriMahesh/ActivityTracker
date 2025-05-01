import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '../constants/schema';
import { initializeMockData } from '../constants/mockData';

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Debug AsyncStorage
        console.log('Users:', await AsyncStorage.getItem('users'));
        console.log('Current User:', await AsyncStorage.getItem('currentUser'));

        // Clear AsyncStorage (run once, then comment out)
        // await AsyncStorage.clear();
        // console.log('AsyncStorage cleared');

        // Initialize mock data if not present
        const users = await AsyncStorage.getItem('users');
        if (!users) {
          await initializeMockData();
          console.log('Mock data initialized');
        }

        const currentUser = await AsyncStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const parsedUser = JSON.parse(currentUser);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing currentUser:', parseError);
            setError('Invalid user data. Please log in again.');
            await AsyncStorage.removeItem('currentUser');
            router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Failed to load user data');
        router.replace('/login');
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Go to Login" onPress={() => router.replace('/login')} />
      </View>
    );
  }

  if (!user) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      {user.image && (
        <Image
          source={{ uri: user.image }}
          style={styles.profileImage}
          accessibilityLabel="User profile picture"
        />
      )}
      <Text style={styles.subtitle}>Email: {user.email}</Text>
      <Button title="Go to Tasks" onPress={() => router.push('/tasks')} />
      <Button title="Create Task" onPress={() => router.push('/task')} />
      <Button title="Create Challenge" onPress={() => router.push('/challenge')} />
      <Button title="View Profile" onPress={() => router.push('/profile')} />
      <Button title="Search Users" onPress={() => router.push('/search')} />
      <Button title="Logout" onPress={handleLogout} />
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
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
});

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