import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivitySelector from '../components/ActivitySelector';
import { ACTIVITY_TYPES } from '../constants/config';
import uuid from 'react-native-uuid';
import { SelfTask, Challenge } from '../constants/schema';

export default function ChallengeScreen() {
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');
  const [title, setTitle] = useState<string>('');
  const [rules, setRules] = useState<string[]>(['', '']);
  const [exceptions, setExceptions] = useState<string[]>(['', '']);
  const [reward, setReward] = useState<string>('');

  const addRuleField = () => setRules([...rules, '']);
  const addExceptionField = () => setExceptions([...exceptions, '']);
  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };
  const updateException = (index: number, value: string) => {
    const newExceptions = [...exceptions];
    newExceptions[index] = value;
    setExceptions(newExceptions);
  };

  const handleCreateChallenge = async () => {
    const distanceNum = parseFloat(distance);
    const rewardNum = parseFloat(reward);
    if (!title || !distance || isNaN(distanceNum) || !reward || isNaN(rewardNum)) {
      alert('Please enter title, distance, and reward');
      return;
    }
    const selectedActivity = ACTIVITY_TYPES.find((a) => a.name === activity);
    if (selectedActivity && distanceNum < selectedActivity.minGoal && activity !== 'Other') {
      alert(`Distance must be at least ${selectedActivity.minGoal} km`);
      return;
    }
    if (rules.some((r) => !r) || exceptions.some((e) => !e)) {
      alert('Please fill all rules and exceptions');
      return;
    }

    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (!currentUser) {
        alert('No user logged in');
        return;
      }
      const user = JSON.parse(currentUser);
      const taskId = uuid.v4().toString();
      const startDate = new Date();
      let endDate: Date;
      if (duration === 'Day') {
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (duration === 'Week') {
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (duration === 'Month') {
        endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      }

      const task: SelfTask = {
        taskId,
        userId: user.userId,
        activity,
        distance: distanceNum,
        duration,
        createdAt: startDate.toISOString(),
        completed: false,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const challenge: Challenge = {
        challengeId: uuid.v4().toString(),
        creatorId: user.userId,
        assigneeIds: [],
        taskId,
        title,
        rules,
        exceptions,
        reward: rewardNum,
        status: 'Pending',
        createdAt: startDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration, // Added
      };

      const storedTasks = await AsyncStorage.getItem('selfTasks');
      let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
      allTasks.push(task);
      await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

      const storedChallenges = await AsyncStorage.getItem('challenges');
      let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
      allChallenges.push(challenge);
      await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));

      router.push({
        pathname: '/search',
        params: { challengeId: challenge.challengeId },
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Error creating challenge');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Challenge</Text>
      <TextInput
        style={styles.input}
        placeholder="Challenge Title"
        value={title}
        onChangeText={setTitle}
      />
      <ActivitySelector selectedActivity={activity} onSelectActivity={setActivity} />
      <TextInput
        style={styles.input}
        placeholder="Distance (km)"
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Duration (Day, Week, Month, Year)"
        value={duration}
        onChangeText={(text) => setDuration(text as 'Day' | 'Week' | 'Month' | 'Year')}
      />
      <TextInput
        style={styles.input}
        placeholder="Reward ($)"
        value={reward}
        onChangeText={setReward}
        keyboardType="numeric"
      />
      <Text style={styles.sectionTitle}>Rules</Text>
      <FlatList
        data={rules}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TextInput
            style={styles.input}
            placeholder={`Rule ${index + 1}`}
            value={item}
            onChangeText={(text) => updateRule(index, text)}
          />
        )}
      />
      <Button title="Add Rule" onPress={addRuleField} />
      <Text style={styles.sectionTitle}>Exceptions</Text>
      <FlatList
        data={exceptions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TextInput
            style={styles.input}
            placeholder={`Exception ${index + 1}`}
            value={item}
            onChangeText={(text) => updateException(index, text)}
          />
        )}
      />
      <Button title="Add Exception" onPress={addExceptionField} />
      <Button title="Next: Select Opponents" onPress={handleCreateChallenge} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

// TODO: Ensure duration is included in the Challenge object

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
// import { router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ActivitySelector from '../components/ActivitySelector';
// import { ACTIVITY_TYPES } from '../constants/config';
// import uuid from 'react-native-uuid';
// import { SelfTask, Challenge } from '../constants/schema';

// export default function ChallengeScreen() {
//   const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
//   const [distance, setDistance] = useState<string>('');
//   const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');
//   const [title, setTitle] = useState<string>('');
//   const [rules, setRules] = useState<string[]>(['', '']);
//   const [exceptions, setExceptions] = useState<string[]>(['', '']);
//   const [reward, setReward] = useState<string>('');

//   const addRuleField = () => setRules([...rules, '']);
//   const addExceptionField = () => setExceptions([...exceptions, '']);
//   const updateRule = (index: number, value: string) => {
//     const newRules = [...rules];
//     newRules[index] = value;
//     setRules(newRules);
//   };
//   const updateException = (index: number, value: string) => {
//     const newExceptions = [...exceptions];
//     newExceptions[index] = value;
//     setExceptions(newExceptions);
//   };

//   const handleCreateChallenge = async () => {
//     const distanceNum = parseFloat(distance);
//     const rewardNum = parseFloat(reward);
//     if (!title || !distance || isNaN(distanceNum) || !reward || isNaN(rewardNum)) {
//       alert('Please enter title, distance, and reward');
//       return;
//     }
//     const selectedActivity = ACTIVITY_TYPES.find((a) => a.name === activity);
//     if (selectedActivity && distanceNum < selectedActivity.minGoal && activity !== 'Other') {
//       alert(`Distance must be at least ${selectedActivity.minGoal} km`);
//       return;
//     }
//     if (rules.some((r) => !r) || exceptions.some((e) => !e)) {
//       alert('Please fill all rules and exceptions');
//       return;
//     }

//     try {
//       const currentUser = await AsyncStorage.getItem('currentUser');
//       if (!currentUser) {
//         alert('No user logged in');
//         return;
//       }
//       const user = JSON.parse(currentUser);
//       const taskId = uuid.v4().toString();
//       const startDate = new Date();
//       let endDate: Date;
//       if (duration === 'Day') {
//         endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
//       } else if (duration === 'Week') {
//         endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
//       } else if (duration === 'Month') {
//         endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
//       } else {
//         endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
//       }

//       const task: SelfTask = {
//         taskId,
//         userId: user.userId,
//         activity,
//         distance: distanceNum,
//         duration,
//         createdAt: startDate.toISOString(),
//         completed: false,
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//       };

//       const challenge: Challenge = {
//         challengeId: uuid.v4().toString(),
//         creatorId: user.userId,
//         assigneeIds: [],
//         taskId,
//         title,
//         rules,
//         exceptions,
//         reward: rewardNum,
//         status: 'Pending',
//         createdAt: startDate.toISOString(),
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//       };

//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       allTasks.push(task);
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       allChallenges.push(challenge);
//       await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));

//       router.push({
//         pathname: '/search',
//         params: { challengeId: challenge.challengeId },
//       });
//     } catch (error) {
//       console.error('Error creating challenge:', error);
//       alert('Error creating challenge');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Challenge</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Challenge Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <ActivitySelector selectedActivity={activity} onSelectActivity={setActivity} />
//       <TextInput
//         style={styles.input}
//         placeholder="Distance (km)"
//         value={distance}
//         onChangeText={setDistance}
//         keyboardType="numeric"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Duration (Day, Week, Month, Year)"
//         value={duration}
//         onChangeText={(text) => setDuration(text as 'Day' | 'Week' | 'Month' | 'Year')}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Reward ($)"
//         value={reward}
//         onChangeText={setReward}
//         keyboardType="numeric"
//       />
//       <Text style={styles.sectionTitle}>Rules</Text>
//       <FlatList
//         data={rules}
//         keyExtractor={(_, index) => index.toString()}
//         renderItem={({ item, index }) => (
//           <TextInput
//             style={styles.input}
//             placeholder={`Rule ${index + 1}`}
//             value={item}
//             onChangeText={(text) => updateRule(index, text)}
//           />
//         )}
//       />
//       <Button title="Add Rule" onPress={addRuleField} />
//       <Text style={styles.sectionTitle}>Exceptions</Text>
//       <FlatList
//         data={exceptions}
//         keyExtractor={(_, index) => index.toString()}
//         renderItem={({ item, index }) => (
//           <TextInput
//             style={styles.input}
//             placeholder={`Exception ${index + 1}`}
//             value={item}
//             onChangeText={(text) => updateException(index, text)}
//           />
//         )}
//       />
//       <Button title="Add Exception" onPress={addExceptionField} />
//       <Button title="Next: Select Opponents" onPress={handleCreateChallenge} />
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
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
// });

// TODO: update challange new fields

// import React, { useState } from 'react';
// import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import ChallengeInvite from '../components/ChallengeInvite';
// import ActivitySelector from '../components/ActivitySelector';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ACTIVITY_TYPES } from '@/constants/config';

// interface Challenge {
//   id: string;
//   activity: string;
//   goal: number;
//   participants: string[];
//   createdAt: string;
// }

// export default function ChallengeScreen() {
//   const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
//   const [goal, setGoal] = useState<string>('');

//   const handleCreateChallenge = async () => {
//     const goalNum = parseFloat(goal);
//     if (!goal || isNaN(goalNum)) {
//       alert('Please enter a valid goal distance');
//       return;
//     }

//     const user = await AsyncStorage.getItem('currentUser');
//     const challenge: Challenge = {
//       id: Math.random().toString(36).substring(2),
//       activity,
//       goal: goalNum,
//       participants: [user || 'unknown'],
//       createdAt: new Date().toISOString(),
//     };

//     try {
//       const existingChallenges = await AsyncStorage.getItem('challenges');
//       const challenges: Challenge[] = existingChallenges ? JSON.parse(existingChallenges) : [];
//       challenges.push(challenge);
//       await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
//       alert(`Challenge created: ${activity} for ${goal} km`);
//       router.push('/');
//     } catch (error) {
//       alert('Error creating challenge');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Challenge</Text>
//       <ActivitySelector
//         selectedActivity={activity}
//         onSelectActivity={setActivity}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Goal Distance (km)"
//         value={goal}
//         onChangeText={setGoal}
//         keyboardType="numeric"
//       />
//       <ChallengeInvite onInvite={() => alert('Invited users (mock)')} />
//       <Button title="Create Challenge" onPress={handleCreateChallenge} />
//       <Button title="Back to Home" onPress={() => router.push('/')} />
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
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     width: '100%',
//   },
// });