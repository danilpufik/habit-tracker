import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../theme';
import { frequencyLabel } from '../utils/date';

interface HabitListRowProps {
  habit: Habit;
  currentStreak: number;
  onPress?: () => void;
}

export function HabitListRow({ habit, currentStreak, onPress }: HabitListRowProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${habit.color}22` }]}>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
          ]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
          ]}
          numberOfLines={1}
        >
          {frequencyLabel(habit.frequency)}
        </Text>
      </View>

      <Text
        style={[
          styles.streak,
          { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bodyBold },
        ]}
        numberOfLines={1}
      >
        {currentStreak} day streak
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  streak: {
    fontSize: 12,
    maxWidth: 90,
    textAlign: 'right',
  },
});
