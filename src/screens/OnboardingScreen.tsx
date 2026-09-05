import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useHabitStore } from '../store';
import { AppMark, ProgressRing } from '../components';
import { isDueToday } from '../utils/date';

// Rendered directly by App.tsx's Root() while `hasOnboarded` is false -- not
// part of RootNavigator/MainTabs, so it takes no navigation props.
export function OnboardingScreen() {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const dateKey = useHabitStore((state) => state.todayKey);
  const completeOnboarding = useHabitStore((state) => state.completeOnboarding);

  // Same todaysHabits/completedCount computation as TodayScreen, reused verbatim.
  const todaysHabits = useMemo(
    () => habits.filter((habit) => isDueToday(habit.frequency)),
    [habits, dateKey]
  );
  const completedCount = useMemo(
    () => todaysHabits.filter((habit) => habit.completions.includes(dateKey)).length,
    [todaysHabits, dateKey]
  );
  const progress = todaysHabits.length > 0 ? completedCount / todaysHabits.length : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <AppMark size={72} />
        </View>
        <Text
          style={[
            styles.appName,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
          ]}
        >
          HabitTracker
        </Text>
        <Text
          style={[
            styles.tagline,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
          ]}
        >
          Build better habits, one day at a time.
        </Text>

        <View style={styles.ringWrap}>
          {habits.length === 0 ? (
            <Text
              style={[
                styles.prompt,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
              ]}
            >
              Add your first habit to get started
            </Text>
          ) : (
            <ProgressRing
              progress={progress}
              label={`${completedCount}/${todaysHabits.length}`}
              sublabel="completed"
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={completeOnboarding}
        activeOpacity={0.8}
        style={[styles.button, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: theme.colors.primaryText, fontFamily: theme.typography.fontFamily.bodyBold },
          ]}
        >
          View My Habits
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mark: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
  },
  tagline: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  ringWrap: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 32,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
  },
});
