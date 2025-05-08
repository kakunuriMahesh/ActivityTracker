import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
  const [userId, setUserId] = useState('');
  const [responseReason, setResponseReason] = useState('');
  const [respondingChallengeId, setRespondingChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          return;
        }
        const user = JSON.parse(currentUser);
        setUserId(user.userId);
        const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/tasks`);
        setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
        const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/challenges`);
        setChallenges(challengesResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      }
    };
    loadData();
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    try {
      await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
      const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
      setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  const handleStopTask = async (taskId: string) => {
    try {
      await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
      const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
      setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
    } catch (error) {
      console.error('Error stopping task:', error);
      alert('Error stopping task');
    }
  };

  const handleChallengeResponse = async (challengeId: string, response: 'agree' | 'reject' | 'skip') => {
    try {
      const payload = {
        userId,
        response,
        responseReason: response === 'reject' || response === 'skip' ? responseReason : undefined,
      };
      await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, payload);
      alert(`Challenge ${response}ed successfully`);
      const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/challenges`);
      setChallenges(challengesResponse.data);
      setResponseReason('');
      setRespondingChallengeId(null);
    } catch (error) {
      console.error('Error responding to challenge:', error);
      alert('Error responding to challenge: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderChallenge = ({ item }: { item: any }) => {
    const isAssignee = item.assigneeIds.includes(userId);
    const isCreator = item.creatorId === userId;
    const participantStatus = item.progress.find((p: any) => p.userId === userId)?.status || 'pending';

    return (
      <TouchableOpacity
        style={styles.challengeItem}
        onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
      >
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text>Status: {participantStatus}</Text>
        <Text>Distance: {item.taskId.distance} km</Text>
        <Text>Duration: {item.duration}</Text>
        <Text>Reward: ${item.reward}</Text>
        {isAssignee && !isCreator && participantStatus === 'pending' && (
          <View style={styles.responseContainer}>
            <Button title="Agree" onPress={() => handleChallengeResponse(item._id, 'agree')} />
            <Button title="Reject" onPress={() => setRespondingChallengeId(item._id)} />
            {/* <Button title="Skip" onPress={() => setRespondingChallengeId(item._id)} /> */}
            {respondingChallengeId === item._id && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Reason for rejection/skip"
                  value={responseReason}
                  onChangeText={setResponseReason}
                />
                <Button
                  title="Confirm Reject"
                  onPress={() => handleChallengeResponse(item._id, 'reject')}
                />
                {/* <Button
                  title="Confirm Skip"
                  onPress={() => handleChallengeResponse(item._id, 'skip')}
                /> */}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskItem}>
      <Text>{item.activity} - {item.distance} km ({item.duration})</Text>
      <Button title="Complete" onPress={() => handleToggleComplete(item._id)} />
      <Button title="Stop" onPress={() => handleStopTask(item._id)} />
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Back to Dashboard" onPress={() => router.push('/')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
          onPress={() => setActiveTab('Tasks')}
        >
          <Text style={styles.tabText}>Personal Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
          onPress={() => setActiveTab('Challenges')}
        >
          <Text style={styles.tabText}>Challenges</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'Tasks' && (
        <>
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text>No active tasks</Text>}
          />
          <Button title="Create New Task" onPress={() => router.push('/task')} />
        </>
      )}
      {activeTab === 'Challenges' && (
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>No challenges</Text>}
        />
      )}
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0', borderBottomWidth: 2, borderBottomColor: '#ccc' },
  activeTab: { backgroundColor: '#e0f7fa', borderBottomColor: '#00C851' },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  challengeItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
  challengeTitle: { fontSize: 18, fontWeight: 'bold' },
  taskItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  responseContainer: { marginTop: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

// FIXME: below is working but fixing challange

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import axios from 'axios';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState([]);
//   const [challenges, setChallenges] = useState([]);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
//   const [userId, setUserId] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [respondingChallengeId, setRespondingChallengeId] = useState<string | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/tasks`);
//         setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//         const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/challenges`);
//         setChallenges(challengesResponse.data);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         setError('Failed to load data');
//       }
//     };
//     loadData();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   const handleChallengeResponse = async (challengeId: string, response: 'agree' | 'reject' | 'skip') => {
//     try {
//       const payload = {
//         userId,
//         response,
//         responseReason: response === 'reject' || response === 'skip' ? responseReason : undefined,
//       };
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, payload);
//       alert(`Challenge ${response}ed successfully`);
//       const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/challenges`);
//       setChallenges(challengesResponse.data);
//       setResponseReason('');
//       setRespondingChallengeId(null);
//     } catch (error) {
//       console.error('Error responding to challenge:', error);
//       alert('Error responding to challenge: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   const renderChallenge = ({ item }: { item: any }) => {
//     const isAssignee = item.assigneeIds.includes(userId);
//     const isCreator = item.creatorId === userId;
//     const participantStatus = item.progress.find((p: any) => p.userId === userId)?.status || 'pending';

