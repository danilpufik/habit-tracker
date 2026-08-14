import { Habit } from '../types';
import { getBestStreak } from './streaks';
import { toDateKey } from './date';

function normalizeToLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/**
 * Plain count of completions across every habit within the trailing `days`-day
 * window ending at `today` (inclusive) -- unlike `getCompletionRate`, this counts
 * real completions, not adherence to `isDueOn` scheduling.
 */
export function countCompletionsInWindow(
  habits: Habit[],
  days: number,
  today: Date = new Date()
): number {
  if (days <= 0) return 0;

  let cursor = normalizeToLocalMidnight(today);
  let count = 0;

  for (let i = 0; i < days; i++) {
    const dateKey = toDateKey(cursor);
    for (const habit of habits) {
      if (habit.completions.includes(dateKey)) count += 1;
    }
    cursor = addDays(cursor, -1);
  }

  return count;
}

/** Longest streak ever achieved by any single habit. */
export function bestStreakAcrossHabits(habits: Habit[]): number {
  return Math.max(0, ...habits.map(getBestStreak));
}

/** True if any habit has ever been completed before 8 AM local time. */
export function hasEarlyBirdCompletion(habits: Habit[]): boolean {
  return habits.some((habit) =>
    Object.values(habit.completionTimestamps ?? {}).some((iso) => new Date(iso).getHours() < 8)
  );
}
