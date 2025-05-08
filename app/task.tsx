
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ActivitySelector from '../components/ActivitySelector';
import { ACTIVITY_TYPES } from '../constants/config';

export default function TaskScreen() {
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');
  const [points, setPoints] = useState<string>('');

  const handleCreateTask = async () => {
    const distanceNum = parseFloat(distance);
    const pointsNum = parseFloat(points);
    if (!distance || isNaN(distanceNum) || !points || isNaN(pointsNum)) {
      alert('Please enter distance and points');
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

      const task = {
        userId: user.userId,
        activity,
        distance: distanceNum,
        duration,
        createdAt: startDate.toISOString(),
        completed: false,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        points: pointsNum,
      };

      // Save to backend
      const response = await axios.post('https://activity-tracker-backend-paum.onrender.com/api/tasks', task);
      await AsyncStorage.setItem('currentTask', JSON.stringify(response.data));
      alert('Task created!');
      router.push('/');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Task</Text>
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
        placeholder="Points"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
      />
      <Button title="Create Task" onPress={handleCreateTask} />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});

// TODO: adding DB

// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import TaskForm from '../components/TaskForm';

// export default function TaskScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Task</Text>
//       <TaskForm onSuccess={() => router.push('/')} />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
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
// import TaskForm from '../components/TaskForm';

// export default function TaskScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Task</Text>
//       <TaskForm onSuccess={() => router.push('/')} />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
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