import { Habit } from '../../types';
import { toDateKey } from '../date';
import { bestStreakAcrossHabits, countCompletionsInWindow, hasEarlyBirdCompletion } from '../goals';

/** Builds a yyyy-MM-dd key for a local calendar date (month is 1-based). */
function dk(year: number, month: number, day: number): string {
  return toDateKey(new Date(year, month - 1, day));
}

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Test Habit',
    icon: '💧',
    color: '#4f46e5',
    frequency: { type: 'daily' },
    createdAt: new Date(2026, 0, 1).toISOString(),
    completions: [],
    ...overrides,
  };
}

describe('countCompletionsInWindow', () => {
  const today = new Date(2026, 6, 11); // 2026-07-11

  it('returns 0 for an empty habit list or non-positive window', () => {
    expect(countCompletionsInWindow([], 7, today)).toBe(0);
    expect(countCompletionsInWindow([makeHabit({ completions: [dk(2026, 7, 11)] })], 0, today)).toBe(0);
  });

  it('sums completions across every habit within the trailing window, inclusive of today', () => {
    const habitA = makeHabit({ id: 'a', completions: [dk(2026, 7, 11), dk(2026, 7, 5)] });
    const habitB = makeHabit({ id: 'b', completions: [dk(2026, 7, 9)] });
    // 7-day window ending 2026-07-11 covers 2026-07-05 .. 2026-07-11 inclusive.
    expect(countCompletionsInWindow([habitA, habitB], 7, today)).toBe(3);
  });

  it('excludes completions outside the window', () => {
    const habit = makeHabit({ completions: [dk(2026, 7, 3), dk(2026, 7, 11)] });
    // 7-day window ending 2026-07-11 starts 2026-07-05, so 07-03 is excluded.
    expect(countCompletionsInWindow([habit], 7, today)).toBe(1);
  });
});

describe('bestStreakAcrossHabits', () => {
  it('returns 0 when there are no habits', () => {
    expect(bestStreakAcrossHabits([])).toBe(0);
  });

  it('returns the max best-streak across every habit', () => {
    const habitA = makeHabit({
      id: 'a',
      completions: [dk(2026, 7, 1), dk(2026, 7, 2), dk(2026, 7, 3)],
    });
    const habitB = makeHabit({ id: 'b', completions: [dk(2026, 7, 1)] });
    expect(bestStreakAcrossHabits([habitA, habitB])).toBe(3);
  });
});

describe('hasEarlyBirdCompletion', () => {
  it('returns false when no habit has any completionTimestamps', () => {
    expect(hasEarlyBirdCompletion([makeHabit()])).toBe(false);
  });

  it('returns true when any timestamp is before 8 AM local time', () => {
    const habit = makeHabit({
      completionTimestamps: { [dk(2026, 7, 11)]: new Date(2026, 6, 11, 7, 59).toISOString() },
    });
    expect(hasEarlyBirdCompletion([habit])).toBe(true);
  });

  it('returns false when the earliest timestamp is exactly 8 AM or later', () => {
    const habit = makeHabit({
      completionTimestamps: { [dk(2026, 7, 11)]: new Date(2026, 6, 11, 8, 0).toISOString() },
    });
    expect(hasEarlyBirdCompletion([habit])).toBe(false);
  });
});
