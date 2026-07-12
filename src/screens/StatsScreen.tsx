import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { DayDotStatus, EmptyState, HabitStatsRow, MonthHeatmap } from '../components';
import { isDueOn, toDateKey } from '../utils/date';
import { getBestStreak, getCurrentStreak } from '../utils/streaks';

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function StatCard({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function StatsScreen({ navigation }: MainTabScreenProps<'Stats'>) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);

  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const canGoNext = addMonths(selectedMonth, 1) <= startOfMonth(new Date());

  const openAddHabit = () => navigation.navigate('AddEditHabit');
  const goToPrevMonth = () => setSelectedMonth((prev) => addMonths(prev, -1));
  const goToNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));

  const bestCurrentStreak = useMemo(() => {
    const today = new Date();
    return habits.reduce((max, habit) => Math.max(max, getCurrentStreak(habit, today)), 0);
  }, [habits]);

  const weeklyCompletionRate = useMemo(() => {
    const today = new Date();
    let scheduled = 0;
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateKey = toDateKey(date);
      habits.forEach((habit) => {
        if (isDueOn(habit.frequency, date)) {
          scheduled += 1;
          if (habit.completions.includes(dateKey)) completed += 1;
        }
      });
    }
    return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
  }, [habits]);

  const dayIntensities = useMemo(() => {
    const map = new Map<string, number>();
    const year = selectedMonth.getFullYear();
    const monthIndex = selectedMonth.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dateKey = toDateKey(date);
      const scheduledHabits = habits.filter((habit) => isDueOn(habit.frequency, date));
      if (scheduledHabits.length === 0) {
        map.set(dateKey, 0);
        continue;
      }
      const completedCount = scheduledHabits.filter((habit) =>
        habit.completions.includes(dateKey)
      ).length;
      map.set(dateKey, completedCount / scheduledHabits.length);
    }
    return map;
  }, [habits, selectedMonth]);

  const getDayIntensity = useCallback(
    (dateKey: string) => dayIntensities.get(dateKey) ?? 0,
    [dayIntensities]
  );

  const habitStats = useMemo(() => {
    const today = new Date();
    return habits.map((habit) => {
      const last7Days: DayDotStatus[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        if (!isDueOn(habit.frequency, date)) {
          last7Days.push('not-scheduled');
        } else if (habit.completions.includes(toDateKey(date))) {
          last7Days.push('completed');
        } else {
          last7Days.push('missed');
        }
      }
      return {
        habit,
        currentStreak: getCurrentStreak(habit, today),
        bestStreak: getBestStreak(habit),
        last7Days,
      };
    });
  }, [habits]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Stats</Text>

      {habits.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No stats yet"
          subtitle="Add your first habit to start tracking streaks and trends."
          actionLabel="Add a habit"
          onAction={openAddHabit}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <StatCard label="Total habits" value={String(habits.length)} theme={theme} />
            <StatCard label="Best streak" value={`${bestCurrentStreak}🔥`} theme={theme} />
            <StatCard label="This week" value={`${weeklyCompletionRate}%`} theme={theme} />
          </View>

          <MonthHeatmap
            month={selectedMonth}
            getDayIntensity={getDayIntensity}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            canGoNext={canGoNext}
          />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habits</Text>
          {habitStats.map(({ habit, currentStreak, bestStreak, last7Days }) => (
            <HabitStatsRow
              key={habit.id}
              habit={habit}
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              last7Days={last7Days}
            />
          ))}
        </ScrollView>
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
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