//     return (
//       <TouchableOpacity
//         style={styles.challengeItem}
//         onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
//       >
//         <Text style={styles.challengeTitle}>{item.title}</Text>
//         <Text>Status: {participantStatus}</Text>
//         <Text>Distance: {item.taskId.distance} km</Text>
//         <Text>Duration: {item.duration}</Text>
//         <Text>Reward: ${item.reward}</Text>
//         {isAssignee && !isCreator && participantStatus === 'pending' && (
//           <View style={styles.responseContainer}>
//             <Button title="Agree" onPress={() => handleChallengeResponse(item._id, 'agree')} />
//             <Button title="Reject" onPress={() => setRespondingChallengeId(item._id)} />
//             <Button title="Skip" onPress={() => setRespondingChallengeId(item._id)} />
//             {respondingChallengeId === item._id && (
//               <View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Reason for rejection/skip"
//                   value={responseReason}
//                   onChangeText={setResponseReason}
//                 />
//                 <Button
//                   title="Confirm Reject"
//                   onPress={() => handleChallengeResponse(item._id, 'reject')}
//                 />
//                 <Button
//                   title="Confirm Skip"
//                   onPress={() => handleChallengeResponse(item._id, 'skip')}
//                 />
//               </View>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const renderTask = ({ item }: { item: any }) => (
//     <View style={styles.taskItem}>
//       <Text>{item.activity} - {item.distance} km ({item.duration})</Text>
//       <Button title="Complete" onPress={() => handleToggleComplete(item._id)} />
//       <Button title="Stop" onPress={() => handleStopTask(item._id)} />
//     </View>
//   );

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
//           onPress={() => setActiveTab('Tasks')}
//         >
//           <Text style={styles.tabText}>Personal Tasks</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
//           onPress={() => setActiveTab('Challenges')}
//         >
//           <Text style={styles.tabText}>Challenges</Text>
//         </TouchableOpacity>
//       </View>
//       {activeTab === 'Tasks' && (
//         <>
//           <FlatList
//             data={tasks}
//             renderItem={renderTask}
//             keyExtractor={(item) => item._id}
//             ListEmptyComponent={<Text>No active tasks</Text>}
//           />
//           <Button title="Create New Task" onPress={() => router.push('/task')} />
//         </>
//       )}
//       {activeTab === 'Challenges' && (
//         <FlatList
//           data={challenges}
//           renderItem={renderChallenge}
//           keyExtractor={(item) => item._id}
//           ListEmptyComponent={<Text>No challenges</Text>}
//         />
//       )}
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
//   tabContainer: { flexDirection: 'row', marginBottom: 20 },
//   tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0', borderBottomWidth: 2, borderBottomColor: '#ccc' },
//   activeTab: { backgroundColor: '#e0f7fa', borderBottomColor: '#00C851' },
//   tabText: { fontSize: 16, fontWeight: 'bold' },
//   challengeItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
//   challengeTitle: { fontSize: 18, fontWeight: 'bold' },
//   taskItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   responseContainer: { marginTop: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
// });


// TODO: fix challange refresh ans response handling

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import axios from 'axios';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState([]);
//   const [challenges, setChallenges] = useState([]);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
//   const [userId, setUserId] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [respondingChallengeId, setRespondingChallengeId] = useState<string | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);

//         // Fetch tasks
//         const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/tasks`);
//         setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));

//         // Fetch challenges
//         const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/challenges`);
//         setChallenges(challengesResponse.data);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         setError('Failed to load data');
//       }
//     };
//     loadData();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   const handleChallengeResponse = async (challengeId: string, response: 'agree' | 'reject' | 'skip') => {
//     try {
//       const payload = {
//         userId,
//         response,
//         responseReason: response === 'reject' || response === 'skip' ? responseReason : undefined,
//       };
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, payload);
//       alert(`Challenge ${response}ed successfully`);
//       // Refresh challenges
//       const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/challenges`);
//       setChallenges(challengesResponse.data);
//       setResponseReason('');
//       setRespondingChallengeId(null);
//     } catch (error) {
//       console.error('Error responding to challenge:', error);
//       alert('Error responding to challenge: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   const renderChallenge = ({ item }: { item: any }) => {
//     const isAssignee = item.assigneeIds.includes(userId);
//     const isCreator = item.creatorId === userId;
//     const participantStatus = item.progress.find((p: any) => p.userId === userId)?.status || 'pending';

