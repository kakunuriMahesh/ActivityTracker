import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    router.replace('/login');
  }, []);

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="signup" options={{ title: 'Signup' }} />
      <Stack.Screen name="task" options={{ title: 'Task' }} />
      <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
    </Stack>
  );
}