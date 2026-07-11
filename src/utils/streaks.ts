import { Habit } from '../types';
import { isDueOn, toDateKey } from './date';

/** Parses a yyyy-MM-dd key into a local midnight Date, avoiding the UTC-parsing
 * pitfall of `new Date(key)` which can shift the date in negative-offset timezones. */
function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function normalizeToLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/**
 * Number of consecutive scheduled days completed, counting backwards from
 * `today`. If today is a scheduled day that hasn't been completed yet, it's
 * excluded (still in progress) rather than breaking the streak, and counting
 * resumes from yesterday. Non-scheduled days are skipped and never break it.
 */
export function getCurrentStreak(habit: Habit, today: Date = new Date()): number {
  const completed = new Set(habit.completions);
  const createdOn = normalizeToLocalMidnight(new Date(habit.createdAt));
  let cursor = normalizeToLocalMidnight(today);

  if (isDueOn(habit.frequency, cursor) && !completed.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (cursor >= createdOn) {
    if (isDueOn(habit.frequency, cursor)) {
      if (completed.has(toDateKey(cursor))) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Longest run of consecutive scheduled days ever completed. Scans from the
 * earliest to the latest completion, skipping non-scheduled days without
 * breaking the run.
 */
export function getBestStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;

  const completed = new Set(habit.completions);
  const completionDates = habit.completions.map(parseDateKey);
  let cursor = completionDates.reduce((a, b) => (b < a ? b : a));
  const latestCompletion = completionDates.reduce((a, b) => (b > a ? b : a));

  let current = 0;
  let best = 0;
  while (cursor <= latestCompletion) {
    if (isDueOn(habit.frequency, cursor)) {
      if (completed.has(toDateKey(cursor))) {
        current += 1;
        if (current > best) best = current;
      } else {
        current = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

/**
 * Percentage (0-100) of scheduled days completed within the last `days` days,
 * counting backwards from `today` inclusive. Days the habit wasn't scheduled
 * on don't count toward the denominator.
 */
export function getCompletionRate(
  habit: Habit,
  days: number,
  today: Date = new Date()
): number {
  if (days <= 0) return 0;

  const completed = new Set(habit.completions);
  let cursor = normalizeToLocalMidnight(today);
  let scheduled = 0;
  let done = 0;

  for (let i = 0; i < days; i++) {
    if (isDueOn(habit.frequency, cursor)) {
      scheduled += 1;
      if (completed.has(toDateKey(cursor))) done += 1;
    }
    cursor = addDays(cursor, -1);
  }

  if (scheduled === 0) return 0;
  return Math.round((done / scheduled) * 100);
}
