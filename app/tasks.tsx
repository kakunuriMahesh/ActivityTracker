import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import TaskList from '../components/TaskList';

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

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          setError('No user logged in');
          return;
        }
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          const allTasks: Task[] = JSON.parse(storedTasks);
          setTasks(allTasks.filter((task) => task.user === currentUser && !task.stop));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks');
      }
    };
    loadTasks();
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const allTasks: Task[] = JSON.parse(storedTasks);
        const updatedTasks = allTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        const currentUser = await AsyncStorage.getItem('currentUser');
        setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  const handleStopTask = async (taskId: string) => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const allTasks: Task[] = JSON.parse(storedTasks);
        const updatedTasks = allTasks.map((task) =>
          task.id === taskId ? { ...task, stop: true } : task
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        const currentUser = await AsyncStorage.getItem('currentUser');
        setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
      }
    } catch (error) {
      console.error('Error stopping task:', error);
      alert('Error stopping task');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Back to Dashboard" onPress={() => router.push('/')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>
      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onStopTask={handleStopTask}
      />
      <Button title="Create New Task" onPress={() => router.push('/task')} />
      <Button title="Back to Dashboard" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// FIXME: working fine but changed along with tasklist

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import TaskList from '../components/TaskList';

// interface Task {
//   id: string;
//   activity: string;
//   distance: number;
//   createdAt: string;
//   user: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   completed: boolean;
//   stop?: boolean;
// }

// export default function TasksScreen() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         if (!currentUser) {
//           setError('No user logged in');
//           return;
//         }
//         const storedTasks = await AsyncStorage.getItem('tasks');
//         if (storedTasks) {
//           const allTasks: Task[] = JSON.parse(storedTasks);
//           const userTasks = allTasks.filter((task) => task.user === currentUser && !task.stop);
//           setTasks(userTasks);
//         } else {
//           setTasks([]);
//         }
//       } catch (err) {
//         console.error('Error loading tasks:', err);
//         setError('Failed to load tasks');
//       }
//     };
//     loadTasks();
//   }, []);

//   const handleToggleComplete = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, completed: !task.completed } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (err) {
//       console.error('Error updating task:', err);
//       setError('Failed to update task');
//     }
//   };

//   const handleStopTask = async (taskId: string) => {
//     try {
//       const storedTasks = await AsyncStorage.getItem('tasks');
//       if (storedTasks) {
//         const allTasks: Task[] = JSON.parse(storedTasks);
//         const updatedTasks = allTasks.map((task) =>
//           task.id === taskId ? { ...task, stop: true } : task
//         );
//         await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         setTasks(updatedTasks.filter((task) => task.user === currentUser && !task.stop));
//       }
//     } catch (err) {
//       console.error('Error stopping task:', err);
//       setError('Failed to stop task');
//     }
//   };

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Error</Text>
//         <Text style={styles.error}>{error}</Text>
//         <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Tasks</Text>
//       <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onStopTask={handleStopTask} />
//       <Button title="Create New Task" onPress={() => router.push('/task')} />
//       <Button title="Back to Dashboard" onPress={() => router.push('/')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   error: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });