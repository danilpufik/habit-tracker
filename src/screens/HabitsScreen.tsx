import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { EmptyState, HabitListRow } from '../components';
import { getCurrentStreak } from '../utils/streaks';
import { Habit } from '../types';

type Filter = 'all' | 'active' | 'completed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

// Same segmented-control visual style as Stats' period control, recreated
// locally here since that one is private to StatsScreen.tsx (out of scope
// to touch this round).
function FilterControl({
  value,
  onChange,
  theme,
}: {
  value: Filter;
  onChange: (filter: Filter) => void;
  theme: Theme;
}) {
  return (
    <View
      style={[
        styles.segmented,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {FILTERS.map(({ key, label }) => {
        const active = key === value;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={[styles.segment, active && { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: active ? theme.colors.primaryText : theme.colors.textSecondary,
                  fontFamily: active
                    ? theme.typography.fontFamily.bodyBold
                    : theme.typography.fontFamily.bodyMedium,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function HabitsScreen({ navigation }: MainTabScreenProps<'Habits'>) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const todayKey = useHabitStore((state) => state.todayKey);
  const [filter, setFilter] = useState<Filter>('all');

  const openAddHabit = () => navigation.navigate('AddEditHabit');
  const openHabitDetails = (habit: Habit) =>
    navigation.navigate('HabitDetails', { habitId: habit.id });

  const filteredHabits = useMemo(() => {
    if (filter === 'all') return habits;
    return habits.filter((habit) => {
      const completedToday = habit.completions.includes(todayKey);
      return filter === 'completed' ? completedToday : !completedToday;
    });
  }, [habits, todayKey, filter]);

  const streaksByHabitId = useMemo(() => {
    const today = new Date();
    const map = new Map<string, number>();
    habits.forEach((habit) => map.set(habit.id, getCurrentStreak(habit, today)));
    return map;
  }, [habits, todayKey]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
        ]}
      >
        Habits
      </Text>

      {habits.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No habits yet"
          subtitle="Add your first habit to start building a streak."
          actionLabel="Add a habit"
          onAction={openAddHabit}
        />
      ) : (
        <FlatList
          data={filteredHabits}
          keyExtractor={(habit) => habit.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<FilterControl value={filter} onChange={setFilter} theme={theme} />}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="No matching habits"
              subtitle="Try a different filter."
            />
          }
          renderItem={({ item }) => (
            <HabitListRow
              habit={item}
              currentStreak={streaksByHabitId.get(item.id) ?? 0}
              onPress={() => openHabitDetails(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
  },
});
