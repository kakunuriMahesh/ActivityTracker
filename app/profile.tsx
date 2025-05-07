import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfileAndLeaderboard = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          router.push('/login');
          return;
        }
        const user = JSON.parse(currentUser);
        setProfile(user);

        // Fetch leaderboard
        const leaderboardResponse = await axios.get('http://localhost:5000/api/users/leaderboard');
        setLeaderboard(leaderboardResponse.data);
      } catch (err) {
        setError('Failed to load profile or leaderboard');
      }
    };
    loadProfileAndLeaderboard();
  }, []);

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  const renderChallenge = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.challengeItem}
      onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
    >
      <Text style={styles.challengeTitle}>{item.title}</Text>
      <Text>Role: {item.creatorId === profile.userId ? 'Creator' : 'Participant'}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Distance: {item.taskId.distance} km</Text>
      <Text>Reward: ${item.reward}</Text>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <View style={styles.leaderboardDetails}>
        <Text style={styles.leaderboardName}>{item.name}</Text>
        <Text style={styles.leaderboardUserId}>ID: {item.userId}</Text>
        <Text style={styles.leaderboardPoints}>{item.totalPoints} points</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Name: {profile.name}</Text>
        <Text style={styles.label}>Email: {profile.email}</Text>
        <Text style={styles.label}>User ID: {profile.userId}</Text>
        <Text style={styles.label}>Streak: {profile.streak} days</Text>
      </View>
      <Text style={styles.sectionTitle}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        ListEmptyComponent={<Text>No leaderboard data</Text>}
        style={styles.leaderboardList}
      />
      <Text style={styles.sectionTitle}>Challenges</Text>
      <FlatList
        data={profile.challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No challenges</Text>}
      />
      <Button
        title="View All Challenges"
        onPress={() => alert('Challenges page coming soon!')}
      />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  profileInfo: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  challengeItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
  challengeTitle: { fontSize: 18, fontWeight: 'bold' },
  leaderboardList: { marginBottom: 20 },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 40,
    textAlign: 'center',
  },
  leaderboardDetails: { flex: 1 },
  leaderboardName: { fontSize: 16, fontWeight: 'bold' },
  leaderboardUserId: { fontSize: 14, color: '#555' },
  leaderboardPoints: { fontSize: 14, color: '#007AFF' },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

// FIXME: TODO: leaderboard TODO:

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import axios from 'axios';

// export default function ProfileScreen() {
//   const [profile, setProfile] = useState<any>(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           router.push('/login');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         console.log(user,"response/data");
//         // const response = await axios.get(`http://localhost:5000/api/users/${user.userId}/profile`);
//         // console.log(response,"response/data");
//         setProfile(user);
//       } catch (err) {
//         setError('Failed to load profile');
//       }
//     };
//     loadProfile();
//   }, []);

//   if (!profile) {
//     return <Text>Loading...</Text>;
//   }

//   const renderChallenge = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.challengeItem}
//       onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
//     >
//       <Text style={styles.challengeTitle}>{item.title}</Text>
//       <Text>Role: {item.creatorId === profile.userId ? 'Creator' : 'Participant'}</Text>
//       <Text>Status: {item.status}</Text>
//       <Text>Distance: {item.taskId.distance} km</Text>
//       <Text>Reward: ${item.reward}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile</Text>
//       {error && <Text style={styles.error}>{error}</Text>}
//       <View style={styles.profileInfo}>
//         <Text style={styles.label}>Name: {profile.name}</Text>
//         <Text style={styles.label}>Email: {profile.email}</Text>
//         <Text style={styles.label}>User ID: {profile.userId}</Text>
//         <Text style={styles.label}>Streak: {profile.streak} days</Text>
//       </View>
//       <Text style={styles.sectionTitle}>Challenges</Text>
//       <FlatList
//         data={profile.challenges}
//         renderItem={renderChallenge}
//         keyExtractor={(item) => item._id}
//         ListEmptyComponent={<Text>No challenges</Text>}
//       />
//       <Button
//         title="View All Challenges"
//         onPress={() => alert('Challenges page coming soon!')}
//       />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   profileInfo: { marginBottom: 20 },
//   label: { fontSize: 16, marginBottom: 10 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   challengeItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
//   challengeTitle: { fontSize: 18, fontWeight: 'bold' },
//   error: { color: 'red', marginBottom: 10 },
// });