//     return (
//       <TouchableOpacity
//         style={styles.challengeItem}
//         onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
//       >
//         <Text style={styles.challengeTitle}>{item.title}</Text>
//         <Text>Status: {participantStatus}</Text>
//         <Text>Distance: {item.taskId.distance} km</Text>
//         <Text>Duration: {item.duration}</Text>
//         <Text>Reward: ${item.reward}</Text>
//         {isAssignee && !isCreator && participantStatus === 'pending' && (
//           <View style={styles.responseContainer}>
//             <Button title="Agree" onPress={() => handleChallengeResponse(item._id, 'agree')} />
//             <Button title="Reject" onPress={() => setRespondingChallengeId(item._id)} />
//             <Button title="Skip" onPress={() => setRespondingChallengeId(item._id)} />
//             {respondingChallengeId === item._id && (
//               <View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Reason for rejection/skip"
//                   value={responseReason}
//                   onChangeText={setResponseReason}
//                 />
//                 <Button
//                   title="Confirm Reject"
//                   onPress={() => handleChallengeResponse(item._id, 'reject')}
//                 />
//                 <Button
//                   title="Confirm Skip"
//                   onPress={() => handleChallengeResponse(item._id, 'skip')}
//                 />
//               </View>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const renderTask = ({ item }: { item: any }) => (
//     <View style={styles.taskItem}>
//       <Text>{item.activity} - {item.distance} km ({item.duration})</Text>
//       <Button title="Complete" onPress={() => handleToggleComplete(item._id)} />
//       <Button title="Stop" onPress={() => handleStopTask(item._id)} />
//     </View>
//   );

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
//           onPress={() => setActiveTab('Tasks')}
//         >
//           <Text style={styles.tabText}>Personal Tasks</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
//           onPress={() => setActiveTab('Challenges')}
//         >
//           <Text style={styles.tabText}>Challenges</Text>
//         </TouchableOpacity>
//       </View>
//       {activeTab === 'Tasks' && (
//         <>
//           <FlatList
//             data={tasks}
//             renderItem={renderTask}
//             keyExtractor={(item) => item._id}
//             ListEmptyComponent={<Text>No active tasks</Text>}
//           />
//           <Button title="Create New Task" onPress={() => router.push('/task')} />
//         </>
//       )}
//       {activeTab === 'Challenges' && (
//         <FlatList
//           data={challenges}
//           renderItem={renderChallenge}
//           keyExtractor={(item) => item._id}
//           ListEmptyComponent={<Text>No challenges</Text>}
//         />
//       )}
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderBottomWidth: 2,
//     borderBottomColor: '#ccc',
//   },
//   activeTab: {
//     backgroundColor: '#e0f7fa',
//     borderBottomColor: '#00C851',
//   },
//   tabText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   challengeItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     marginBottom: 10,
//   },
//   challengeTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   taskItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   responseContainer: {
//     marginTop: 10,
//   },
//   input: {
//     borderWidth: 1,
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
// });

// TODO: working but adding skip and reject buttons

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import axios from 'axios';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState([]);
//   const [challenges, setChallenges] = useState([]);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
//   const [userId, setUserId] = useState('');

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);

//         // Fetch tasks
//         const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/tasks`);
//         setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));

//         // Fetch challenges
//         const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${user.userId}/challenges`);
//         setChallenges(challengesResponse.data);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         setError('Failed to load data');
//       }
//     };
//     loadData();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/tasks/${taskId}`, { completed: true });
//       const tasksResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/tasks`);
//       setTasks(tasksResponse.data.filter((task: any) => !task.completed && new Date(task.endDate) >= new Date()));
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   const handleChallengeResponse = async (challengeId: string, response: 'agree' | 'reject' | 'skip', responseReason?: string) => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response,
//         responseReason,
//       });
//       alert(`Challenge ${response}ed successfully`);
//       const challengesResponse = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/${userId}/challenges`);
//       setChallenges(challengesResponse.data);
//     } catch (error) {
//       console.error('Error responding to challenge:', error);
//       alert('Error responding to challenge');
//     }
//   };

