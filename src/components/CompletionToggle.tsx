import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

interface CompletionToggleProps {
  completed: boolean;
  color: string;
  onPress: () => void;
  size?: number;
}

export function CompletionToggle({
  completed,
  color,
  onPress,
  size = 32,
}: CompletionToggleProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: completed ? color : 'transparent',
          borderColor: completed ? color : theme.colors.border,
        },
      ]}
    >
      {completed ? <Text style={styles.check}>✓</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
