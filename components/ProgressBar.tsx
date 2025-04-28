import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${normalizedProgress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
});