//   const renderChallenge = ({ item }: { item: any }) => {
//     const isAssignee = item.assigneeIds.includes(userId);
//     const isCreator = item.creatorId === userId;

//     return (
//       <TouchableOpacity
//         style={styles.challengeItem}
//         onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item._id } })}
//       >
//         <Text style={styles.challengeTitle}>{item.title}</Text>
//         <Text>Status: {item.status}</Text>
//         <Text>Distance: {item.taskId.distance} km</Text>
//         <Text>Duration: {item.duration}</Text>
//         <Text>Reward: ${item.reward}</Text>
//         {isAssignee && !isCreator && item.status === 'active' && (
//           <View style={styles.responseContainer}>
//             <Button title="Agree" onPress={() => handleChallengeResponse(item._id, 'agree')} />
//             <Button title="Reject" onPress={() => handleChallengeResponse(item._id, 'reject', 'Not interested')} />
//             <Button title="Skip" onPress={() => handleChallengeResponse(item._id, 'skip', 'Too busy')} />
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const renderTask = ({ item }: { item: any }) => (
//     <View style={styles.taskItem}>
//       <Text>{item.activity} - {item.distance} km ({item.duration})</Text>
//       <Button title="Complete" onPress={() => handleToggleComplete(item._id)} />
//       <Button title="Stop" onPress={() => handleStopTask(item._id)} />
//     </View>
//   );

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
//           onPress={() => setActiveTab('Tasks')}
//         >
//           <Text style={styles.tabText}>Personal Tasks</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
//           onPress={() => setActiveTab('Challenges')}
//         >
//           <Text style={styles.tabText}>Challenges</Text>
//         </TouchableOpacity>
//       </View>
//       {activeTab === 'Tasks' && (
//         <>
//           <FlatList
//             data={tasks}
//             renderItem={renderTask}
//             keyExtractor={(item) => item._id}
//             ListEmptyComponent={<Text>No active tasks</Text>}
//           />
//           <Button title="Create New Task" onPress={() => router.push('/task')} />
//         </>
//       )}
//       {activeTab === 'Challenges' && (
//         <FlatList
//           data={challenges}
//           renderItem={renderChallenge}
//           keyExtractor={(item) => item._id}
//           ListEmptyComponent={<Text>No challenges</Text>}
//         />
//       )}
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderBottomWidth: 2,
//     borderBottomColor: '#ccc',
//   },
//   activeTab: {
//     backgroundColor: '#e0f7fa',
//     borderBottomColor: '#00C851',
//   },
//   tabText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   challengeItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     marginBottom: 10,
//   },
//   challengeTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   taskItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   responseContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
// });


// TODO: changing to get the data for the tabs


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ProgressBarAndroid,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';
// import { SelfTask, Challenge, ChallengeProgress, FinishedTask, GraphData, User } from '../constants/schema';
// import uuid from 'react-native-uuid';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         const storedChallenges = await AsyncStorage.getItem('challenges');
//         const storedChallengeProgress = await AsyncStorage.getItem('challengeProgress');
//         const storedUsers = await AsyncStorage.getItem('users');

//         const now = new Date();
//         if (storedTasks) {
//           const allTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//             (task: SelfTask) =>
//               task.userId === user.userId &&
//               !task.stop &&
//               new Date(task.endDate) >= now
//           );
//           setTasks(allTasks);
//         }
//         if (storedChallenges) {
//           const userChallenges: Challenge[] = JSON.parse(storedChallenges).filter(
//             (c: Challenge) =>
//               (c.creatorId === user.userId || c.assigneeIds.includes(user.userId)) &&
//               c.status === 'Active'
//           );
//           setChallenges(userChallenges);
//         }
//         if (storedChallengeProgress) {
//           setChallengeProgress(JSON.parse(storedChallengeProgress));
//         }
//         if (storedUsers) {
//           setUsers(JSON.parse(storedUsers));
//         }
//       } catch (error) {
//         console.error('Error loading data:', error);
//         setError('Failed to load data');
//       }
//     };
//     loadData();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       const task = allTasks.find((t) => t.taskId === taskId);
//       if (!task) return;

//       allTasks = allTasks.map((t) =>
//         t.taskId === taskId ? { ...t, completed: true, stop: true } : t
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       let finishedTasks: FinishedTask[] = storedFinishedTasks ? JSON.parse(storedFinishedTasks) : [];
//       finishedTasks.push({
//         finishedTaskId: uuid.v4().toString(),
//         taskId,
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         completedAt: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));

