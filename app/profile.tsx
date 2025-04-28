import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import ActivityChart from '../components/ActivityChart';
import StreakBadge from '../components/StreakBadge';
import Leaderboard from '../components/Leaderboard';

interface Task {
  id: string;
  activity: string;
  distance: number;
  createdAt: string;
  user: string;
  duration: 'Day' | 'Week' | 'Month' | 'Year';
  completed: boolean;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [rank, setRank] = useState<string>('Beginner');

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await AsyncStorage.getItem('currentUser');
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (currentUser) {
        setUser(currentUser);
      }
      if (storedTasks) {
        const userTasks: Task[] = JSON.parse(storedTasks).filter(
          (task: Task) => task.user === currentUser
        );
        setTasks(userTasks);
        calculateStreak(userTasks);
      }
    };
    loadProfile();
  }, []);

  const calculateStreak = (userTasks: Task[]) => {
    const completedTasks = userTasks.filter((task) => task.completed);
    if (completedTasks.length === 0) {
      setStreak(0);
      setRank('Beginner');
      return;
    }

    // Sort tasks by date
    const sortedTasks = completedTasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let currentStreak = 0;
    let lastDate: Date | null = null;
    for (const task of sortedTasks) {
      const taskDate = new Date(task.createdAt);
      taskDate.setHours(0, 0, 0, 0); // Normalize to start of day
      if (!lastDate) {
        currentStreak = 1;
        lastDate = taskDate;
        continue;
      }
      const diffDays = (lastDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays === 1) {
        currentStreak++;
        lastDate = taskDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    setStreak(currentStreak);
    if (currentStreak >= 30) {
      setRank('Elite');
    } else if (currentStreak >= 14) {
      setRank('Pro');
    } else if (currentStreak >= 7) {
      setRank('Advanced');
    } else {
      setRank('Beginner');
    }
  };

  const totalDistance = tasks.reduce((sum, task) => sum + task.distance, 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile: {user || 'Unknown'}</Text>
      <Text style={styles.subtitle}>Total Tasks: {totalTasks}</Text>
      <Text style={styles.subtitle}>Completed Tasks: {completedTasks}</Text>
      <Text style={styles.subtitle}>Total Distance: {totalDistance} km</Text>
      <StreakBadge streak={streak} rank={rank} />
      <ActivityChart />
      <Leaderboard users={[{ email: user || 'Unknown', totalDistance }]} />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
});