// FIXME: below is working fix the profile with changes

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';
// import StreakBadge from '../components/StreakBadge';
// import Leaderboard from '../components/Leaderboard';
// import { User, SelfTask, Challenge, FinishedTask, Reward } from '../constants/schema';
// import Modal from 'react-native-modal';
// import { TextInput } from 'react-native-gesture-handler';

// export default function ProfileScreen() {
//   const [user, setUser] = useState<User | null>(null);
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [finishedTasks, setFinishedTasks] = useState<FinishedTask[]>([]);
//   const [rewards, setRewards] = useState<Reward[]>([]);
//   const [streak, setStreak] = useState<number>(0);
//   const [rank, setRank] = useState<string>('Beginner');
//   const [isModalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
//   const [rejectionNote, setRejectionNote] = useState<string>('');

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (currentUser) {
//           const parsedUser: User = JSON.parse(currentUser);
//           setUser(parsedUser);
//           await loadUserData(parsedUser.userId);
//         }
//       } catch (error) {
//         console.error('Error loading profile:', error);
//       }
//     };
//     loadProfile();
//   }, []);

//   const loadUserData = async (userId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       const storedRewards = await AsyncStorage.getItem('rewards');

//       if (storedTasks) {
//         const userTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//           (task: SelfTask) => task.userId === userId
//         );
//         setTasks(userTasks);
//       }
//       if (storedChallenges) {
//         const userChallenges: Challenge[] = JSON.parse(storedChallenges).filter(
//           (challenge: Challenge) => challenge.assigneeIds.includes(userId) && challenge.status === 'Pending'
//         );
//         setChallenges(userChallenges);
//       }
//       if (storedFinishedTasks) {
//         const userFinishedTasks: FinishedTask[] = JSON.parse(storedFinishedTasks).filter(
//           (ft: FinishedTask) => ft.userId === userId
//         );
//         setFinishedTasks(userFinishedTasks);
//         calculateStreak(userFinishedTasks);
//       }
//       if (storedRewards) {
//         const userRewards: Reward[] = JSON.parse(storedRewards).filter(
//           (reward: Reward) => reward.userId === userId
//         );
//         setRewards(userRewards);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const calculateStreak = (finishedTasks: FinishedTask[]) => {
//     if (finishedTasks.length === 0) {
//       setStreak(0);
//       setRank('Beginner');
//       return;
//     }

//     const sortedTasks = finishedTasks.sort(
//       (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
//     );

//     let currentStreak = 0;
//     let lastDate: Date | null = null;
//     for (const task of sortedTasks) {
//       const taskDate = new Date(task.completedAt);
//       taskDate.setHours(0, 0, 0, 0);
//       if (!lastDate) {
//         currentStreak = 1;
//         lastDate = taskDate;
//         continue;
//       }
//       const diffDays = (lastDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24);
//       if (diffDays === 1) {
//         currentStreak++;
//         lastDate = taskDate;
//       } else if (diffDays > 1) {
//         break;
//       }
//     }

//     setStreak(currentStreak);
//     if (currentStreak >= 30) {
//       setRank('Elite');
//     } else if (currentStreak >= 14) {
//       setRank('Pro');
//     } else if (currentStreak >= 7) {
//       setRank('Advanced');
//     } else {
//       setRank('Beginner');
//     }
//   };

//   const handleChallengeAction = async (challenge: Challenge, action: 'Accept' | 'Reject') => {
//     try {
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       const updatedChallenges = allChallenges.map((c) =>
//         c.challengeId === challenge.challengeId
//           ? {
//               ...c,
//               status: action === 'Accept' ? 'Accepted' : 'Rejected',
//               rejectionNote: action === 'Reject' ? rejectionNote : c.rejectionNote,
//             }
//           : c
//       ) as Challenge[];
//       await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
//       setChallenges(updatedChallenges.filter((c) => c.assigneeIds.includes(user?.userId || '') && c.status === 'Pending'));

//       if (action === 'Accept') {
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//         const task = allTasks.find((t) => t.taskId === challenge.taskId);
//         if (task) {
//           const newTask: SelfTask = { ...task, userId: user?.userId || '', taskId: `task-${Date.now()}` };
//           allTasks.push(newTask);
//           await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));
//           setTasks([...tasks, newTask]);
//         }
//       }
//       setModalVisible(false);
//       setRejectionNote('');
//     } catch (error) {
//       console.error('Error handling challenge:', error);
//     }
//   };

//   const totalDistance = finishedTasks.reduce((sum, task) => sum + task.distance, 0);
//   const totalTasks = tasks.length + finishedTasks.length;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile: {user?.name || 'Unknown'}</Text>
//       <Text style={styles.subtitle}>User ID: {user?.userId || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Email: {user?.email || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Total Tasks: {totalTasks}</Text>
//       <Text style={styles.subtitle}>Completed Tasks: {finishedTasks.length}</Text>
//       <Text style={styles.subtitle}>Total Distance: {totalDistance} km</Text>
//       <StreakBadge streak={streak} rank={rank} />
//       <ActivityChart />
//       <Leaderboard users={[{ email: user?.email || 'Unknown', totalDistance }]} />
//       <Text style={styles.subtitle}>Pending Challenges</Text>
//       <FlatList
//         data={challenges}
//         keyExtractor={(item) => item.challengeId}
//         renderItem={({ item }) => (
//           <View style={styles.challengeItem}>
//             <Text>Task: {item.taskId}</Text>
//             <Button
//               title="View"
//               onPress={() => {
//                 setSelectedChallenge(item);
//                 setModalVisible(true);
//               }}
//             />
//           </View>
//         )}
//         ListEmptyComponent={<Text>No pending challenges</Text>}
//       />
//       <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Challenge Details</Text>
//           {selectedChallenge && (
//             <>
//               <Text>Task ID: {selectedChallenge.taskId}</Text>
//               <Text>Status: {selectedChallenge.status}</Text>
//               <Button title="Accept" onPress={() => handleChallengeAction(selectedChallenge, 'Accept')} />
//               <Button title="Reject" onPress={() => setRejectionNote('')} />
//               {rejectionNote !== null && (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Rejection Note"
//                     value={rejectionNote}
//                     onChangeText={setRejectionNote}
//                   />
//                   <Button
//                     title="Submit Rejection"
//                     onPress={() => handleChallengeAction(selectedChallenge, 'Reject')}
//                   />
//                 </>
//               )}
//             </>
//           )}
//           <Button title="Close" onPress={() => setModalVisible(false)} />
//         </View>
//       </Modal>
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   challengeItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   modal: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     width: '100%',
//   },
// });


// TODO: fix the error line 

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';
// import StreakBadge from '../components/StreakBadge';
// import Leaderboard from '../components/Leaderboard';
// import { User, SelfTask, Challenge, FinishedTask, Reward } from '../constants/schema';
// import Modal from 'react-native-modal';
// import { TextInput } from 'react-native-gesture-handler';

// export default function ProfileScreen() {
//   const [user, setUser] = useState<User | null>(null);
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [finishedTasks, setFinishedTasks] = useState<FinishedTask[]>([]);
//   const [rewards, setRewards] = useState<Reward[]>([]);
//   const [streak, setStreak] = useState<number>(0);
//   const [rank, setRank] = useState<string>('Beginner');
//   const [isModalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
//   const [rejectionNote, setRejectionNote] = useState<string>('');

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (currentUser) {
//           const parsedUser: User = JSON.parse(currentUser);
//           setUser(parsedUser);
//           await loadUserData(parsedUser.userId);
//         }
//       } catch (error) {
//         console.error('Error loading profile:', error);
//       }
//     };
//     loadProfile();
//   }, []);

//   const loadUserData = async (userId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       const storedRewards = await AsyncStorage.getItem('rewards');

//       if (storedTasks) {
//         const userTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//           (task: SelfTask) => task.userId === userId
//         );
//         setTasks(userTasks);
//       }
//       if (storedChallenges) {
//         const userChallenges: Challenge[] = JSON.parse(storedChallenges).filter(
//           (challenge: Challenge) => challenge.assigneeIds.includes(userId) && challenge.status === 'Pending'
//         );
//         setChallenges(userChallenges);
//       }
//       if (storedFinishedTasks) {
//         const userFinishedTasks: FinishedTask[] = JSON.parse(storedFinishedTasks).filter(
//           (ft: FinishedTask) => ft.userId === userId
//         );
//         setFinishedTasks(userFinishedTasks);
//         calculateStreak(userFinishedTasks);
//       }
//       if (storedRewards) {
//         const userRewards: Reward[] = JSON.parse(storedRewards).filter(
//           (reward: Reward) => reward.userId === userId
//         );
//         setRewards(userRewards);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const calculateStreak = (finishedTasks: FinishedTask[]) => {
//     if (finishedTasks.length === 0) {
//       setStreak(0);
//       setRank('Beginner');
//       return;
//     }

//     const sortedTasks = finishedTasks.sort(
//       (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
//     );

//     let currentStreak = 0;
//     let lastDate: Date | null = null;
//     for (const task of sortedTasks) {
//       const taskDate = new Date(task.completedAt);
//       taskDate.setHours(0, 0, 0, 0);
//       if (!lastDate) {
//         currentStreak = 1;
//         lastDate = taskDate;
//         continue;
//       }
//       const diffDays = (lastDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24);
//       if (diffDays === 1) {
//         currentStreak++;
//         lastDate = taskDate;
//       } else if (diffDays > 1) {
//         break;
//       }
//     }

//     setStreak(currentStreak);
//     if (currentStreak >= 30) {
//       setRank('Elite');
//     } else if (currentStreak >= 14) {
//       setRank('Pro');
//     } else if (currentStreak >= 7) {
//       setRank('Advanced');
//     } else {
//       setRank('Beginner');
//     }
//   };

//   const handleChallengeAction = async (challenge: Challenge, action: 'Accept' | 'Reject') => {
//     try {
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       const updatedChallenges = allChallenges.map((c) =>
//         c.challengeId === challenge.challengeId
//           ? {
//               ...c,
//               status: action === 'Accept' ? 'Accepted' : 'Rejected',
//               rejectionNote: action === 'Reject' ? rejectionNote : c.rejectionNote,
//             }
//           : c
//       );
//       await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
//       setChallenges(updatedChallenges.filter((c) => c.assigneeIds.includes(user?.userId || '') && c.status === 'Pending'));

//       if (action === 'Accept') {
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//         const task = allTasks.find((t) => t.taskId === challenge.taskId);
//         if (task) {
//           const newTask: SelfTask = { ...task, userId: user?.userId || '', taskId: `task-${Date.now()}` };
//           allTasks.push(newTask);
//           await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));
//           setTasks([...tasks, newTask]);
//         }
//       }
//       setModalVisible(false);
//       setRejectionNote('');
//     } catch (error) {
//       console.error('Error handling challenge:', error);
//     }
//   };

//   const totalDistance = finishedTasks.reduce((sum, task) => sum + task.distance, 0);
//   const totalTasks = tasks.length + finishedTasks.length;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile: {user?.name || 'Unknown'}</Text>
//       <Text style={styles.subtitle}>User ID: {user?.userId || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Email: {user?.email || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Total Tasks: {totalTasks}</Text>
//       <Text style={styles.subtitle}>Completed Tasks: {finishedTasks.length}</Text>
//       <Text style={styles.subtitle}>Total Distance: {totalDistance} km</Text>
//       <StreakBadge streak={streak} rank={rank} />
//       <ActivityChart />
//       <Leaderboard users={[{ email: user?.email || 'Unknown', totalDistance }]} />
//       <Text style={styles.subtitle}>Pending Challenges</Text>
//       <FlatList
//         data={challenges}
//         keyExtractor={(item) => item.challengeId}
//         renderItem={({ item }) => (
//           <View style={styles.challengeItem}>
//             <Text>Task: {item.taskId}</Text>
//             <Button
//               title="View"
//               onPress={() => {
//                 setSelectedChallenge(item);
//                 setModalVisible(true);
//               }}
//             />
//           </View>
//         )}
//         ListEmptyComponent={<Text>No pending challenges</Text>}
//       />
//       <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Challenge Details</Text>
//           {selectedChallenge && (
//             <>
//               <Text>Task ID: {selectedChallenge.taskId}</Text>
//               <Text>Status: {selectedChallenge.status}</Text>
//               <Button title="Accept" onPress={() => handleChallengeAction(selectedChallenge, 'Accept')} />
//               <Button title="Reject" onPress={() => setRejectionNote('')} />
//               {rejectionNote !== null && (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Rejection Note"
//                     value={rejectionNote}
//                     onChangeText={setRejectionNote}
//                   />
//                   <Button
//                     title="Submit Rejection"
//                     onPress={() => handleChallengeAction(selectedChallenge, 'Reject')}
//                   />
//                 </>
//               )}
//             </>
//           )}
//           <Button title="Close" onPress={() => setModalVisible(false)} />
//         </View>
//       </Modal>
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   challengeItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   modal: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     width: '100%',
//   },
// });


// TODO: adding incorrect changes

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';
// import StreakBadge from '../components/StreakBadge';
// import Leaderboard from '../components/Leaderboard';
// import { User, SelfTask, Challenge, FinishedTask, Reward } from '../constants/schema';
// import Modal from 'react-native-modal';
// import { TextInput } from 'react-native-gesture-handler';

// export default function ProfileScreen() {
//   const [user, setUser] = useState<User | null>(null);
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [finishedTasks, setFinishedTasks] = useState<FinishedTask[]>([]);
//   const [rewards, setRewards] = useState<Reward[]>([]);
//   const [streak, setStreak] = useState<number>(0);
//   const [rank, setRank] = useState<string>('Beginner');
//   const [isModalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
//   const [rejectionNote, setRejectionNote] = useState<string>('');

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (currentUser) {
//           const parsedUser: User = JSON.parse(currentUser);
//           setUser(parsedUser);
//           await loadUserData(parsedUser.userId);
//         }
//       } catch (error) {
//         console.error('Error loading profile:', error);
//       }
//     };
//     loadProfile();
//   }, []);

//   const loadUserData = async (userId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       const storedRewards = await AsyncStorage.getItem('rewards');

//       if (storedTasks) {
//         const userTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//           (task: SelfTask) => task.userId === userId
//         );
//         setTasks(userTasks);
//       }
//       if (storedChallenges) {
//         const userChallenges: Challenge[] = JSON.parse(storedChallenges).filter(
//           (challenge: Challenge) => challenge.assigneeId === userId && challenge.status === 'Pending'
//         );
//         setChallenges(userChallenges);
//       }
//       if (storedFinishedTasks) {
//         const userFinishedTasks: FinishedTask[] = JSON.parse(storedFinishedTasks).filter(
//           (ft: FinishedTask) => ft.userId === userId
//         );
//         setFinishedTasks(userFinishedTasks);
//         calculateStreak(userFinishedTasks);
//       }
//       if (storedRewards) {
//         const userRewards: Reward[] = JSON.parse(storedRewards).filter(
//           (reward: Reward) => reward.userId === userId
//         );
//         setRewards(userRewards);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const calculateStreak = (finishedTasks: FinishedTask[]) => {
//     if (finishedTasks.length === 0) {
//       setStreak(0);
//       setRank('Beginner');
//       return;
//     }

//     const sortedTasks = finishedTasks.sort(
//       (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
//     );

//     let currentStreak = 0;
//     let lastDate: Date | null = null;
//     for (const task of sortedTasks) {
//       const taskDate = new Date(task.completedAt);
//       taskDate.setHours(0, 0, 0, 0);
//       if (!lastDate) {
//         currentStreak = 1;
//         lastDate = taskDate;
//         continue;
//       }
//       const diffDays = (lastDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24);
//       if (diffDays === 1) {
//         currentStreak++;
//         lastDate = taskDate;
//       } else if (diffDays > 1) {
//         break;
//       }
//     }

//     setStreak(currentStreak);
//     if (currentStreak >= 30) {
//       setRank('Elite');
//     } else if (currentStreak >= 14) {
//       setRank('Pro');
//     } else if (currentStreak >= 7) {
//       setRank('Advanced');
//     } else {
//       setRank('Beginner');
//     }
//   };

//   const handleChallengeAction = async (challenge: Challenge, action: 'Accept' | 'Reject') => {
//     try {
//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       const updatedChallenges = allChallenges.map((c) =>
//         c.challengeId === challenge.challengeId
//           ? {
//               ...c,
//               status: action === 'Accept' ? 'Accepted' : 'Rejected',
//               rejectionNote: action === 'Reject' ? rejectionNote : c.rejectionNote,
//             }
//           : c
//       );
//       await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
//       // Add type assertion to fix the error
//       setChallenges(updatedChallenges.filter((c) => 
//         c.assigneeId === user?.userId && c.status === 'Pending') as Challenge[]);

//       if (action === 'Accept') {
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//         const task = allTasks.find((t) => t.taskId === challenge.taskId);
//         if (task) {
//           const newTask: SelfTask = { ...task, userId: user?.userId || '', taskId: `task-${Date.now()}` };
//           allTasks.push(newTask);
//           await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));
//           setTasks([...tasks, newTask]);
//         }
//       }
//       setModalVisible(false);
//       setRejectionNote('');
//     } catch (error) {
//       console.error('Error handling challenge:', error);
//     }
//   };

//   const totalDistance = finishedTasks.reduce((sum, task) => sum + task.distance, 0);
//   const totalTasks = tasks.length + finishedTasks.length;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile: {user?.name || 'Unknown'}</Text>
//       <Text style={styles.subtitle}>User ID: {user?.userId || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Email: {user?.email || 'N/A'}</Text>
//       <Text style={styles.subtitle}>Total Tasks: {totalTasks}</Text>
//       <Text style={styles.subtitle}>Completed Tasks: {finishedTasks.length}</Text>
//       <Text style={styles.subtitle}>Total Distance: {totalDistance} km</Text>
//       <StreakBadge streak={streak} rank={rank} />
//       <ActivityChart />
//       <Leaderboard users={[{ email: user?.email || 'Unknown', totalDistance }]} />
//       <Text style={styles.subtitle}>Pending Challenges</Text>
//       <FlatList
//         data={challenges}
//         keyExtractor={(item) => item.challengeId}
//         renderItem={({ item }) => (
//           <View style={styles.challengeItem}>
//             <Text>Task: {item.taskId}</Text>
//             <Button
//               title="View"
//               onPress={() => {
//                 setSelectedChallenge(item);
//                 setModalVisible(true);
//               }}
//             />
//           </View>
//         )}
//         ListEmptyComponent={<Text>No pending challenges</Text>}
//       />
//       <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Challenge Details</Text>
//           {selectedChallenge && (
//             <>
//               <Text>Task ID: {selectedChallenge.taskId}</Text>
//               <Text>Status: {selectedChallenge.status}</Text>
//               <Button title="Accept" onPress={() => handleChallengeAction(selectedChallenge, 'Accept')} />
//               <Button title="Reject" onPress={() => setRejectionNote('')} />
//               {rejectionNote !== null && (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Rejection Note"
//                     value={rejectionNote}
//                     onChangeText={setRejectionNote}
//                   />
//                   <Button
//                     title="Submit Rejection"
//                     onPress={() => handleChallengeAction(selectedChallenge, 'Reject')}
//                   />
//                 </>
//               )}
//             </>
//           )}
//           <Button title="Close" onPress={() => setModalVisible(false)} />
//         </View>
//       </Modal>
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   challengeItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   modal: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     width: '100%',
//   },
// });

// TODO: Adding mockData


// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import ActivityChart from '../components/ActivityChart';
// import StreakBadge from '../components/StreakBadge';
// import Leaderboard from '../components/Leaderboard';

// interface Task {
//   id: string;
//   activity: string;
//   distance: number;
//   createdAt: string;
//   user: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   completed: boolean;
// }

// export default function ProfileScreen() {
//   const [user, setUser] = useState<string | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [streak, setStreak] = useState<number>(0);
//   const [rank, setRank] = useState<string>('Beginner');

//   useEffect(() => {
//     const loadProfile = async () => {
//       const currentUser = await AsyncStorage.getItem('currentUser');
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (currentUser) {
//         setUser(currentUser);
//       }
//       if (storedTasks) {
//         const userTasks: Task[] = JSON.parse(storedTasks).filter(
//           (task: Task) => task.user === currentUser
//         );
//         setTasks(userTasks);
//         calculateStreak(userTasks);
//       }
//     };
//     loadProfile();
//   }, []);

//   const calculateStreak = (userTasks: Task[]) => {
//     const completedTasks = userTasks.filter((task) => task.completed);
//     if (completedTasks.length === 0) {
//       setStreak(0);
//       setRank('Beginner');
//       return;
//     }

//     // Sort tasks by date
//     const sortedTasks = completedTasks.sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     let currentStreak = 0;
//     let lastDate: Date | null = null;
//     for (const task of sortedTasks) {
//       const taskDate = new Date(task.createdAt);
//       taskDate.setHours(0, 0, 0, 0); // Normalize to start of day
//       if (!lastDate) {
//         currentStreak = 1;
//         lastDate = taskDate;
//         continue;
//       }
//       const diffDays = (lastDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24);
//       if (diffDays === 1) {
//         currentStreak++;
//         lastDate = taskDate;
//       } else if (diffDays > 1) {
//         break;
//       }
//     }

//     setStreak(currentStreak);
//     if (currentStreak >= 30) {
//       setRank('Elite');
//     } else if (currentStreak >= 14) {
//       setRank('Pro');
//     } else if (currentStreak >= 7) {
//       setRank('Advanced');
//     } else {
//       setRank('Beginner');
//     }
//   };

//   const totalDistance = tasks.reduce((sum, task) => sum + task.distance, 0);
//   const totalTasks = tasks.length;
//   const completedTasks = tasks.filter((task) => task.completed).length;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile: {user || 'Unknown'}</Text>
//       <Text style={styles.subtitle}>Total Tasks: {totalTasks}</Text>
//       <Text style={styles.subtitle}>Completed Tasks: {completedTasks}</Text>
//       <Text style={styles.subtitle}>Total Distance: {totalDistance} km</Text>
//       <StreakBadge streak={streak} rank={rank} />
//       <ActivityChart />
//       <Leaderboard users={[{ email: user || 'Unknown', totalDistance }]} />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
// });