//       const storedGraphData = await AsyncStorage.getItem('graphData');
//       let graphData: GraphData[] = storedGraphData ? JSON.parse(storedGraphData) : [];
//       graphData.push({
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         date: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('graphData', JSON.stringify(graphData));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       allTasks = allTasks.map((task) =>
//         task.taskId === taskId ? { ...task, stop: true } : task
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   const handleChallengeProgress = async (challengeId: string, distance: number) => {
//     try {
//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (!currentUser) {
//         alert('No user logged in');
//         return;
//       }
//       const user = JSON.parse(currentUser);
//       const storedProgress = await AsyncStorage.getItem('challengeProgress');
//       let allProgress: ChallengeProgress[] = storedProgress ? JSON.parse(storedProgress) : [];

//       console.log('Updating progress for challenge:', challengeId, 'User:', user.userId, 'Distance:', distance);

//       const existingProgress = allProgress.find(
//         (p) => p.challengeId === challengeId && p.userId === user.userId
//       );
//       if (existingProgress) {
//         allProgress = allProgress.map((p) =>
//           p.progressId === existingProgress.progressId
//             ? { ...p, distance: p.distance + distance, lastUpdated: new Date().toISOString() }
//             : p
//         );
//       } else {
//         const newProgress: ChallengeProgress = {
//           progressId: uuid.v4().toString(),
//           challengeId,
//           userId: user.userId,
//           distance,
//           lastUpdated: new Date().toISOString(),
//         };
//         allProgress.push(newProgress);
//       }
//       await AsyncStorage.setItem('challengeProgress', JSON.stringify(allProgress));
//       setChallengeProgress(allProgress);
//       console.log('Progress updated:', allProgress);
//     } catch (error) {
//       console.error('Error updating challenge progress:', error);
//       alert('Error updating challenge progress');
//     }
//   };

//   const renderChallengeDetails = (challenge: Challenge) => {
//     const task = tasks.find((t) => t.taskId === challenge.taskId);
//     const progress = challengeProgress
//       .filter((p) => p.challengeId === challenge.challengeId)
//       .map((p) => ({
//         ...p,
//         user: users.find((u) => u.userId === p.userId),
//       }))
//       .sort((a, b) => b.distance - a.distance);

//     return (
//       <View style={styles.challengeDetails}>
//         <Text style={styles.challengeTitle}>
//           {challenge.title} - {task?.distance} km ({challenge.duration}) - ${challenge.reward} Gift Card
//         </Text>
//         <Text style={styles.sectionTitle}>Leaderboard</Text>
//         <FlatList
//           data={progress}
//           keyExtractor={(item) => item.progressId}
//           renderItem={({ item, index }) => (
//             <View style={styles.leaderboardItem}>
//               <Text style={styles.leaderboardRank}>#{index + 1}</Text>
//               <Text style={styles.leaderboardUser}>{item.user?.name || 'Unknown'}</Text>
//               <ProgressBarAndroid
//                 styleAttr="Horizontal"
//                 indeterminate={false}
//                 progress={item.distance / (task?.distance || 1)}
//                 style={styles.progressBar}
//               />
//               <Text>{item.distance} km</Text>
//             </View>
//           )}
//           ListEmptyComponent={<Text>No progress yet</Text>}
//         />
//         <Text style={styles.sectionTitle}>Rules</Text>
//         {challenge.rules.map((rule, index) => (
//           <Text key={index} style={styles.detailText}>
//             - {rule}
//           </Text>
//         ))}
//         <Text style={styles.sectionTitle}>Exceptions</Text>
//         {challenge.exceptions.map((exception, index) => (
//           <Text key={index} style={styles.detailText}>
//             - {exception}
//           </Text>
//         ))}
//         <Button title="Future Feature" onPress={() => alert('To be implemented')} />
//         <Button title="Back" onPress={() => setSelectedChallenge(null)} />
//         <Button
//           title="Add 2km Progress (Test)"
//           onPress={() => handleChallengeProgress(challenge.challengeId, 2)}
//         />
//       </View>
//     );
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
//           onPress={() => {
//             setActiveTab('Tasks');
//             setSelectedChallenge(null);
//           }}
//         >
//           <Text style={styles.tabText}>Personal Tasks</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
//           onPress={() => {
//             setActiveTab('Challenges');
//             setSelectedChallenge(null);
//           }}
//         >
//           <Text style={styles.tabText}>Challenges</Text>
//         </TouchableOpacity>
//       </View>
//       {activeTab === 'Tasks' && !selectedChallenge && (
//         <>
//           <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onStopTask={handleStopTask} />
//           <Button title="Create New Task" onPress={() => router.push('/task')} />
//         </>
//       )}
//       {activeTab === 'Challenges' && !selectedChallenge && (
//         <FlatList
//           data={challenges}
//           keyExtractor={(item) => item.challengeId}
//           renderItem={({ item }) => {
//             const task = tasks.find((t) => t.taskId === item.taskId);
//             return (
//               <TouchableOpacity
//                 style={styles.challengeItem}
//                 onPress={() => setSelectedChallenge(item)}
//               >
//                 <Text>
//                   {item.title} - {task?.distance} km ({item.duration}) - ${item.reward}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//           ListEmptyComponent={<Text>No active challenges</Text>}
//         />
//       )}
//       {selectedChallenge && renderChallengeDetails(selectedChallenge)}
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderBottomWidth: 2,
//     borderBottomColor: '#ccc',
//   },
//   activeTab: {
//     backgroundColor: '#e0f7fa',
//     borderBottomColor: '#00C851',
//   },
//   tabText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   challengeItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   challengeDetails: {
//     marginTop: 20,
//   },
//   challengeTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   leaderboardItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   leaderboardRank: {
//     width: 50,
//     fontWeight: 'bold',
//   },
//   leaderboardUser: {
//     flex: 1,
//   },
//   progressBar: {
//     width: 100,
//     marginHorizontal: 10,
//   },
//   detailText: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
// });

// TODO: Fix duration errors, debug handleChallengeProgress, and add error handling.

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ProgressBarAndroid,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';
// import { SelfTask, Challenge, ChallengeProgress, FinishedTask, GraphData, User } from '../constants/schema';
// import uuid from 'react-native-uuid';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'Tasks' | 'Challenges'>('Tasks');
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         const storedChallenges = await AsyncStorage.getItem('challenges');
//         const storedChallengeProgress = await AsyncStorage.getItem('challengeProgress');
//         const storedUsers = await AsyncStorage.getItem('users');

//         const now = new Date();
//         if (storedTasks) {
//           const allTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//             (task: SelfTask) =>
//               task.userId === user.userId &&
//               !task.stop &&
//               new Date(task.endDate) >= now
//           );
//           setTasks(allTasks);
//         }
//         if (storedChallenges) {
//           const userChallenges: Challenge[] = JSON.parse(storedChallenges).filter(
//             (c: Challenge) =>
//               (c.creatorId === user.userId || c.assigneeIds.includes(user.userId)) &&
//               c.status === 'Active'
//           );
//           setChallenges(userChallenges);
//         }
//         if (storedChallengeProgress) {
//           setChallengeProgress(JSON.parse(storedChallengeProgress));
//         }
//         if (storedUsers) {
//           setUsers(JSON.parse(storedUsers));
//         }
//       } catch (error) {
//         console.error('Error loading data:', error);
//         setError('Failed to load data');
//       }
//     };
//     loadData();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       const task = allTasks.find((t) => t.taskId === taskId);
//       if (!task) return;

//       allTasks = allTasks.map((t) =>
//         t.taskId === taskId ? { ...t, completed: true, stop: true } : t
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       let finishedTasks: FinishedTask[] = storedFinishedTasks ? JSON.parse(storedFinishedTasks) : [];
//       finishedTasks.push({
//         finishedTaskId: uuid.v4().toString(),
//         taskId,
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         completedAt: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));

