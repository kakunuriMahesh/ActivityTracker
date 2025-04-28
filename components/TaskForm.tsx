import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivitySelector from './ActivitySelector';
import { ACTIVITY_TYPES } from '@/constants/config';

interface Task {
  id: string;
  activity: string;
  distance: number;
  createdAt: string;
  user: string;
  duration: 'Day' | 'Week' | 'Month' | 'Year';
  completed: boolean;
  stop?: boolean;
}

interface TaskFormProps {
  onSuccess: () => void;
}

export default function TaskForm({ onSuccess }: TaskFormProps) {
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');

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

    const user = await AsyncStorage.getItem('currentUser');
    const tasks: Task[] = [];
    const baseTask: Task = {
      id: Math.random().toString(36).substring(2),
      activity,
      distance: distanceNum,
      createdAt: new Date().toISOString(),
      user: user || 'unknown',
      duration,
      completed: false,
    };

    // Add recurring tasks based on duration
    const today = new Date();
    if (duration === 'Day') {
      tasks.push(baseTask);
    } else if (duration === 'Week') {
      for (let i = 0; i < 7; i++) {
        tasks.push({
          ...baseTask,
          id: Math.random().toString(36).substring(2),
          createdAt: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } else if (duration === 'Month') {
      for (let i = 0; i < 30; i++) {
        tasks.push({
          ...baseTask,
          id: Math.random().toString(36).substring(2),
          createdAt: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } else if (duration === 'Year') {
      for (let i = 0; i < 365; i++) {
        tasks.push({
          ...baseTask,
          id: Math.random().toString(36).substring(2),
          createdAt: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    try {
      const existingTasks = await AsyncStorage.getItem('tasks');
      const allTasks: Task[] = existingTasks ? JSON.parse(existingTasks) : [];
      allTasks.push(...tasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(allTasks));
      alert(`Task created: ${activity} for ${distance} km (${duration})`);
      onSuccess();
    } catch (error) {
      alert('Error saving task');
    }
  };

  return (
    <View style={styles.form}>
      <ActivitySelector
        selectedActivity={activity}
        onSelectActivity={setActivity}
      />
      <TextInput
        style={styles.input}
        placeholder="Distance (km)"
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
      />
      <Picker
        selectedValue={duration}
        onValueChange={(value) => setDuration(value)}
        style={styles.picker}
      >
        <Picker.Item label="Day" value="Day" />
        <Picker.Item label="Week" value="Week" />
        <Picker.Item label="Month" value="Month" />
        <Picker.Item label="Year" value="Year" />
      </Picker>
      <Button title="Create Task" onPress={handleCreateTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: {
    width: '100%',
    marginBottom: 10,
  },
});