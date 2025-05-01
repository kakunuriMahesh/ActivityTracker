import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivitySelector from '../components/ActivitySelector';
import { TextInput } from 'react-native-gesture-handler';
import { ACTIVITY_TYPES } from '../constants/config';
import uuid from 'react-native-uuid';
import { SelfTask, Challenge } from '../constants/schema';

export default function AssignTaskModal() {
  const { assigneeId } = useLocalSearchParams<{ assigneeId: string }>();
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');

  const handleAssignTask = async () => {
    const distanceNum = parseFloat(distance);
    if (!distance || isNaN(distanceNum)) {
      alert('Please enter a valid distance');
      return;
    }
    const selectedActivity = ACTIVITY_TYPES.find((a) => a.name === activity);
    if (selectedActivity && distanceNum < selectedActivity.minGoal && activity !== 'Other') {
      alert(`Distance must be at least ${selectedActivity.minGoal} km`);
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
        assigneeIds: assigneeId ? [assigneeId] : [], // Fixed
        taskId,
        title: `${activity} Challenge`,
        rules: ['Complete the task', 'Track progress'],
        exceptions: ['None'],
        reward: 0,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration,
      };

      const storedTasks = await AsyncStorage.getItem('selfTasks');
      let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
      allTasks.push(task);
      await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

      const storedChallenges = await AsyncStorage.getItem('challenges');
      let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
      allChallenges.push(challenge);
      await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));

      alert(`Task assigned to user ${assigneeId}`);
      router.back();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Error assigning task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Task</Text>
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
      <Button title="OK" onPress={handleAssignTask} />
      <Button title="Cancel" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

// TODO: fix the error like in assigneeId

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ActivitySelector from '../components/ActivitySelector';
// import { TextInput } from 'react-native-gesture-handler';
// import { ACTIVITY_TYPES } from '../constants/config';
// import uuid from 'react-native-uuid';
// import { SelfTask, Challenge } from '../constants/schema';

// export default function AssignTaskModal() {
//   const { assigneeId } = useLocalSearchParams<{ assigneeId: string }>();
//   const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
//   const [distance, setDistance] = useState<string>('');
//   const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');

//   const handleAssignTask = async () => {
//     const distanceNum = parseFloat(distance);
//     if (!distance || isNaN(distanceNum)) {
//       alert('Please enter a valid distance');
//       return;
//     }
//     const selectedActivity = ACTIVITY_TYPES.find((a) => a.name === activity);
//     if (selectedActivity && distanceNum < selectedActivity.minGoal && activity !== 'Other') {
//       alert(`Distance must be at least ${selectedActivity.minGoal} km`);
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
//         assigneeId: assigneeId || '',
//         taskId,
//         status: 'Pending',
//         createdAt: new Date().toISOString(),
//       };

//       const storedTasks = await AsyncStorage.getItem('selfTasks');
//       let allTasks: SelfTask[] = storedTasks ? JSON.parse(storedTasks) : [];
//       allTasks.push(task);
//       await AsyncStorage.setItem('selfTasks', JSON.stringify(allTasks));

//       const storedChallenges = await AsyncStorage.getItem('challenges');
//       let allChallenges: Challenge[] = storedChallenges ? JSON.parse(storedChallenges) : [];
//       allChallenges.push(challenge);
//       await AsyncStorage.setItem('challenges', JSON.stringify(allChallenges));

//       alert(`Task assigned to user ${assigneeId}`);
//       router.back();
//     } catch (error) {
//       console.error('Error assigning task:', error);
//       alert('Error assigning task');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Assign Task</Text>
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
//       <Button title="OK" onPress={handleAssignTask} />
//       <Button title="Cancel" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: 'white',
//     justifyContent: 'center',
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
// });