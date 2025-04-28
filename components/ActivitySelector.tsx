import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet } from 'react-native';
import { ACTIVITY_TYPES } from '@/constants/config';

interface ActivitySelectorProps {
  selectedActivity: string;
  onSelectActivity: (activity: string) => void;
}

export default function ActivitySelector({ selectedActivity, onSelectActivity }: ActivitySelectorProps) {
  return (
    <Picker
      selectedValue={selectedActivity}
      onValueChange={onSelectActivity}
      style={styles.picker}
    >
      {ACTIVITY_TYPES.map((type) => (
        <Picker.Item key={type.name} label={type.name} value={type.name} />
      ))}
    </Picker>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: '100%',
    marginBottom: 20,
  },
});