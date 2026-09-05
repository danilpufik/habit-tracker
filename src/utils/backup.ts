import { Frequency, Habit } from '../types';

function isValidFrequency(value: unknown): value is Frequency {
  if (typeof value !== 'object' || value === null) return false;
  const frequency = value as { type?: unknown; days?: unknown };
  if (frequency.type === 'daily') return true;
  if (frequency.type === 'weekdays') {
    return (
      Array.isArray(frequency.days) &&
      frequency.days.every((day) => typeof day === 'number' && day >= 0 && day <= 6)
    );
  }
  return false;
}

function isValidHabit(value: unknown): value is Habit {
  if (typeof value !== 'object' || value === null) return false;
  const habit = value as Record<string, unknown>;
  return (
    typeof habit.id === 'string' &&
    typeof habit.name === 'string' &&
    typeof habit.icon === 'string' &&
    typeof habit.color === 'string' &&
    typeof habit.createdAt === 'string' &&
    Array.isArray(habit.completions) &&
    habit.completions.every((c) => typeof c === 'string') &&
    isValidFrequency(habit.frequency) &&
    (habit.reminderTime === undefined || typeof habit.reminderTime === 'string')
  );
}

/**
 * Parses and validates a JSON backup string produced by Settings' Export/Backup
 * feature (a plain `Habit[]`). Returns the habit array on success, or null if
 * the JSON is malformed or any entry doesn't match the Habit shape.
 */
export function parseHabitsBackup(json: string): Habit[] | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || !data.every(isValidHabit)) return null;
  return data;
}
