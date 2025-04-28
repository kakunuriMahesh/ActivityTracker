import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

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

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onStopTask: (taskId: string) => void;
}

export default function TaskList({ tasks = [], onToggleComplete, onStopTask }: TaskListProps) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.taskItem}>
          <TouchableOpacity
            onPress={() => onToggleComplete(item.id)}
            style={styles.toggleButton}
            disabled={item.completed} // Prevent toggling completed tasks
          >
            <Text style={styles.toggleIcon}>{item.completed ? '✅' : '⬜'}</Text>
          </TouchableOpacity>
          <View style={styles.taskDetails}>
            <Text style={[styles.taskText, item.completed && styles.completedText]}>
              {item.activity} - {item.distance} km ({item.duration})
            </Text>
            <Text style={styles.taskDate}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {!item.completed && (
            <TouchableOpacity onPress={() => onStopTask(item.id)} style={styles.stopButton}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No tasks created yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  toggleButton: {
    marginRight: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
  taskDetails: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  stopButton: {
    backgroundColor: '#ff4444',
    padding: 5,
    borderRadius: 5,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

// FIXME: working witout checkbox
// import React from 'react';
// import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// // import CheckBox from '@react-native-community/checkbox';
// // import { View, Text, FlatList, StyleSheet, TouchableOpacity, CheckBox } from 'react-native';

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

// interface TaskListProps {
//   tasks: Task[];
//   // onToggleComplete: (taskId: string) => void;
//   onStopTask: (taskId: string) => void;
// }

// export default function TaskList({ tasks = [], onToggleComplete, onStopTask }: TaskListProps) {
//   return (
//     <FlatList
//       data={tasks}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <View style={styles.taskItem}>
//           {/* <CheckBox
//             value={item.completed}
//             onValueChange={() => onToggleComplete(item.id)}
//             style={styles.checkbox}
//           /> */}
//           <View style={styles.taskDetails}>
//             <Text style={[styles.taskText, item.completed && styles.completedText]}>
//               {item.activity} - {item.distance} km ({item.duration})
//             </Text>
//             <Text style={styles.taskDate}>
//               Created: {new Date(item.createdAt).toLocaleDateString()}
//             </Text>
//           </View>
//           {!item.completed && (
//             <TouchableOpacity onPress={() => onStopTask(item.id)} style={styles.stopButton}>
//               <Text style={styles.stopButtonText}>Stop</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
//       ListEmptyComponent={
//         <Text style={styles.emptyText}>No tasks created yet.</Text>
//       }
//     />
//   );
// }

// const styles = StyleSheet.create({
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   checkbox: {
//     marginRight: 10,
//   },
//   taskDetails: {
//     flex: 1,
//   },
//   taskText: {
//     fontSize: 16,
//   },
//   completedText: {
//     textDecorationLine: 'line-through',
//     color: '#666',
//   },
//   taskDate: {
//     fontSize: 12,
//     color: '#666',
//   },
//   stopButton: {
//     backgroundColor: '#ff4444',
//     padding: 5,
//     borderRadius: 5,
//   },
//   stopButtonText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginTop: 20,
//   },
// });