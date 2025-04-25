import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LoginForm from '../components/LoginForm';

export default function LoginScreen() {
  const [message, setMessage] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracker - Login</Text>
      <LoginForm
        onLogin={(msg: string) => setMessage(msg)}
        onSuccess={() => router.push('/')}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button title="Go to Signup" onPress={() => router.push('/signup')} />
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