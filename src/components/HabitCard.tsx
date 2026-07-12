import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../theme';
import { frequencyLabel } from '../utils/date';
import { CompletionToggle } from './CompletionToggle';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ habit, completed, onToggle, onPress, onLongPress }: HabitCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        style={styles.pressArea}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: `${habit.color}22` },
          ]}
        >
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>

        <View style={styles.textWrap}>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text,
                textDecorationLine: completed ? 'line-through' : 'none',
                opacity: completed ? 0.6 : 1,
              },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <Text style={[styles.frequency, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {frequencyLabel(habit.frequency)}
          </Text>
        </View>
      </TouchableOpacity>

      <CompletionToggle completed={completed} color={habit.color} onPress={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  frequency: {
    fontSize: 13,
    marginTop: 2,
  },
});
