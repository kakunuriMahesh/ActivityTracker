import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ChallengeInvite from '../components/ChallengeInvite';
import ActivitySelector from '../components/ActivitySelector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVITY_TYPES } from '@/constants/config';

interface Challenge {
  id: string;
  activity: string;
  goal: number;
  participants: string[];
  createdAt: string;
}

export default function ChallengeScreen() {
  const [activity, setActivity] = useState<string>(ACTIVITY_TYPES[0].name);
  const [goal, setGoal] = useState<string>('');

  const handleCreateChallenge = async () => {
    const goalNum = parseFloat(goal);
    if (!goal || isNaN(goalNum)) {
      alert('Please enter a valid goal distance');
      return;
    }

    const user = await AsyncStorage.getItem('currentUser');
    const challenge: Challenge = {
      id: Math.random().toString(36).substring(2),
      activity,
      goal: goalNum,
      participants: [user || 'unknown'],
      createdAt: new Date().toISOString(),
    };

    try {
      const existingChallenges = await AsyncStorage.getItem('challenges');
      const challenges: Challenge[] = existingChallenges ? JSON.parse(existingChallenges) : [];
      challenges.push(challenge);
      await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
      alert(`Challenge created: ${activity} for ${goal} km`);
      router.push('/');
    } catch (error) {
      alert('Error creating challenge');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Challenge</Text>
      <ActivitySelector
        selectedActivity={activity}
        onSelectActivity={setActivity}
      />
      <TextInput
        style={styles.input}
        placeholder="Goal Distance (km)"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
      />
      <ChallengeInvite onInvite={() => alert('Invited users (mock)')} />
      <Button title="Create Challenge" onPress={handleCreateChallenge} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});