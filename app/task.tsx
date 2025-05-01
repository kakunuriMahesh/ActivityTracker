
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import TaskForm from '../components/TaskForm';

export default function TaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Task</Text>
      <TaskForm onSuccess={() => router.push('/')} />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
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
});

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