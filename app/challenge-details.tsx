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
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editEndDate, setEditEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [progressInput, setProgressInput] = useState('');
  const [progressUrl, setProgressUrl] = useState('');
  const [progressImage, setProgressImage] = useState('');
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);

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
        const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
        const challengeData = response.data;
        setChallenge(challengeData);
        setEditTitle(challengeData.title);
        setEditRules(challengeData.rules);
        setEditExceptions(challengeData.exceptions);
        setEditReward(challengeData.reward.toString());
        setEditStartDate(new Date(challengeData.startDate));
        setEditEndDate(new Date(challengeData.endDate));
        setSelectedUsers(challengeData.assigneeIds);
        const creationTime = new Date(challengeData.createdAt);
        const currentTime = new Date();
        const timeDiff = (currentTime - creationTime) / (1000 * 60 * 60); // Hours
        setCanEdit(timeDiff <= 24 && challengeData.creatorId === user.userId);
        const startDate = new Date(challengeData.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        setIsUpcoming(startDate > today);
      } catch (err) {
        setError('Failed to fetch challenge details');
      }
    };
    loadChallenge();
  }, [challengeId]);

  const getDurationText = (start: Date, end: Date) => {
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Invalid duration';

    const years = Math.floor(diff / 365);
    const months = Math.floor((diff % 365) / 30);
    const days = diff % 30;

    const parts = [];
    if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(' ') : `${diff} day${diff > 1 ? 's' : ''}`;
  };

  const handleConfirmStartDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      setError('Start date cannot be in the past');
      setStartDatePickerVisibility(false);
      return;
    }
    setEditStartDate(date);
    setStartDatePickerVisibility(false);
    // Reset end date if it's before the new start date
    if (editEndDate && editEndDate < date) {
      setEditEndDate(null);
    }
  };

  const handleConfirmEndDate = (date: Date) => {
    if (!editStartDate) {
      setError('Please select a start date first');
      setEndDatePickerVisibility(false);
      return;
    }
    if (date <= editStartDate) {
      setError('End date must be after start date');
      setEndDatePickerVisibility(false);
      return;
    }
    setEditEndDate(date);
    setEndDatePickerVisibility(false);
  };

  const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
    try {
      await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
        userId,
        response: resp,
        responseReason: resp !== 'agree' ? responseReason : undefined,
      });
      alert(`Challenge ${resp}ed successfully`);
      const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
      setChallenge(response.data);
      setResponse('');
      setResponseReason('');
      const startDate = new Date(response.data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      setIsUpcoming(startDate > today);
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
      await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`, {
        userId,
        distance,
        url: progressUrl || undefined,
        image: progressImage || undefined,
        date: new Date(),
      });
      alert('Progress updated');
      const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
      setChallenge(response.data);
      setProgressInput('');
      setProgressUrl('');
      setProgressImage('');
    } catch (err) {
      setError('Failed to update progress: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditChallenge = async () => {
    if (!editStartDate) {
      setError('Please select a start date');
      return;
    }
    if (!editEndDate) {
      setError('Please select an end date');
      return;
    }
    const durationText = getDurationText(editStartDate, editEndDate);
    try {
      const response = await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/edit`, {
        userId,
        title: editTitle,
        rules: editRules.filter((r) => r.trim()),
        exceptions: editExceptions.filter((e) => e.trim()),
        reward: parseInt(editReward),
        startDate: editStartDate.toISOString(),
        endDate: editEndDate.toISOString(),
        duration: durationText,
        assigneeIds: selectedUsers,
      });
      setChallenge(response.data);
      setEditModalVisible(false);
      alert('Challenge updated successfully');
      const startDate = new Date(response.data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      setIsUpcoming(startDate > today);
    } catch (err) {
      setError('Failed to edit challenge: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      await axios.delete(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`, {
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

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/users/search?query=${searchQuery}`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to search users');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(
      selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : [...selectedUsers, userId]
    );
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
      <Text>Status: {isUpcoming && participantStatus === 'active' ? 'Upcoming' : challenge.status}</Text>
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
            <Text>Status: {isUpcoming && item.status === 'active' ? 'Upcoming' : item.status}</Text>
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

      {(isAssignee || isCreator) && participantStatus === 'active' && !isUpcoming && (
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

      {(isAssignee || isCreator) && participantStatus === 'active' && isUpcoming && (
        <View style={styles.upcomingContainer}>
          <Text style={styles.upcomingText}>
            This challenge is upcoming and will start on {new Date(challenge.startDate).toLocaleDateString()}.
            Progress updates will be available once the challenge begins.
          </Text>
        </View>
      )}

      {isAssignee && !isCreator && participantStatus === 'pending' && (
        <View style={styles.responseContainer}>
          <Text style={styles.sectionTitle}>Respond to Challenge</Text>
          <Button title="Agree" onPress={() => handleResponse('agree')} />
          <Button title="Reject" onPress={() => setResponse('reject')} />
          {/* <Button title="Skip" onPress={() => setResponse('skip')} /> */}
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
          <Text style={styles.sectionTitle}>Start Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setStartDatePickerVisibility(true)}
          >
            <Text>{editStartDate ? editStartDate.toISOString().split('T')[0] : 'Select Start Date'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmStartDate}
            onCancel={() => setStartDatePickerVisibility(false)}
            minimumDate={new Date()}
            display="default"
          />
          <Text style={styles.sectionTitle}>End Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setEndDatePickerVisibility(true)}
          >
            <Text>{editEndDate ? editEndDate.toISOString().split('T')[0] : 'Select End Date'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmEndDate}
            onCancel={() => setEndDatePickerVisibility(false)}
            minimumDate={editStartDate ? new Date(editStartDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
          />
          <Text style={styles.sectionTitle}>
            Duration: {editStartDate && editEndDate ? getDurationText(editStartDate, editEndDate) : 'Select dates'}
          </Text>
          <Text style={styles.sectionTitle}>Search Users</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by userId or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Button title="Search" onPress={handleSearch} />
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => toggleUserSelection(item.userId)}
              >
                <Text>{item.name} ({item.userId})</Text>
                <Text>{selectedUsers.includes(item.userId) ? '✔️ Selected' : ''}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.userId}
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
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  error: { color: 'red', marginBottom: 10 },
  responseContainer: { marginTop: 20 },
  progressContainer: { marginTop: 20 },
  upcomingContainer: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  upcomingText: { fontSize: 16, color: '#555' },
  participantItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  progressItem: { padding: 5, marginLeft: 10 },
  progressImage: { width: 100, height: 100, marginTop: 5 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },
  creatorActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  ruleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  delete: { fontSize: 20, marginLeft: 10 },
  userItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});


// TODO: challenge detail in start date and end date

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Modal,
// } from "react-native";
// import { useLocalSearchParams, router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import * as ImagePicker from "expo-image-picker";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// import { Picker } from "@react-native-picker/picker";

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState("");
//   const [response, setResponse] = useState("");
//   const [responseReason, setResponseReason] = useState("");
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editTitle, setEditTitle] = useState("");
//   const [editRules, setEditRules] = useState<string[]>([]);
//   const [editExceptions, setEditExceptions] = useState<string[]>([]);
//   const [editReward, setEditReward] = useState("");
//   const [editStartDate, setEditStartDate] = useState<Date | null>(null);
//   const [editDuration, setEditDuration] = useState("");
//   const [editEndDate, setEditEndDate] = useState("");
//   const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
//   const [progressInput, setProgressInput] = useState("");
//   const [progressUrl, setProgressUrl] = useState("");
//   const [progressImage, setProgressImage] = useState("");
//   const [error, setError] = useState("");
//   const [canEdit, setCanEdit] = useState(false);
//   const [isUpcoming, setIsUpcoming] = useState(false);

//   useEffect(() => {
//     const loadChallenge = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem("currentUser");
//         if (!currentUser) {
//           setError("No user logged in");
//           return;
//         }
//         const user = JSON.parse(currentUser);
//         setUserId(user.userId);
//         const response = await axios.get(
//           `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`
//         );
//         const challengeData = response.data;
//         setChallenge(challengeData);
//         setEditTitle(challengeData.title);
//         setEditRules(challengeData.rules);
//         setEditExceptions(challengeData.exceptions);
//         setEditReward(challengeData.reward.toString());
//         setEditStartDate(new Date(challengeData.startDate));
//         setEditDuration(challengeData.duration);
//         setEditEndDate(challengeData.endDate.split("T")[0]);
//         setSelectedUsers(challengeData.assigneeIds);
//         const creationTime = new Date(challengeData.createdAt);
//         const currentTime = new Date();
//         const timeDiff = (currentTime - creationTime) / (1000 * 60 * 60); // Hours
//         setCanEdit(timeDiff <= 24 && challengeData.creatorId === user.userId);
//         const startDate = new Date(challengeData.startDate);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         startDate.setHours(0, 0, 0, 0);
//         setIsUpcoming(startDate > today);
//       } catch (err) {
//         setError("Failed to fetch challenge details");
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   useEffect(() => {
//     if (editStartDate && editDuration) {
//       updateEndDate();
//     }
//   }, [editStartDate, editDuration]);

//   const updateEndDate = () => {
//     if (!editStartDate) return;
//     const start = new Date(editStartDate);
//     let end = new Date(start);
//     switch (editDuration) {
//       case "Day":
//         end.setDate(start.getDate() + 1);
//         break;
//       case "Week":
//         end.setDate(start.getDate() + 7);
//         break;
//       case "Month":
//         end.setMonth(start.getMonth() + 1);
//         break;
//       case "Year":
//         end.setFullYear(start.getFullYear() + 1);
//         break;
//     }
//     setEditEndDate(end.toISOString().split("T")[0]);
//   };

//   const handleConfirmDate = (date: Date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (date < today) {
//       setError("Start date cannot be in the past");
//       setDatePickerVisibility(false);
//       return;
//     }
//     setEditStartDate(date);
//     setDatePickerVisibility(false);
//   };

//   const handleResponse = async (resp: "agree" | "reject" | "skip") => {
//     try {
//       await axios.post(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`,
//         {
//           userId,
//           response: resp,
//           responseReason: resp !== "agree" ? responseReason : undefined,
//         }
//       );
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`
//       );
//       setChallenge(response.data);
//       setResponse("");
//       setResponseReason("");
//       const startDate = new Date(response.data.startDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       startDate.setHours(0, 0, 0, 0);
//       setIsUpcoming(startDate > today);
//     } catch (err) {
//       setError(
//         "Failed to respond to challenge: " +
//           (err.response?.data?.error || err.message)
//       );
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
//         setError("Invalid distance");
//         return;
//       }
//       await axios.post(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`,
//         {
//           userId,
//           distance,
//           url: progressUrl || undefined,
//           image: progressImage || undefined,
//           date: new Date(),
//         }
//       );
//       alert("Progress updated");
//       const response = await axios.get(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`
//       );
//       setChallenge(response.data);
//       setProgressInput("");
//       setProgressUrl("");
//       setProgressImage("");
//     } catch (err) {
//       setError(
//         "Failed to update progress: " +
//           (err.response?.data?.error || err.message)
//       );
//     }
//   };

//   const handleEditChallenge = async () => {
//     if (!editStartDate) {
//       setError("Please select a start date");
//       return;
//     }
//     try {
//       const response = await axios.patch(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/edit`,
//         {
//           userId,
//           title: editTitle,
//           rules: editRules.filter((r) => r.trim()),
//           exceptions: editExceptions.filter((e) => e.trim()),
//           reward: parseInt(editReward),
//           startDate: editStartDate.toISOString(),
//           duration: editDuration,
//           assigneeIds: selectedUsers,
//         }
//       );
//       setChallenge(response.data);
//       setEditModalVisible(false);
//       alert("Challenge updated successfully");
//       const startDate = new Date(response.data.startDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       startDate.setHours(0, 0, 0, 0);
//       setIsUpcoming(startDate > today);
//     } catch (err) {
//       setError(
//         "Failed to edit challenge: " +
//           (err.response?.data?.error || err.message)
//       );
//     }
//   };

//   const handleDeleteChallenge = async () => {
//     try {
//       await axios.delete(
//         `https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`,
//         {
//           data: { userId },
//         }
//       );
//       alert("Challenge deleted successfully");
//       router.push("/tasks");
//     } catch (err) {
//       setError(
//         "Failed to delete challenge: " +
//           (err.response?.data?.error || err.message)
//       );
//     }
//   };

//   const addRule = () => setEditRules([...editRules, ""]);
//   const updateRule = (index: number, value: string) => {
//     const newRules = [...editRules];
//     newRules[index] = value;
//     setEditRules(newRules);
//   };
//   const deleteRule = (index: number) =>
//     setEditRules(editRules.filter((_, i) => i !== index));

//   const addException = () => setEditExceptions([...editExceptions, ""]);
//   const updateException = (index: number, value: string) => {
//     const newExceptions = [...editExceptions];
//     newExceptions[index] = value;
//     setEditExceptions(newExceptions);
//   };
//   const deleteException = (index: number) =>
//     setEditExceptions(editExceptions.filter((_, i) => i !== index));

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(
//         `https://activity-tracker-backend-paum.onrender.com/api/users/search?query=${searchQuery}`
//       );
//       setUsers(response.data);
//     } catch (err) {
//       setError("Failed to search users");
//     }
//   };

//   const toggleUserSelection = (userId: string) => {
//     setSelectedUsers(
//       selectedUsers.includes(userId)
//         ? selectedUsers.filter((id) => id !== userId)
//         : [...selectedUsers, userId]
//     );
//   };

//   if (!challenge) {
//     return <Text>Loading...</Text>;
//   }

//   const isAssignee = challenge.assigneeIds.includes(userId);
//   const isCreator = challenge.creatorId === userId;
//   const participantStatus =
//     challenge.progress.find((p: any) => p.userId === userId)?.status ||
//     "pending";
//   const myProgress =
//     challenge.progress.find((p: any) => p.userId === userId)?.dailyProgress ||
//     [];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{challenge.title}</Text>
//       <Text>Activity: {challenge.taskId.activity}</Text>
//       <Text>Distance: {challenge.taskId.distance} km</Text>
//       <Text>Duration: {challenge.duration}</Text>
//       <Text>Rules: {challenge.rules.join(", ")}</Text>
//       <Text>Exceptions: {challenge.exceptions.join(", ")}</Text>
//       <Text>Reward: {challenge.reward}</Text>
//       <Text>
//         Status:{" "}
//         {isUpcoming && participantStatus === "active"
//           ? "Upcoming"
//           : challenge.status}
//       </Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
//       {challenge.winnerId && (
//         <Text>
//           Winner:{" "}
//           {
//             challenge.participants.find(
//               (p: any) => p.userId === challenge.winnerId
//             )?.name
//           }
//         </Text>
//       )}

//       {isCreator && (
//         <View style={styles.creatorActions}>
//           <Button
//             title="Edit Challenge"
//             onPress={() => setEditModalVisible(true)}
//             disabled={!canEdit}
//           />
//           <Button title="Delete Challenge" onPress={handleDeleteChallenge} />
//         </View>
//       )}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.participants}
//         renderItem={({ item }) => (
//           <View style={styles.participantItem}>
//             <Text>
//               {item.name} ({item.userId})
//             </Text>
//             <Text>
//               Status:{" "}
//               {isUpcoming && item.status === "active"
//                 ? "Upcoming"
//                 : item.status}
//             </Text>
//             {item.responseReason && <Text>Reason: {item.responseReason}</Text>}
//             <Text style={styles.sectionTitle}>Progress</Text>
//             <FlatList
//               data={item.dailyProgress}
//               renderItem={({ item: progress }) => (
//                 <View style={styles.progressItem}>
//                   <Text>
//                     Date: {new Date(progress.date).toLocaleDateString()}
//                   </Text>
//                   <Text>Distance: {progress.distance} km</Text>
//                   {progress.url && (
//                     <TouchableOpacity onPress={() => router.push(progress.url)}>
//                       <Text style={styles.link}>View Workout Link</Text>
//                     </TouchableOpacity>
//                   )}
//                   {progress.image && (
//                     <Image
//                       source={{ uri: progress.image }}
//                       style={styles.progressImage}
//                     />
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

//       {(isAssignee || isCreator) &&
//         participantStatus === "active" &&
//         !isUpcoming && (
//           <View style={styles.progressContainer}>
//             <Text style={styles.sectionTitle}>Update Progress</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter distance (km)"
//               value={progressInput}
//               onChangeText={setProgressInput}
//               keyboardType="numeric"
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Workout tracking URL"
//               value={progressUrl}
//               onChangeText={setProgressUrl}
//             />
//             <Button title="Pick Image" onPress={pickImage} />
//             {progressImage && (
//               <Image
//                 source={{ uri: progressImage }}
//                 style={styles.progressImage}
//               />
//             )}
//             <Button title="Submit Progress" onPress={handleProgress} />
//           </View>
//         )}

//       {(isAssignee || isCreator) &&
//         participantStatus === "active" &&
//         isUpcoming && (
//           <View style={styles.upcomingContainer}>
//             <Text style={styles.upcomingText}>
//               This challenge is upcoming and will start on{" "}
//               {new Date(challenge.startDate).toLocaleDateString()}. Progress
//               updates will be available once the challenge begins.
//             </Text>
//           </View>
//         )}

//       {isAssignee && !isCreator && participantStatus === "pending" && (
//         <View style={styles.responseContainer}>
//           <Text style={styles.sectionTitle}>Respond to Challenge</Text>
//           <Button title="Agree" onPress={() => handleResponse("agree")} />
//           <Button title="Reject" onPress={() => setResponse("reject")} />
//           <Button title="Skip" onPress={() => setResponse("skip")} />
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
//                 onPress={() => handleResponse(response as "reject" | "skip")}
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
//             {item.image && (
//               <Image
//                 source={{ uri: item.image }}
//                 style={styles.progressImage}
//               />
//             )}
//           </View>
//         )}
//         keyExtractor={(item) => item.date}
//         ListEmptyComponent={<Text>No activity recorded</Text>}
//       />

//       <Modal visible={editModalVisible} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Edit Challenge</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Challenge Title"
//             value={editTitle}
//             onChangeText={setEditTitle}
//           />
//           <Text style={styles.sectionTitle}>Rules</Text>
//           {editRules.map((rule, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Rule"
//                 value={rule}
//                 onChangeText={(text) => updateRule(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteRule(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Rule" onPress={addRule} />
//           <Text style={styles.sectionTitle}>Exceptions</Text>
//           {editExceptions.map((exception, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Exception"
//                 value={exception}
//                 onChangeText={(text) => updateException(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteException(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Exception" onPress={addException} />
//           <TextInput
//             style={styles.input}
//             placeholder="Reward"
//             value={editReward}
//             onChangeText={setEditReward}
//             keyboardType="numeric"
//           />
//           <Text style={styles.sectionTitle}>Duration</Text>
//           <Picker
//             selectedValue={editDuration}
//             style={styles.picker}
//             onValueChange={(value) => setEditDuration(value)}
//           >
//             <Picker.Item label="Day" value="Day" />
//             <Picker.Item label="Week" value="Week" />
//             <Picker.Item label="Month" value="Month" />
//             <Picker.Item label="Year" value="Year" />
//           </Picker>
//           <Text style={styles.sectionTitle}>Start Date</Text>
//           <TouchableOpacity
//             style={styles.input}
//             onPress={() => setDatePickerVisibility(true)}
//           >
//             <Text>
//               {editStartDate
//                 ? editStartDate.toISOString().split("T")[0]
//                 : "Select Start Date"}
//             </Text>
//           </TouchableOpacity>
//           {/* <DateTimePickerModal
//             isVisible={isDatePickerVisible}
//             mode="date"
//             onConfirm={handleConfirmDate}
//             onCancel={() => setDatePickerVisibility(false)}
//             minimumDate={new Date()}
//             display="default"
//           /> */}
//           <input
//             type="date"
//             min={new Date().toISOString().split("T")[0]}
//             onChange={(e) => {
//               const selected = new Date(e.target.value);
//               handleConfirmDate(selected);
//             }}
//           />
//           <Text style={styles.sectionTitle}>
//             End Date:{" "}
//             {editStartDate ? editEndDate : "Select a start date first"}
//           </Text>
//           <Text style={styles.sectionTitle}>Search Users</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Search by userId or email"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           <Button title="Search" onPress={handleSearch} />
//           <FlatList
//             data={users}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.userItem}
//                 onPress={() => toggleUserSelection(item.userId)}
//               >
//                 <Text>
//                   {item.name} ({item.userId})
//                 </Text>
//                 <Text>
//                   {selectedUsers.includes(item.userId) ? "✔️ Selected" : ""}
//                 </Text>
//               </TouchableOpacity>
//             )}
//             keyExtractor={(item) => item.userId}
//           />
//           <Button title="Save Changes" onPress={handleEditChallenge} />
//           <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
//         </View>
//       </Modal>

//       {error && <Text style={styles.error}>{error}</Text>}
//       <Button title="Back" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     justifyContent: "center",
//   },
//   error: { color: "red", marginBottom: 10 },
//   responseContainer: { marginTop: 20 },
//   progressContainer: { marginTop: 20 },
//   upcomingContainer: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 5,
//   },
//   upcomingText: { fontSize: 16, color: "#555" },
//   participantItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//   },
//   progressItem: { padding: 5, marginLeft: 10 },
//   progressImage: { width: 100, height: 100, marginTop: 5 },
//   link: { color: "#007AFF", textDecorationLine: "underline" },
//   creatorActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   modalContainer: { flex: 1, padding: 20 , overflow:"scroll"},
//   modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   ruleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   delete: { fontSize: 20, marginLeft: 10 },
//   picker: { height: 50, width: "100%", marginBottom: 10 },
//   userItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
// });

// FIXME: even the date was current date even it was not showing the fields

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
//   Modal,
// } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import * as ImagePicker from 'expo-image-picker';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editTitle, setEditTitle] = useState('');
//   const [editRules, setEditRules] = useState<string[]>([]);
//   const [editExceptions, setEditExceptions] = useState<string[]>([]);
//   const [editReward, setEditReward] = useState('');
//   const [editStartDate, setEditStartDate] = useState('');
//   const [editDuration, setEditDuration] = useState('');
//   const [progressInput, setProgressInput] = useState('');
//   const [progressUrl, setProgressUrl] = useState('');
//   const [progressImage, setProgressImage] = useState('');
//   const [error, setError] = useState('');
//   const [canEdit, setCanEdit] = useState(false);
//   const [isUpcoming, setIsUpcoming] = useState(false);

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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         const challengeData = response.data;
//         setChallenge(challengeData);
//         setEditTitle(challengeData.title);
//         setEditRules(challengeData.rules);
//         setEditExceptions(challengeData.exceptions);
//         setEditReward(challengeData.reward.toString());
//         setEditStartDate(challengeData.startDate.split('T')[0]);
//         setEditDuration(challengeData.duration);
//         const creationTime = new Date(challengeData.createdAt);
//         const currentTime = new Date();
//         const timeDiff = (currentTime - creationTime) / (1000 * 60 * 60); // Hours
//         setCanEdit(timeDiff <= 24 && challengeData.creatorId === user.userId);
//         const startDate = new Date(challengeData.startDate);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         setIsUpcoming(startDate > today);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setResponse('');
//       setResponseReason('');
//       const startDate = new Date(response.data.startDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       setIsUpcoming(startDate > today);
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
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`, {
//         userId,
//         distance,
//         url: progressUrl || undefined,
//         image: progressImage || undefined,
//         date: new Date(),
//       });
//       alert('Progress updated');
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setProgressInput('');
//       setProgressUrl('');
//       setProgressImage('');
//     } catch (err) {
//       setError('Failed to update progress: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleEditChallenge = async () => {
//     try {
//       const response = await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/edit`, {
//         userId,
//         title: editTitle,
//         rules: editRules.filter((r) => r.trim()),
//         exceptions: editExceptions.filter((e) => e.trim()),
//         reward: parseInt(editReward),
//         startDate: editStartDate,
//         duration: editDuration,
//       });
//       setChallenge(response.data);
//       setEditModalVisible(false);
//       alert('Challenge updated successfully');
//       const startDate = new Date(response.data.startDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       setIsUpcoming(startDate > today);
//     } catch (err) {
//       setError('Failed to edit challenge: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleDeleteChallenge = async () => {
//     try {
//       await axios.delete(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`, {
//         data: { userId },
//       });
//       alert('Challenge deleted successfully');
//       router.push('/tasks');
//     } catch (err) {
//       setError('Failed to delete challenge: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const addRule = () => setEditRules([...editRules, '']);
//   const updateRule = (index: number, value: string) => {
//     const newRules = [...editRules];
//     newRules[index] = value;
//     setEditRules(newRules);
//   };
//   const deleteRule = (index: number) => setEditRules(editRules.filter((_, i) => i !== index));

//   const addException = () => setEditExceptions([...editExceptions, '']);
//   const updateException = (index: number, value: string) => {
//     const newExceptions = [...editExceptions];
//     newExceptions[index] = value;
//     setEditExceptions(newExceptions);
//   };
//   const deleteException = (index: number) => setEditExceptions(editExceptions.filter((_, i) => i !== index));

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
//       <Text>Status: {isUpcoming && participantStatus === 'active' ? 'Upcoming' : challenge.status}</Text>
//       <Text>Created: {new Date(challenge.createdAt).toLocaleDateString()}</Text>
//       <Text>Start: {new Date(challenge.startDate).toLocaleDateString()}</Text>
//       <Text>End: {new Date(challenge.endDate).toLocaleDateString()}</Text>
//       {challenge.winnerId && <Text>Winner: {challenge.participants.find((p: any) => p.userId === challenge.winnerId)?.name}</Text>}

//       {isCreator && (
//         <View style={styles.creatorActions}>
//           <Button
//             title="Edit Challenge"
//             onPress={() => setEditModalVisible(true)}
//             disabled={!canEdit}
//           />
//           <Button title="Delete Challenge" onPress={handleDeleteChallenge} />
//         </View>
//       )}

//       <Text style={styles.sectionTitle}>Participants</Text>
//       <FlatList
//         data={challenge.participants}
//         renderItem={({ item }) => (
//           <View style={styles.participantItem}>
//             <Text>{item.name} ({item.userId})</Text>
//             <Text>Status: {isUpcoming && item.status === 'active' ? 'Upcoming' : item.status}</Text>
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

//       {(isAssignee || isCreator) && participantStatus === 'active' && !isUpcoming && (
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

//       {(isAssignee || isCreator) && participantStatus === 'active' && isUpcoming && (
//         <View style={styles.upcomingContainer}>
//           <Text style={styles.upcomingText}>
//             This challenge is upcoming and will start on {new Date(challenge.startDate).toLocaleDateString()}.
//             Progress updates will be available once the challenge begins.
//           </Text>
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

//       <Modal visible={editModalVisible} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Edit Challenge</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Challenge Title"
//             value={editTitle}
//             onChangeText={setEditTitle}
//           />
//           <Text style={styles.sectionTitle}>Rules</Text>
//           {editRules.map((rule, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Rule"
//                 value={rule}
//                 onChangeText={(text) => updateRule(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteRule(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Rule" onPress={addRule} />
//           <Text style={styles.sectionTitle}>Exceptions</Text>
//           {editExceptions.map((exception, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Exception"
//                 value={exception}
//                 onChangeText={(text) => updateException(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteException(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Exception" onPress={addException} />
//           <TextInput
//             style={styles.input}
//             placeholder="Reward"
//             value={editReward}
//             onChangeText={setEditReward}
//             keyboardType="numeric"
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Start Date (YYYY-MM-DD)"
//             value={editStartDate}
//             onChangeText={setEditStartDate}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Duration (Day, Week, Month, Year)"
//             value={editDuration}
//             onChangeText={setEditDuration}
//           />
//           <Button title="Save Changes" onPress={handleEditChallenge} />
//           <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
//         </View>
//       </Modal>

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
//   upcomingContainer: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
//   upcomingText: { fontSize: 16, color: '#555' },
//   participantItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
//   progressItem: { padding: 5, marginLeft: 10 },
//   progressImage: { width: 100, height: 100, marginTop: 5 },
//   link: { color: '#007AFF', textDecorationLine: 'underline' },
//   creatorActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
//   modalContainer: { flex: 1, padding: 20 },
//   modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   ruleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   delete: { fontSize: 20, marginLeft: 10 },
// });

//FIXME: TODO: adding upcoming session in detail page

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
//   Modal,
// } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import * as ImagePicker from 'expo-image-picker';

// export default function ChallengeDetailsScreen() {
//   const { challengeId } = useLocalSearchParams();
//   const [challenge, setChallenge] = useState<any>(null);
//   const [userId, setUserId] = useState('');
//   const [response, setResponse] = useState('');
//   const [responseReason, setResponseReason] = useState('');
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editTitle, setEditTitle] = useState('');
//   const [editRules, setEditRules] = useState<string[]>([]);
//   const [editExceptions, setEditExceptions] = useState<string[]>([]);
//   const [editReward, setEditReward] = useState('');
//   const [editStartDate, setEditStartDate] = useState('');
//   const [editDuration, setEditDuration] = useState('');
//   const [progressInput, setProgressInput] = useState('');
//   const [progressUrl, setProgressUrl] = useState('');
//   const [progressImage, setProgressImage] = useState('');
//   const [error, setError] = useState('');
//   const [canEdit, setCanEdit] = useState(false);

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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//         setEditTitle(response.data.title);
//         setEditRules(response.data.rules);
//         setEditExceptions(response.data.exceptions);
//         setEditReward(response.data.reward.toString());
//         setEditStartDate(response.data.startDate.split('T')[0]);
//         setEditDuration(response.data.duration);
//         const creationTime = new Date(response.data.createdAt);
//         const currentTime = new Date();
//         const timeDiff = (currentTime - creationTime) / (1000 * 60 * 60); // Hours
//         setCanEdit(timeDiff <= 24 && response.data.creatorId === user.userId);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`, {
//         userId,
//         distance,
//         url: progressUrl || undefined,
//         image: progressImage || undefined,
//         date: new Date(),
//       });
//       alert('Progress updated');
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//       setChallenge(response.data);
//       setProgressInput('');
//       setProgressUrl('');
//       setProgressImage('');
//     } catch (err) {
//       setError('Failed to update progress: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleEditChallenge = async () => {
//     try {
//       const response = await axios.patch(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/edit`, {
//         userId,
//         title: editTitle,
//         rules: editRules.filter((r) => r.trim()),
//         exceptions: editExceptions.filter((e) => e.trim()),
//         reward: parseInt(editReward),
//         startDate: editStartDate,
//         duration: editDuration,
//       });
//       setChallenge(response.data);
//       setEditModalVisible(false);
//       alert('Challenge updated successfully');
//     } catch (err) {
//       setError('Failed to edit challenge: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleDeleteChallenge = async () => {
//     try {
//       await axios.delete(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`, {
//         data: { userId },
//       });
//       alert('Challenge deleted successfully');
//       router.push('/tasks');
//     } catch (err) {
//       setError('Failed to delete challenge: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const addRule = () => setEditRules([...editRules, '']);
//   const updateRule = (index: number, value: string) => {
//     const newRules = [...editRules];
//     newRules[index] = value;
//     setEditRules(newRules);
//   };
//   const deleteRule = (index: number) => setEditRules(editRules.filter((_, i) => i !== index));

//   const addException = () => setEditExceptions([...editExceptions, '']);
//   const updateException = (index: number, value: string) => {
//     const newExceptions = [...editExceptions];
//     newExceptions[index] = value;
//     setEditExceptions(newExceptions);
//   };
//   const deleteException = (index: number) => setEditExceptions(editExceptions.filter((_, i) => i !== index));

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

//       {isCreator && (
//         <View style={styles.creatorActions}>
//           <Button
//             title="Edit Challenge"
//             onPress={() => setEditModalVisible(true)}
//             disabled={!canEdit}
//           />
//           <Button title="Delete Challenge" onPress={handleDeleteChallenge} />
//         </View>
//       )}

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

//       <Modal visible={editModalVisible} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Edit Challenge</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Challenge Title"
//             value={editTitle}
//             onChangeText={setEditTitle}
//           />
//           <Text style={styles.sectionTitle}>Rules</Text>
//           {editRules.map((rule, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Rule"
//                 value={rule}
//                 onChangeText={(text) => updateRule(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteRule(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Rule" onPress={addRule} />
//           <Text style={styles.sectionTitle}>Exceptions</Text>
//           {editExceptions.map((exception, index) => (
//             <View key={index} style={styles.ruleContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Exception"
//                 value={exception}
//                 onChangeText={(text) => updateException(index, text)}
//               />
//               <TouchableOpacity onPress={() => deleteException(index)}>
//                 <Text style={styles.delete}>🗑️</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Exception" onPress={addException} />
//           <TextInput
//             style={styles.input}
//             placeholder="Reward"
//             value={editReward}
//             onChangeText={setEditReward}
//             keyboardType="numeric"
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Start Date (YYYY-MM-DD)"
//             value={editStartDate}
//             onChangeText={setEditStartDate}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Duration (Day, Week, Month, Year)"
//             value={editDuration}
//             onChangeText={setEditDuration}
//           />
//           <Button title="Save Changes" onPress={handleEditChallenge} />
//           <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
//         </View>
//       </Modal>

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
//   creatorActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
//   modalContainer: { flex: 1, padding: 20 },
//   modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   ruleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   delete: { fontSize: 20, marginLeft: 10 },
// });

// TODO: below is working but fixing edit and delete

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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`, {
//         userId,
//         distance,
//         url: progressUrl || undefined,
//         image: progressImage || undefined,
//         date: new Date(),
//       });
//       alert('Progress updated');
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/progress`, {
//         userId,
//         distance,
//       });
//       alert('Progress updated');
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       // Refresh challenge data
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
//         const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
//         setChallenge(response.data);
//       } catch (err) {
//         setError('Failed to fetch challenge details');
//       }
//     };
//     loadChallenge();
//   }, [challengeId]);

//   const handleResponse = async (resp: 'agree' | 'reject' | 'skip') => {
//     try {
//       await axios.post(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}/respond`, {
//         userId,
//         response: resp,
//         responseReason: resp !== 'agree' ? responseReason : undefined,
//       });
//       alert(`Challenge ${resp}ed successfully`);
//       // Refresh challenge data
//       const response = await axios.get(`https://activity-tracker-backend-paum.onrender.com/api/challenges/${challengeId}`);
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
