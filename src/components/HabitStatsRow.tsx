import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../theme';

export type DayDotStatus = 'completed' | 'missed' | 'not-scheduled';

interface HabitStatsRowProps {
  habit: Habit;
  currentStreak: number;
  bestStreak: number;
  /** Oldest to newest, last 7 days including today. */
  last7Days: DayDotStatus[];
  onPress?: () => void;
}

export function HabitStatsRow({
  habit,
  currentStreak,
  bestStreak,
  last7Days,
  onPress,
}: HabitStatsRowProps) {
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
      <View style={[styles.iconWrap, { backgroundColor: `${habit.color}22` }]} importantForAccessibility="no">
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
        <View style={styles.streaks}>
          <Text
            style={[
              styles.streakText,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
            ]}
          >
            🔥 {currentStreak}
          </Text>
          <Text
            style={[
              styles.streakText,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
            ]}
          >
            Best {bestStreak}
          </Text>
        </View>
      </View>

      <View style={styles.dots}>
        {last7Days.map((status, index) => {
          const dotStyle =
            status === 'completed'
              ? { backgroundColor: habit.color, borderWidth: 0 }
              : status === 'missed'
              ? {
                  backgroundColor: 'transparent',
                  borderWidth: 1.5,
                  borderColor: theme.colors.textTertiary,
                }
              : { backgroundColor: theme.colors.border, borderWidth: 0, opacity: 0.3 };
          return <View key={index} style={[styles.dot, dotStyle]} />;
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
  },
  streaks: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  streakText: {
    fontSize: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