//       const storedGraphData = await AsyncStorage.getItem('graphData');
//       let graphData: GraphData[] = storedGraphData ? JSON.parse(storedGraphData) : [];
//       graphData.push({
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         date: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('graphData', JSON.stringify(graphData));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       allTasks = allTasks.map((task) =>
//         task.taskId === taskId ? { ...task, stop: true } : task
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   const handleChallengeProgress = async (challengeId: string, distance: number) => {
//     try {
//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (!currentUser) return;
//       const user = JSON.parse(currentUser);
//       const storedProgress = await AsyncStorage.getItem('challengeProgress');
//       let allProgress: ChallengeProgress[] = storedProgress ? JSON.parse(storedProgress) : [];
//       const existingProgress = allProgress.find(
//         (p) => p.challengeId === challengeId && p.userId === user.userId
//       );
//       if (existingProgress) {
//         allProgress = allProgress.map((p) =>
//           p.progressId === existingProgress.progressId
//             ? { ...p, distance: p.distance + distance, lastUpdated: new Date().toISOString() }
//             : p
//         );
//       } else {
//         allProgress.push({
//           progressId: uuid.v4().toString(),
//           challengeId,
//           userId: user.userId,
//           distance,
//           lastUpdated: new Date().toISOString(),
//         });
//       }
//       await AsyncStorage.setItem('challengeProgress', JSON.stringify(allProgress));
//       setChallengeProgress(allProgress);
//     } catch (error) {
//       console.error('Error updating challenge progress:', error);
//     }
//   };

//   const renderChallengeDetails = (challenge: Challenge) => {
//     const task = tasks.find((t) => t.taskId === challenge.taskId);
//     const progress = challengeProgress
//       .filter((p) => p.challengeId === challenge.challengeId)
//       .map((p) => ({
//         ...p,
//         user: users.find((u) => u.userId === p.userId),
//       }))
//       .sort((a, b) => b.distance - a.distance);

//     return (
//       <View style={styles.challengeDetails}>
//         <Text style={styles.challengeTitle}>
//           {challenge.title} - {task?.distance} km ({challenge.duration}) - ${challenge.reward} Gift Card
//         </Text>
//         <Text style={styles.sectionTitle}>Leaderboard</Text>
//         <FlatList
//           data={progress}
//           keyExtractor={(item) => item.progressId}
//           renderItem={({ item, index }) => (
//             <View style={styles.leaderboardItem}>
//               <Text style={styles.leaderboardRank}>#{index + 1}</Text>
//               <Text style={styles.leaderboardUser}>{item.user?.name || 'Unknown'}</Text>
//               <ProgressBarAndroid
//                 styleAttr="Horizontal"
//                 indeterminate={false}
//                 progress={item.distance / (task?.distance || 1)}
//                 style={styles.progressBar}
//               />
//               <Text>{item.distance} km</Text>
//             </View>
//           )}
//           ListEmptyComponent={<Text>No progress yet</Text>}
//         />
//         <Text style={styles.sectionTitle}>Rules</Text>
//         {challenge.rules.map((rule, index) => (
//           <Text key={index} style={styles.detailText}>
//             - {rule}
//           </Text>
//         ))}
//         <Text style={styles.sectionTitle}>Exceptions</Text>
//         {challenge.exceptions.map((exception, index) => (
//           <Text key={index} style={styles.detailText}>
//             - {exception}
//           </Text>
//         ))}
//         <Button title="Future Feature" onPress={() => alert('To be implemented')} />
//         <Button title="Back" onPress={() => setSelectedChallenge(null)} />
//         {/* Simulate progress update for testing */}
//         <Button
//           title="Add 2km Progress (Test)"
//           onPress={() => handleChallengeProgress(challenge.challengeId, 2)}
//         />
//       </View>
//     );
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
//           onPress={() => {
//             setActiveTab('Tasks');
//             setSelectedChallenge(null);
//           }}
//         >
//           <Text style={styles.tabText}>Personal Tasks</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
//           onPress={() => {
//             setActiveTab('Challenges');
//             setSelectedChallenge(null);
//           }}
//         >
//           <Text style={styles.tabText}>Challenges</Text>
//         </TouchableOpacity>
//       </View>
//       {activeTab === 'Tasks' && !selectedChallenge && (
//         <>
//           <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onStopTask={handleStopTask} />
//           <Button title="Create New Task" onPress={() => router.push('/task')} />
//         </>
//       )}
//       {activeTab === 'Challenges' && !selectedChallenge && (
//         <FlatList
//           data={challenges}
//           keyExtractor={(item) => item.challengeId}
//           renderItem={({ item }) => {
//             const task = tasks.find((t) => t.taskId === item.taskId);
//             return (
//               <TouchableOpacity
//                 style={styles.challengeItem}
//                 onPress={() => setSelectedChallenge(item)}
//               >
//                 <Text>
//                   {item.title} - {task?.distance} km ({item.duration}) - ${item.reward}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//           ListEmptyComponent={<Text>No active challenges</Text>}
//         />
//       )}
//       {selectedChallenge && renderChallengeDetails(selectedChallenge)}
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderBottomWidth: 2,
//     borderBottomColor: '#ccc',
//   },
//   activeTab: {
//     backgroundColor: '#e0f7fa',
//     borderBottomColor: '#00C851',
//   },
//   tabText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   challengeItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   challengeDetails: {
//     marginTop: 20,
//   },
//   challengeTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   leaderboardItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   leaderboardRank: {
//     width: 50,
//     fontWeight: 'bold',
//   },
//   leaderboardUser: {
//     flex: 1,
//   },
//   progressBar: {
//     width: 100,
//     marginHorizontal: 10,
//   },
//   detailText: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
// });


// TODO: fix the view of tasks

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';
// import { SelfTask, FinishedTask, GraphData } from '../constants/schema';
// import uuid from 'react-native-uuid';

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<SelfTask[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         const storedTasks = await AsyncStorage.getItem('selfTasks');
//         if (storedTasks) {
//           const now = new Date();
//           const allTasks: SelfTask[] = JSON.parse(storedTasks).filter(
//             (task: SelfTask) =>
//               task.userId === user.userId &&
//               !task.stop &&
//               new Date(task.endDate) >= now
//           );
//           setTasks(allTasks);
//         }
//       } catch (error) {
//         console.error('Error loading tasks:', error);
//         setError('Failed to load tasks');
//       }
//     };
//     loadTasks();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       const task = allTasks.find((t) => t.taskId === taskId);
//       if (!task) return;

//       allTasks = allTasks.map((t) =>
//         t.taskId === taskId ? { ...t, completed: true, stop: true } : t
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const storedFinishedTasks = await AsyncStorage.getItem('finishedTasks');
//       let finishedTasks: FinishedTask[] = storedFinishedTasks ? JSON.parse(storedFinishedTasks) : [];
//       finishedTasks.push({
//         finishedTaskId: uuid.v4().toString(),
//         taskId,
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         completedAt: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));

//       const storedGraphData = await AsyncStorage.getItem('graphData');
//       let graphData: GraphData[] = storedGraphData ? JSON.parse(storedGraphData) : [];
//       graphData.push({
//         userId: task.userId,
//         activity: task.activity,
//         distance: task.distance,
//         date: new Date().toISOString(),
//       });
//       await AsyncStorage.setItem('graphData', JSON.stringify(graphData));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       allTasks = allTasks.map((task) =>
//         task.taskId === taskId ? { ...task, stop: true } : task
//       );
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (currentUser) {
//         const user = JSON.parse(currentUser);
//         const now = new Date();
//         setTasks(allTasks.filter((t) => t.userId === user.userId && !t.stop && new Date(t.endDate) >= now));
//       }
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onStopTask={handleStopTask} />
//       <Button title="Create New Task" onPress={() => router.push('/task')} />
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });


