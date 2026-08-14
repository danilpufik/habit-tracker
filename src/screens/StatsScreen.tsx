import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { DayDotStatus, EmptyState, HabitStatsRow } from '../components';
import { isDueOn, toDateKey } from '../utils/date';
import { getBestStreak, getCurrentStreak } from '../utils/streaks';

type Period = 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

/** Sunday-first single-letter weekday labels, indexed by `Date#getDay()`. */
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const BAR_HEIGHT = 64;

interface DayRate {
  dateKey: string;
  label: string;
  rate: number;
}

function PeriodControl({
  value,
  onChange,
  theme,
}: {
  value: Period;
  onChange: (period: Period) => void;
  theme: Theme;
}) {
  return (
    <View
      style={[
        styles.segmented,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {PERIODS.map(({ key, label }) => {
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

function WeekBarChart({ days, theme }: { days: DayRate[]; theme: Theme }) {
  return (
    <View style={styles.chartRow}>
      {days.map((day) => (
        <View key={day.dateKey} style={styles.chartColumn}>
          <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.barFill,
                {
                  height: Math.max(4, (day.rate / 100) * BAR_HEIGHT),
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.barLabel,
              { color: theme.colors.textTertiary, fontFamily: theme.typography.fontFamily.bodyMedium },
            ]}
          >
            {day.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StatCard({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <Text
        style={[
          styles.statValue,
          { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatsScreen({ navigation }: MainTabScreenProps<'Stats'>) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const todayKey = useHabitStore((state) => state.todayKey);

  // Presentational for now: switching the segment only changes which option
  // is highlighted. TODO: implement month/year aggregation -- everything
  // below stays week-based regardless of the selected period.
  const [period, setPeriod] = useState<Period>('week');

  const openAddHabit = () => navigation.navigate('AddEditHabit');
  const openHabitDetails = (habitId: string) => navigation.navigate('HabitDetails', { habitId });
  const openCalendar = () => navigation.navigate('Calendar');
  const openGoals = () => navigation.navigate('Goals');

  const bestCurrentStreak = useMemo(() => {
    const today = new Date();
    return habits.reduce((max, habit) => Math.max(max, getCurrentStreak(habit, today)), 0);
  }, [habits, todayKey]);

  const weekStats = useMemo(() => {
    const today = new Date();
    let scheduled = 0;
    let completed = 0;
    const days: DayRate[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateKey = toDateKey(date);
      let dayScheduled = 0;
      let dayCompleted = 0;

      habits.forEach((habit) => {
        if (isDueOn(habit.frequency, date)) {
          dayScheduled += 1;
          scheduled += 1;
          if (habit.completions.includes(dateKey)) {
            dayCompleted += 1;
            completed += 1;
          }
        }
      });

      days.push({
        dateKey,
        label: WEEKDAY_LETTERS[date.getDay()],
        rate: dayScheduled === 0 ? 0 : Math.round((dayCompleted / dayScheduled) * 100),
      });
    }

    return {
      days,
      completedCount: completed,
      rate: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100),
    };
  }, [habits, todayKey]);

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
  }, [habits, todayKey]);

  const bestStreaks = useMemo(
    () => [...habitStats].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 5),
    [habitStats]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
          ]}
        >
          Stats
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={openGoals} style={styles.calendarButton} hitSlop={8}>
            <Ionicons name="trophy-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openCalendar} style={styles.calendarButton} hitSlop={8}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

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
          <PeriodControl value={period} onChange={setPeriod} theme={theme} />

          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <Text
              style={[
                styles.progressLabel,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
              ]}
            >
              Overall Progress
            </Text>
            <Text
              style={[
                styles.progressValue,
                { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
              ]}
            >
              {weekStats.rate}%
            </Text>
            <WeekBarChart days={weekStats.days} theme={theme} />
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Habits Completed" value={String(weekStats.completedCount)} theme={theme} />
            <StatCard label="Current Streak" value={`${bestCurrentStreak}🔥`} theme={theme} />
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
            ]}
          >
            Best Streaks
          </Text>
          {bestStreaks.map(({ habit, currentStreak, bestStreak, last7Days }) => (
            <HabitStatsRow
              key={habit.id}
              habit={habit}
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              last7Days={last7Days}
              onPress={() => openHabitDetails(habit.id)}
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
  },
  headerActions: {
    flexDirection: 'row',
  },
  calendarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginTop: 16,
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
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginTop: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressValue: {
    fontSize: 34,
    marginTop: 4,
    marginBottom: 18,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
  },
  barTrack: {
    width: 20,
    height: BAR_HEIGHT,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
});
