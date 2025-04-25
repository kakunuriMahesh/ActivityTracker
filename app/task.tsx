import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVITY_TYPES } from '@/constants/config';
import { router } from 'expo-router';

interface Task {
  id: string;
  activity: string;
  distance: number;
  createdAt: string;
}

export default function TaskScreen() {
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [distance, setDistance] = useState<string>('');

  const handleCreateTask = async () => {
    const selectedActivity = ACTIVITY_TYPES.find((a) => a.name === activity);
    const distanceNum = parseFloat(distance);
    if (!distance || isNaN(distanceNum)) {
      alert('Please enter a valid distance');
      return;
    }
    if (selectedActivity && distanceNum < selectedActivity.minGoal && activity !== 'Other') {
      alert(`Distance must be at least ${selectedActivity.minGoal} km`);
      return;
    }

    const task: Task = {
      id: Math.random().toString(36).substring(2),
      activity,
      distance: distanceNum,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingTasks = await AsyncStorage.getItem('tasks');
      const tasks: Task[] = existingTasks ? JSON.parse(existingTasks) : [];
      tasks.push(task);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      alert(`Task created: ${activity} for ${distance} km`);
      router.push('/');
    } catch (error) {
      alert('Error saving task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Task</Text>
      <Picker
        selectedValue={activity}
        onValueChange={(value) => setActivity(value)}
        style={styles.picker}
      >
        {ACTIVITY_TYPES.map((type) => (
          <Picker.Item key={type.name} label={type.name} value={type.name} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Distance (km)"
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
      />
      <Button title="Create Task" onPress={handleCreateTask} />
      <Button title="Back to Home" onPress={() => router.push('/')} />
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
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});