// TODO: adding mockData

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';

// interface Task {
//   id: string;
//   activity: string;
//   distance: number;
//   createdAt: string;
//   user: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   completed: boolean;
//   stop?: boolean;
// }

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const storedTasks = await AsyncStorage.getItem('tasks');
//         if (storedTasks) {
//           const allTasks: Task[] = JSON.parse(storedTasks);
//           setTasks(allTasks.filter((task) => task.user === currentUser && !task.stop));
//         }
//       } catch (error) {
//         console.error('Error loading tasks:', error);
//         setError('Failed to load tasks');
//       }
//     };
//     loadTasks();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, completed: !task.completed } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Error updating task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, stop: true } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (error) {
//       console.error('Error stopping task:', error);
//       alert('Error stopping task');
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <TaskList
//         tasks={tasks}
//         onToggleComplete={handleToggleComplete}
//         onStopTask={handleStopTask}
//       />
//       <Button title="Create New Task" onPress={() => router.push('/task')} />
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
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });

// FIXME: working fine but changed along with tasklist

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';

// interface Task {
//   id: string;
//   activity: string;
//   distance: number;
//   createdAt: string;
//   user: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   completed: boolean;
//   stop?: boolean;
// }

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const storedTasks = await AsyncStorage.getItem('tasks');
//         if (storedTasks) {
//           const allTasks: Task[] = JSON.parse(storedTasks);
//           const userTasks = allTasks.filter((task) => task.user === currentUser && !task.stop);
//           setTasks(userTasks);
//         } else {
//           setTasks([]);
//         }
//       } catch (err) {
//         console.error('Error loading tasks:', err);
//         setError('Failed to load tasks');
//       }
//     };
//     loadTasks();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, completed: !task.completed } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (err) {
//       console.error('Error updating task:', err);
//       setError('Failed to update task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, stop: true } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (err) {
//       console.error('Error stopping task:', err);
//       setError('Failed to stop task');
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.error}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onStopTask={handleStopTask} />
//       <Button title="Create New Task" onPress={() => router.push('/task')} />
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
//   error: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });