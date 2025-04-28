import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

interface ChallengeInviteProps {
  onInvite: () => void;
}

export default function ChallengeInvite({ onInvite }: ChallengeInviteProps) {
  return (
    <View style={styles.container}>
      <Button title="Invite Friends" onPress={onInvite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
});