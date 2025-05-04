import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState('');
  const [responseReason, setResponseReason] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [progressUrl, setProgressUrl] = useState('');
  const [progressImage, setProgressImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          return;
        }
        const user = JSON.parse(currentUser);
        setUserId(user.userId);
        const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
        setChallenge(response.data);
      } catch (err) {
        setError('Failed to fetch challenge details');
      }
    };
    loadChallenge();
  }, [challengeId]);

  const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
    try {
      await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
        userId,
        response: resp,
        responseReason: resp !== 'agree' ? responseReason : undefined,
      });
      alert(`Challenge ${resp}ed successfully`);
      const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
      setChallenge(response.data);
      setResponse('');
      setResponseReason('');
    } catch (err) {
      setError('Failed to respond to challenge: ' + (err.response?.data?.error || err.message));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    });
    if (!result.canceled) {
      setProgressImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleProgress = async () => {
    try {
      const distance = parseFloat(progressInput);
      if (isNaN(distance) || distance <= 0) {
        setError('Invalid distance');
        return;
      }
      await axios.post(`http://localhost:5000/api/challenges/${challengeId}/progress`, {
        userId,
        distance,
        url: progressUrl || undefined,
        image: progressImage || undefined,
        date: new Date(),
      });
      alert('Progress updated');
      const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
      setChallenge(response.data);
      setProgressInput('');
      setProgressUrl('');
      setProgressImage('');
    } catch (err) {
      setError('Failed to update progress: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!challenge) {
    return <Text>Loading...</Text>;
  }

  const isAssignee = challenge.assigneeIds.includes(userId);
  const isCreator = challenge.creatorId === userId;
  const participantStatus = challenge.progress.find((p: any) => p.userId === userId)?.status || 'pending';
  const myProgress = challenge.progress.find((p: any) => p.userId === userId)?.dailyProgress || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text>Activity: {challenge.taskId.activity}</Text>
      <Text>Distance: {challenge.taskId.distance} km</Text>
      <Text>Duration: {challenge.duration}</Text>
      <Text>Rules: {challenge.rules.join(', ')}</Text>
      <Text>Exceptions: {challenge.exceptions.join(', ')}</Text>
      <Text>Reward: {challenge.reward}</Text>
      <Text>Status: {challenge.status}</Text>
      <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
      <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
      <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
      {challenge.winnerId && <Text>Winner: {challenge.participants.find((p: any) => p.userId === challenge.winnerId)?.name}</Text>}

      <Text style={styles.sectionTitle}>Participants</Text>
      <FlatList
        data={challenge.participants}
        renderItem={({ item }) => (
          <View style={styles.participantItem}>
            <Text>{item.name} ({item.userId})</Text>
            <Text>Status: {item.status}</Text>
            {item.responseReason && <Text>Reason: {item.responseReason}</Text>}
            <Text style={styles.sectionTitle}>Progress</Text>
            <FlatList
              data={item.dailyProgress}
              renderItem={({ item: progress }) => (
                <View style={styles.progressItem}>
                  <Text>Date: {new Date(progress.date).toLocaleDateString()}</Text>
                  <Text>Distance: {progress.distance} km</Text>
                  {progress.url && (
                    <TouchableOpacity onPress={() => router.push(progress.url)}>
                      <Text style={styles.link}>View Workout Link</Text>
                    </TouchableOpacity>
                  )}
                  {progress.image && (
                    <Image source={{ uri: progress.image }} style={styles.progressImage} />
                  )}
                </View>
              )}
              keyExtractor={(item) => item.date}
              ListEmptyComponent={<Text>No progress</Text>}
            />
          </View>
        )}
        keyExtractor={(item) => item.userId}
      />

      {(isAssignee || isCreator) && participantStatus === 'active' && (
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Update Progress</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter distance (km)"
            value={progressInput}
            onChangeText={setProgressInput}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Workout tracking URL"
            value={progressUrl}
            onChangeText={setProgressUrl}
          />
          <Button title="Pick Image" onPress={pickImage} />
          {progressImage && <Image source={{ uri: progressImage }} style={styles.progressImage} />}
          <Button title="Submit Progress" onPress={handleProgress} />
        </View>
      )}

      {isAssignee && !isCreator && participantStatus === 'pending' && (
        <View style={styles.responseContainer}>
          <Text style={styles.sectionTitle}>Respond to Challenge</Text>
          <Button title="Agree" onPress={() => handleResponse('agree')} />
          <Button title="Reject" onPress={() => setResponse('reject')} />
          <Button title="Skip" onPress={() => setResponse('skip')} />
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
                onPress={() => handleResponse(response as 'reject' | 'skip')}
              />
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>My Day Activity</Text>
      <FlatList
        data={myProgress}
        renderItem={({ item }) => (
          <View style={styles.progressItem}>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Distance: {item.distance} km</Text>
            {item.url && (
              <TouchableOpacity onPress={() => router.push(item.url)}>
                <Text style={styles.link}>View Workout Link</Text>
              </TouchableOpacity>
            )}
            {item.image && <Image source={{ uri: item.image }} style={styles.progressImage} />}
          </View>
        )}
        keyExtractor={(item) => item.date}
        ListEmptyComponent={<Text>No activity recorded</Text>}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10 },
  responseContainer: { marginTop: 20 },
  progressContainer: { marginTop: 20 },
  participantItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  progressItem: { padding: 5, marginLeft: 10 },
  progressImage: { width: 100, height: 100, marginTop: 5 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },
});

// FIXME: TODO: my day activity

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [progressInput, setProgressInput] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadChallenge = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setResponse('');
//       setResponseReason('');
//     } catch (err) {
//       setError('Failed to respond to challenge: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleProgress = async () => {
//     try {
//       const distance = parseFloat(progressInput);
//       if (isNaN(distance) || distance <= 0) {
//         setError('Invalid distance');
//         return;
//       }
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/progress`, {
//         userId,
//         distance,
//       });
//       alert('Progress updated');
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setProgressInput('');
//     } catch (err) {
//       setError('Failed to update progress: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   if (!challenge) {
//     return <Text>Loading...</Text>;
//   }

//   const isAssignee = challenge.assigneeIds.includes(userId);
//   const isCreator = challenge.creatorId === userId;
//   const participantStatus = challenge.progress.find((p: any) => p.userId === userId)?.status || 'pending';

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{challenge.title}</Text>
//       <Text>Activity: {challenge.taskId.activity}</Text>
//       <Text>Distance: {challenge.taskId.distance} km</Text>
//       <Text>Duration: {challenge.duration}</Text>
//       <Text>Rules: {challenge.rules.join(', ')}</Text>
//       <Text>Exceptions: {challenge.exceptions.join(', ')}</Text>
//       <Text>Reward: {challenge.reward}</Text>
//       <Text>Status: {challenge.status}</Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.participants}
//         renderItem={({ item }) => (
//           <View style={styles.participantItem}>
//             <Text>{item.name} ({item.userId})</Text>
//             <Text>Status: {item.status}</Text>
//             {item.status === 'active' && <Text>Progress: {item.progress} km</Text>}
//             {item.responseReason && <Text>Reason: {item.responseReason}</Text>}
//           </View>
//         )}
//         keyExtractor={(item) => item.userId}
//       />

//       {isAssignee && !isCreator && participantStatus === 'pending' && (
//         <View style={styles.responseContainer}>
//           <Text style={styles.sectionTitle}>Respond to Challenge</Text>
//           <Button title="Agree" onPress={() => handleResponse('agree')} />
//           <Button title="Reject" onPress={() => setResponse('reject')} />
//           <Button title="Skip" onPress={() => setResponse('skip')} />
//           {response && (
//             <View>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Reason for rejection/skip"
//                 value={responseReason}
//                 onChangeText={setResponseReason}
//               />
//               <Button
//                 title={`Confirm ${response}`}
//                 onPress={() => handleResponse(response as 'reject' | 'skip')}
//               />
//             </View>
//           )}
//         </View>
//       )}

//       {isAssignee && participantStatus === 'active' && (
//         <View style={styles.progressContainer}>
//           <Text style={styles.sectionTitle}>Update Progress</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter distance (km)"
//             value={progressInput}
//             onChangeText={setProgressInput}
//             keyboardType="numeric"
//           />
//           <Button title="Submit Progress" onPress={handleProgress} />
//         </View>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}
//       <Button title="Back" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
//   responseContainer: { marginTop: 20 },
//   progressContainer: { marginTop: 20 },
//   participantItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
// });

// TODO: chaallange status 

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadChallenge = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//     } catch (err) {
//       setError('Failed to respond to challenge');
//     }
//   };

//   if (!challenge) {
//     return <Text>Loading...</Text>;
//   }

//   const isAssignee = challenge.assigneeIds.includes(userId);
//   const isCreator = challenge.creatorId === userId;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{challenge.title}</Text>
//       <Text>Activity: {challenge.taskId.activity}</Text>
//       <Text>Distance: {challenge.taskId.distance} km</Text>
//       <Text>Duration: {challenge.duration}</Text>
//       <Text>Rules: {challenge.rules.join(', ')}</Text>
//       <Text>Exceptions: {challenge.exceptions.join(', ')}</Text>
//       <Text>Reward: {challenge.reward}</Text>
//       <Text>Status: {challenge.status}</Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
//       {challenge.responseReason && <Text>Response Reason: {challenge.responseReason}</Text>}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.assigneeIds}
//         renderItem={({ item }) => (
//           <Text>{item} {challenge.status === 'active' && item === userId ? '(Accepted)' : ''}</Text>
//         )}
//         keyExtractor={(item) => item}
//       />

//       {isAssignee && !isCreator && challenge.status === 'active' && (
//         <View style={styles.responseContainer}>
//           <Text style={styles.sectionTitle}>Respond to Challenge</Text>
//           <Button title="Agree" onPress={() => handleResponse('agree')} />
//           <Button title="Reject" onPress={() => setResponse('reject')} />
//           <Button title="Skip" onPress={() => setResponse('skip')} />
//           {response && (
//             <View>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Reason for rejection/skip"
//                 value={responseReason}
//                 onChangeText={setResponseReason}
//               />
//               <Button
//                 title={`Confirm ${response}`}
//                 onPress={() => handleResponse(response as 'reject' | 'skip')}
//               />
//             </View>
//           )}
//         </View>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}
//       <Button title="Back" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
//   responseContainer: { marginTop: 20 },
// });

// TODO: challanges are not coming 

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadChallenge = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       // Refresh challenge data
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//     } catch (err) {
//       setError('Failed to respond to challenge');
//     }
//   };

//   if (!challenge) {
//     return <Text>Loading...</Text>;
//   }

//   const isAssignee = challenge.assigneeIds.includes(userId);
//   const isCreator = challenge.creatorId === userId;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{challenge.title}</Text>
//       <Text>Activity: {challenge.taskId.activity}</Text>
//       <Text>Distance: {challenge.taskId.distance} km</Text>
//       <Text>Duration: {challenge.duration}</Text>
//       <Text>Rules: {challenge.rules.join(', ')}</Text>
//       <Text>Exceptions: {challenge.exceptions.join(', ')}</Text>
//       <Text>Reward: {challenge.reward}</Text>
//       <Text>Status: {challenge.status}</Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
//       {challenge.responseReason && <Text>Response Reason: {challenge.responseReason}</Text>}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.assigneeIds}
//         renderItem={({ item }) => (
//           <Text>{item} {challenge.status === 'active' && item === userId ? '(Accepted)' : ''}</Text>
//         )}
//         keyExtractor={(item) => item}
//       />

//       {isAssignee && challenge.status === 'active' && (
//         <View style={styles.responseContainer}>
//           <Text style={styles.sectionTitle}>Respond to Challenge</Text>
//           <Button title="Agree" onPress={() => handleResponse('agree')} />
//           <Button title="Reject" onPress={() => setResponse('reject')} />
//           <Button title="Skip" onPress={() => setResponse('skip')} />
//           {response && (
//             <View>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Reason for rejection/skip"
//                 value={responseReason}
//                 onChangeText={setResponseReason}
//               />
//               <Button
//                 title={`Confirm ${response}`}
//                 onPress={() => handleResponse(response as 'reject' | 'skip')}
//               />
//             </View>
//           )}
//         </View>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
//   responseContainer: { marginTop: 20 },
// });

// TODO: fix this

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadChallenge = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`http://localhost:5000/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       // Refresh challenge data
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//     } catch (err) {
//       setError('Failed to respond to challenge');
//     }
//   };

//   if (!challenge) {
//     return <Text>Loading...</Text>;
//   }

//   const isAssignee = challenge.assigneeIds.includes(userId);
//   const isCreator = challenge.creatorId === userId;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{challenge.title}</Text>
//       <Text>Activity: {challenge.taskId.activity}</Text>
//       <Text>Distance: {challenge.taskId.distance} km</Text>
//       <Text>Duration: {challenge.duration}</Text>
//       <Text>Rules: {challenge.rules.join(', ')}</Text>
//       <Text>Exceptions: {challenge.exceptions.join(', ')}</Text>
//       <Text>Reward: {challenge.reward}</Text>
//       <Text>Status: {challenge.status}</Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
//       {challenge.responseReason && <Text>Response Reason: {challenge.responseReason}</Text>}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.assigneeIds}
//         renderItem={({ item }) => (
//           <Text>{item} {challenge.status === 'active' && item === userId ? '(Accepted)' : ''}</Text>
//         )}
//         keyExtractor={(item) => item}
//       />

//       {isAssignee && challenge.status === 'active' && (
//         <View style={styles.responseContainer}>
//           <Text style={styles.sectionTitle}>Respond to Challenge</Text>
//           <Button title="Agree" onPress={() => handleResponse('agree')} />
//           <Button title="Reject" onPress={() => setResponse('reject')} />
//           <Button title="Skip" onPress={() => setResponse('skip')} />
//           {response && (
//             <View>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Reason for rejection/skip"
//                 value={responseReason}
//                 onChangeText={setResponseReason}
//               />
//               <Button
//                 title={`Confirm ${response}`}
//                 onPress={() => handleResponse(response as 'reject' | 'skip')}
//               />
//             </View>
//           )}
//         </View>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
//   responseContainer: { marginTop: 20 },
// });