import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { EmptyState, MonthHeatmap } from '../components';
import { frequencyLabel, toDateKey } from '../utils/date';
import { getBestStreak, getCompletionRate, getCurrentStreak } from '../utils/streaks';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetails'>;

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

export function HabitDetailsScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { habitId } = route.params;
  const habit = useHabitStore((state) => state.habits.find((h) => h.id === habitId));

  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const canGoNext = addMonths(selectedMonth, 1) <= startOfMonth(new Date());

  useLayoutEffect(() => {
    navigation.setOptions({ title: habit?.name ?? 'Habit' });
  }, [navigation, habit?.name]);

  const stats = useMemo(() => {
    if (!habit) return null;
    return {
      currentStreak: getCurrentStreak(habit),
      bestStreak: getBestStreak(habit),
      totalCompletions: habit.completions.length,
      completionRate30: getCompletionRate(habit, 30),
    };
  }, [habit]);

  const dayIntensities = useMemo(() => {
    const map = new Map<string, number>();
    if (!habit) return map;

    const completed = new Set(habit.completions);
    const year = selectedMonth.getFullYear();
    const monthIndex = selectedMonth.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(new Date(year, monthIndex, day));
      map.set(dateKey, completed.has(dateKey) ? 1 : 0);
    }
    return map;
  }, [habit, selectedMonth]);

  const getDayIntensity = useCallback(
    (dateKey: string) => dayIntensities.get(dateKey) ?? 0,
    [dayIntensities]
  );

  if (!habit || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState icon="🔍" title="Habit not found" subtitle="It may have been deleted." />
      </View>
    );
  }

  const goToPrevMonth = () => setSelectedMonth((prev) => addMonths(prev, -1));
  const goToNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));
  const openEdit = () => navigation.navigate('AddEditHabit', { habitId: habit.id });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${habit.color}22` }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{habit.name}</Text>
          <View style={[styles.frequencyPill, { backgroundColor: `${habit.color}22` }]}>
            <Text style={[styles.frequencyText, { color: habit.color }]}>
              {frequencyLabel(habit.frequency)}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Current streak" value={`${stats.currentStreak}🔥`} theme={theme} />
          <StatCard label="Best streak" value={`${stats.bestStreak}🔥`} theme={theme} />
          <StatCard label="Total completions" value={String(stats.totalCompletions)} theme={theme} />
          <StatCard label="Last 30 days" value={`${stats.completionRate30}%`} theme={theme} />
        </View>

        <View style={styles.heatmapWrap}>
          <MonthHeatmap
            month={selectedMonth}
            getDayIntensity={getDayIntensity}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            canGoNext={canGoNext}
          />
        </View>

        <TouchableOpacity
          onPress={openEdit}
          activeOpacity={0.8}
          style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.editButtonText, { color: theme.colors.primaryText }]}>
            Edit habit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 34,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  frequencyPill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
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
  heatmapWrap: {
    marginBottom: 24,
  },
  editButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
