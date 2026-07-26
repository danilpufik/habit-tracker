import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import { useHabitStore } from '../store';
import { EmptyState, HabitCard, ProgressRing } from '../components';
import { formatFriendlyDate, isDueToday } from '../utils/date';
import { triggerCompletionHaptic } from '../utils/haptics';
import { Habit } from '../types';

export function TodayScreen({ navigation }: MainTabScreenProps<'Today'>) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const dateKey = useHabitStore((state) => state.todayKey);

  const todaysHabits = useMemo(
    () => habits.filter((habit) => isDueToday(habit.frequency)),
    [habits, dateKey]
  );

  const completedCount = useMemo(
    () => todaysHabits.filter((habit) => habit.completions.includes(dateKey)).length,
    [todaysHabits, dateKey]
  );

  const progress = todaysHabits.length > 0 ? completedCount / todaysHabits.length : 0;

  const openAddHabit = () => navigation.navigate('AddEditHabit');
  const openEditHabit = (habit: Habit) =>
    navigation.navigate('AddEditHabit', { habitId: habit.id });
  const openHabitDetails = (habit: Habit) =>
    navigation.navigate('HabitDetails', { habitId: habit.id });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Today</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {formatFriendlyDate()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={openAddHabit}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          hitSlop={8}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No habits yet"
          subtitle="Add your first habit to start building a streak."
          actionLabel="Add a habit"
          onAction={openAddHabit}
        />
      ) : todaysHabits.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Nothing due today"
          subtitle="Enjoy the day off — check back on your next scheduled habit."
        />
      ) : (
        <FlatList
          data={todaysHabits}
          keyExtractor={(habit) => habit.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.ringWrap}>
              <ProgressRing
                progress={progress}
                label={`${completedCount}/${todaysHabits.length}`}
                sublabel="completed"
              />
            </View>
          }
          renderItem={({ item }) => {
            const isCompleted = item.completions.includes(dateKey);
            return (
              <HabitCard
                habit={item}
                completed={isCompleted}
                onToggle={() => {
                  triggerCompletionHaptic(!isCompleted);
                  toggleCompletion(item.id, dateKey);
                }}
                onPress={() => openEditHabit(item)}
                onLongPress={() => openHabitDetails(item)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ringWrap: {
    alignItems: 'center',
    marginVertical: 24,
  },
});
