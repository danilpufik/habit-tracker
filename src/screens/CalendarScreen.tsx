import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { useHabitStore } from '../store';
import { EmptyState, HabitCard, MonthHeatmap } from '../components';
import { formatFriendlyDate, isDueOn, parseDateKey, toDateKey, todayKey } from '../utils/date';
import { triggerCompletionHaptic } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function CalendarScreen({ navigation }: Props) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const storeTodayKey = useHabitStore((state) => state.todayKey);
  const firstDayOfWeek = useHabitStore((state) => state.firstDayOfWeek);

  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => todayKey());

  const canGoNext = addMonths(selectedMonth, 1) <= startOfMonth(new Date());
  const goToPrevMonth = () => setSelectedMonth((prev) => addMonths(prev, -1));
  const goToNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));
  const openAddHabit = () => navigation.navigate('AddEditHabit');

  const monthCompletionByDay = useMemo(() => {
    const map = new Map<string, number>();
    const year = selectedMonth.getFullYear();
    const monthIndex = selectedMonth.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dateKey = toDateKey(date);
      const dueHabits = habits.filter((habit) => isDueOn(habit.frequency, date));
      if (dueHabits.length === 0) {
        map.set(dateKey, 0);
        continue;
      }
      const completedCount = dueHabits.filter((habit) => habit.completions.includes(dateKey)).length;
      map.set(dateKey, completedCount / dueHabits.length);
    }
    return map;
  }, [habits, selectedMonth]);

  const getDayIntensity = useCallback(
    (dateKey: string) => monthCompletionByDay.get(dateKey) ?? 0,
    [monthCompletionByDay]
  );

  const selectedDate = useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey]);
  const dayHabits = useMemo(
    () => habits.filter((habit) => isDueOn(habit.frequency, selectedDate)),
    [habits, selectedDate]
  );
  const isFutureSelected = selectedDateKey > storeTodayKey;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {habits.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No habits yet"
          subtitle="Add your first habit to start tracking your calendar."
          actionLabel="Add a habit"
          onAction={openAddHabit}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <MonthHeatmap
            month={selectedMonth}
            getDayIntensity={getDayIntensity}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            canGoNext={canGoNext}
            selectedDateKey={selectedDateKey}
            onDayPress={setSelectedDateKey}
            firstDayOfWeek={firstDayOfWeek}
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
            ]}
          >
            {formatFriendlyDate(selectedDate)}
          </Text>

          {isFutureSelected ? (
            <Text
              style={[
                styles.note,
                { color: theme.colors.textTertiary, fontFamily: theme.typography.fontFamily.body },
              ]}
            >
              This day hasn't happened yet.
            </Text>
          ) : null}

          {dayHabits.length === 0 ? (
            <Text
              style={[
                styles.note,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
              ]}
            >
              No habits scheduled for this day.
            </Text>
          ) : (
            dayHabits.map((habit) => {
              const completed = habit.completions.includes(selectedDateKey);
              const card = (
                <HabitCard
                  habit={habit}
                  completed={completed}
                  onToggle={() => {
                    triggerCompletionHaptic(!completed);
                    toggleCompletion(habit.id, selectedDateKey);
                  }}
                  onPress={() => navigation.navigate('HabitDetails', { habitId: habit.id })}
                />
              );
              return isFutureSelected ? (
                <View key={habit.id} pointerEvents="none" style={styles.futureCard}>
                  {card}
                </View>
              ) : (
                <View key={habit.id}>{card}</View>
              );
            })
          )}
        </ScrollView>
      )}
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
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    marginBottom: 12,
  },
  futureCard: {
    opacity: 0.5,
  },
});
