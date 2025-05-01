import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { initializeMockData } from '../constants/mockData';

export default function RootLayout() {
  useEffect(() => {
    initializeMockData();
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
      <Stack.Screen name="signup" />
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="task" options={{ title: 'Task' }} />
      <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Stack.Screen name="challenge" options={{ title: 'Challenge' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="search" options={{ title: 'Search Users' }} />
      <Stack.Screen name="assign-task-modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// TODO: Adding challange route

// import { Stack, router } from 'expo-router';
// import { useEffect } from 'react';
// import { initializeMockData } from '../constants/mockData';

// export default function RootLayout() {
//   useEffect(() => {
//     initializeMockData(); // Initialize mock data
//     router.replace('/login'); 
//   }, []);

//   return (
//     <Stack
//       initialRouteName="login"
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Stack.Screen name="login" />
//       <Stack.Screen name="signup" />
//       <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
//       <Stack.Screen name="task" options={{ title: 'Task' }} />
//       <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
//       <Stack.Screen name="challenge" options={{ title: 'Challenge' }} />
//       <Stack.Screen name="profile" options={{ title: 'Profile' }} />
//       <Stack.Screen name="search" options={{ title: 'Search Users' }} />
//       <Stack.Screen name="assign-task-modal" options={{ presentation: 'modal' }} />
//     </Stack>
//   );
// }

//TODO: Adding mockData

// import { Stack, router } from 'expo-router';
// import { useEffect } from 'react';

// export default function RootLayout() {
//   useEffect(() => {
//     router.replace('/login');
//   }, []);

//   return (
//     <Stack
//       initialRouteName="login"
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Stack.Screen name="login" />
//       <Stack.Screen name="signup" />
//       <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
//       <Stack.Screen name="task" options={{ title: 'Task' }} />
//       <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
//       <Stack.Screen name="challenge" options={{ title: 'Challenge' }} />
//       <Stack.Screen name="profile" options={{ title: 'Profile' }} />
//     </Stack>
//   );
// }