import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Task {
  id: string;
  activity: string;
  distance: number;
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.taskItem}>
          <Text style={styles.taskText}>
            {item.activity} - {item.distance} km
          </Text>
          <Text style={styles.taskDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskText: {
    fontSize: 16,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});