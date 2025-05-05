

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
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState('');
  const [responseReason, setResponseReason] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editRules, setEditRules] = useState<string[]>([]);
  const [editExceptions, setEditExceptions] = useState<string[]>([]);
  const [editReward, setEditReward] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [progressUrl, setProgressUrl] = useState('');
  const [progressImage, setProgressImage] = useState('');
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);

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
        setEditTitle(response.data.title);
        setEditRules(response.data.rules);
        setEditExceptions(response.data.exceptions);
        setEditReward(response.data.reward.toString());
        setEditStartDate(response.data.startDate.split('T')[0]);
        setEditDuration(response.data.duration);
        const creationTime = new Date(response.data.createdAt);
        const currentTime = new Date();
        const timeDiff = (currentTime - creationTime) / (1000 * 60 * 60); // Hours
        setCanEdit(timeDiff <= 24 && response.data.creatorId === user.userId);
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

  const handleEditChallenge = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/challenges/${challengeId}/edit`, {
        userId,
        title: editTitle,
        rules: editRules.filter((r) => r.trim()),
        exceptions: editExceptions.filter((e) => e.trim()),
        reward: parseInt(editReward),
        startDate: editStartDate,
        duration: editDuration,
      });
      setChallenge(response.data);
      setEditModalVisible(false);
      alert('Challenge updated successfully');
    } catch (err) {
      setError('Failed to edit challenge: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/challenges/${challengeId}`, {
        data: { userId },
      });
      alert('Challenge deleted successfully');
      router.push('/tasks');
    } catch (err) {
      setError('Failed to delete challenge: ' + (err.response?.data?.error || err.message));
    }
  };

  const addRule = () => setEditRules([...editRules, '']);
  const updateRule = (index: number, value: string) => {
    const newRules = [...editRules];
    newRules[index] = value;
    setEditRules(newRules);
  };
  const deleteRule = (index: number) => setEditRules(editRules.filter((_, i) => i !== index));

  const addException = () => setEditExceptions([...editExceptions, '']);
  const updateException = (index: number, value: string) => {
    const newExceptions = [...editExceptions];
    newExceptions[index] = value;
    setEditExceptions(newExceptions);
  };
  const deleteException = (index: number) => setEditExceptions(editExceptions.filter((_, i) => i !== index));

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

      {isCreator && (
        <View style={styles.creatorActions}>
          <Button
            title="Edit Challenge"
            onPress={() => setEditModalVisible(true)}
            disabled={!canEdit}
          />
          <Button title="Delete Challenge" onPress={handleDeleteChallenge} />
        </View>
      )}

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

      <Modal visible={editModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Challenge</Text>
          <TextInput
            style={styles.input}
            placeholder="Challenge Title"
            value={editTitle}
            onChangeText={setEditTitle}
          />
          <Text style={styles.sectionTitle}>Rules</Text>
          {editRules.map((rule, index) => (
            <View key={index} style={styles.ruleContainer}>
              <TextInput
                style={styles.input}
                placeholder="Rule"
                value={rule}
                onChangeText={(text) => updateRule(index, text)}
              />
              <TouchableOpacity onPress={() => deleteRule(index)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Button title="Add Rule" onPress={addRule} />
          <Text style={styles.sectionTitle}>Exceptions</Text>
          {editExceptions.map((exception, index) => (
            <View key={index} style={styles.ruleContainer}>
              <TextInput
                style={styles.input}
                placeholder="Exception"
                value={exception}
                onChangeText={(text) => updateException(index, text)}
              />
              <TouchableOpacity onPress={() => deleteException(index)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Button title="Add Exception" onPress={addException} />
          <TextInput
            style={styles.input}
            placeholder="Reward"
            value={editReward}
            onChangeText={setEditReward}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Start Date (YYYY-MM-DD)"
            value={editStartDate}
            onChangeText={setEditStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (Day, Week, Month, Year)"
            value={editDuration}
            onChangeText={setEditDuration}
          />
          <Button title="Save Changes" onPress={handleEditChallenge} />
          <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
        </View>
      </Modal>

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
  creatorActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  ruleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  delete: { fontSize: 20, marginLeft: 10 },
});

// FIXME: below is working but fixing edit and delete

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import * as ImagePicker from 'expo-image-picker';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [progressInput, setProgressInput] = useState('');
//   const [progressUrl, setProgressUrl] = useState('');
//   const [progressImage, setProgressImage] = useState('');
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

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       base64: true,
//     });
//     if (!result.canceled) {
//       setProgressImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
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
//         url: progressUrl || undefined,
//         image: progressImage || undefined,
//         date: new Date(),
//       });
//       alert('Progress updated');
//       const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setProgressInput('');
//       setProgressUrl('');
//       setProgressImage('');
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
//   const myProgress = challenge.progress.find((p: any) => p.userId === userId)?.dailyProgress || [];

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
//       {challenge.winnerId && <Text>Winner: {challenge.participants.find((p: any) => p.userId === challenge.winnerId)?.name}</Text>}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.participants}
//         renderItem={({ item }) => (
//           <View style={styles.participantItem}>
//             <Text>{item.name} ({item.userId})</Text>
//             <Text>Status: {item.status}</Text>
//             {item.responseReason && <Text>Reason: {item.responseReason}</Text>}
//             <Text style={styles.sectionTitle}>Progress</Text>
//             <FlatList
//               data={item.dailyProgress}
//               renderItem={({ item: progress }) => (
//                 <View style={styles.progressItem}>
//                   <Text>Date: {new Date(progress.date).toLocaleDateString()}</Text>
//                   <Text>Distance: {progress.distance} km</Text>
//                   {progress.url && (
//                     <TouchableOpacity onPress={() => router.push(progress.url)}>
//                       <Text style={styles.link}>View Workout Link</Text>
//                     </TouchableOpacity>
//                   )}
//                   {progress.image && (
//                     <Image source={{ uri: progress.image }} style={styles.progressImage} />
//                   )}
//                 </View>
//               )}
//               keyExtractor={(item) => item.date}
//               ListEmptyComponent={<Text>No progress</Text>}
//             />
//           </View>
//         )}
//         keyExtractor={(item) => item.userId}
//       />

//       {(isAssignee || isCreator) && participantStatus === 'active' && (
//         <View style={styles.progressContainer}>
//           <Text style={styles.sectionTitle}>Update Progress</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter distance (km)"
//             value={progressInput}
//             onChangeText={setProgressInput}
//             keyboardType="numeric"
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Workout tracking URL"
//             value={progressUrl}
//             onChangeText={setProgressUrl}
//           />
//           <Button title="Pick Image" onPress={pickImage} />
//           {progressImage && <Image source={{ uri: progressImage }} style={styles.progressImage} />}
//           <Button title="Submit Progress" onPress={handleProgress} />
//         </View>
//       )}

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

//       <Text style={styles.sectionTitle}>My Day Activity</Text>
//       <FlatList
//         data={myProgress}
//         renderItem={({ item }) => (
//           <View style={styles.progressItem}>
//             <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
//             <Text>Distance: {item.distance} km</Text>
//             {item.url && (
//               <TouchableOpacity onPress={() => router.push(item.url)}>
//                 <Text style={styles.link}>View Workout Link</Text>
//               </TouchableOpacity>
//             )}
//             {item.image && <Image source={{ uri: item.image }} style={styles.progressImage} />}
//           </View>
//         )}
//         keyExtractor={(item) => item.date}
//         ListEmptyComponent={<Text>No activity recorded</Text>}
//       />

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
//   progressItem: { padding: 5, marginLeft: 10 },
//   progressImage: { width: 100, height: 100, marginTop: 5 },
//   link: { color: '#007AFF', textDecorationLine: 'underline' },
// });

// TODO: my day activity

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