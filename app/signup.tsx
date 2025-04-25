import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SignupForm from '../components/SignupForm';

export default function SignupScreen() {
  const [message, setMessage] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracker - Signup</Text>
      <SignupForm
        onSignup={(msg: string) => setMessage(msg)}
        onSuccess={() => router.push('/')}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button title="Go to Login" onPress={() => router.push('/login')} />
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
  message: {
    marginTop: 20,
    color: 'blue',
  },
});