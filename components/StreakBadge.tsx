import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakBadgeProps {
  streak: number;
  rank: string;
}

export default function StreakBadge({ streak, rank }: StreakBadgeProps) {
  const getIcon = () => {
    if (rank === 'Elite') return '🏆';
    if (rank === 'Pro') return '🔥';
    if (rank === 'Advanced') return '⭐';
    return '🌱';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={styles.text}>Streak: {streak} days</Text>
      <Text style={styles.text}>Rank: {rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    marginRight: 10,
  },
});