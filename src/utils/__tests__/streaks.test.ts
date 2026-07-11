import { Frequency, Habit } from '../../types';
import { toDateKey } from '../date';
import { getBestStreak, getCompletionRate, getCurrentStreak } from '../streaks';

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

const MON_WED_FRI: Frequency = { type: 'weekdays', days: [1, 3, 5] };

describe('empty completions', () => {
  it('returns 0 for every metric when nothing has been completed', () => {
    const habit = makeHabit();
    const today = new Date(2026, 6, 11);
    expect(getCurrentStreak(habit, today)).toBe(0);
    expect(getBestStreak(habit)).toBe(0);
    expect(getCompletionRate(habit, 7, today)).toBe(0);
  });
});

describe('getCurrentStreak', () => {
  it('counts a single completion today as a streak of 1', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({ completions: [dk(2026, 7, 11)] });
    expect(getCurrentStreak(habit, today)).toBe(1);
  });

  it('counts a single completion from yesterday when today is not done yet', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({ completions: [dk(2026, 7, 10)] });
    expect(getCurrentStreak(habit, today)).toBe(1);
  });

  it('returns 0 when the most recent completion is more than a day old', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({ completions: [dk(2026, 7, 9)] });
    expect(getCurrentStreak(habit, today)).toBe(0);
  });

  it('counts a run of consecutive daily completions ending today', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      completions: [
        dk(2026, 7, 7),
        dk(2026, 7, 8),
        dk(2026, 7, 9),
        dk(2026, 7, 10),
        dk(2026, 7, 11),
      ],
    });
    expect(getCurrentStreak(habit, today)).toBe(5);
  });

  it('stops counting at a broken streak and ignores older runs', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      // gap on 2026-07-09 breaks the streak; the 07-03/07-04 run doesn't count
      completions: [dk(2026, 7, 3), dk(2026, 7, 4), dk(2026, 7, 10), dk(2026, 7, 11)],
    });
    expect(getCurrentStreak(habit, today)).toBe(2);
  });

  it('keeps a Mon/Wed/Fri streak alive across the weekend', () => {
    // 2026-07-06 Mon, 07-08 Wed, 07-10 Fri, 07-13 Mon
    const today = new Date(2026, 6, 13);
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: [dk(2026, 7, 6), dk(2026, 7, 8), dk(2026, 7, 10), dk(2026, 7, 13)],
    });
    expect(getCurrentStreak(habit, today)).toBe(4);
  });

  it('does not break the streak when today is scheduled but not completed yet', () => {
    const today = new Date(2026, 6, 13); // Monday, due, not completed
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: [dk(2026, 7, 8), dk(2026, 7, 10)], // Wed, Fri
    });
    expect(getCurrentStreak(habit, today)).toBe(2);
  });

  it('breaks the streak when a scheduled day is missed', () => {
    const today = new Date(2026, 6, 13); // Monday
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      // Wed 07-08 missing breaks the run before Fri/Mon
      completions: [dk(2026, 7, 6), dk(2026, 7, 10), dk(2026, 7, 13)],
    });
    expect(getCurrentStreak(habit, today)).toBe(2);
  });

  it('does not extend the streak past the habit creation date', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      createdAt: new Date(2026, 6, 10).toISOString(),
      completions: [dk(2026, 7, 9), dk(2026, 7, 10), dk(2026, 7, 11)],
    });
    expect(getCurrentStreak(habit, today)).toBe(2);
  });

  it('terminates instead of looping forever for a weekday habit with no scheduled days', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      frequency: { type: 'weekdays', days: [] },
      createdAt: new Date(2026, 5, 1).toISOString(),
      completions: [],
    });
    expect(getCurrentStreak(habit, today)).toBe(0);
  });
});

describe('getBestStreak', () => {
  it('returns 0 when there are no completions', () => {
    expect(getBestStreak(makeHabit())).toBe(0);
  });

  it('returns 1 for a single completion', () => {
    const habit = makeHabit({ completions: [dk(2026, 7, 10)] });
    expect(getBestStreak(habit)).toBe(1);
  });

  it('finds the longest of several runs, not just the most recent one', () => {
    const habit = makeHabit({
      completions: [
        dk(2026, 7, 1),
        dk(2026, 7, 2),
        dk(2026, 7, 3), // run of 3
        dk(2026, 7, 6), // isolated day
        dk(2026, 7, 9),
        dk(2026, 7, 10), // run of 2
      ],
    });
    expect(getBestStreak(habit)).toBe(3);
  });

  it('keeps a Mon/Wed/Fri streak alive across weekends', () => {
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: [dk(2026, 7, 6), dk(2026, 7, 8), dk(2026, 7, 10), dk(2026, 7, 13)],
    });
    expect(getBestStreak(habit)).toBe(4);
  });
});

describe('getCompletionRate', () => {
  it('returns 0 for a 0 or negative day window', () => {
    const habit = makeHabit({ completions: [dk(2026, 7, 11)] });
    const today = new Date(2026, 6, 11);
    expect(getCompletionRate(habit, 0, today)).toBe(0);
    expect(getCompletionRate(habit, -3, today)).toBe(0);
  });

  it('computes the percentage of scheduled days completed for a daily habit', () => {
    const today = new Date(2026, 6, 11);
    // completed 3 of the last 5 days
    const habit = makeHabit({
      completions: [dk(2026, 7, 7), dk(2026, 7, 9), dk(2026, 7, 11)],
    });
    expect(getCompletionRate(habit, 5, today)).toBe(60);
  });

  it('only counts scheduled days for the denominator on weekday habits', () => {
    const today = new Date(2026, 6, 13); // Monday
    // window: Tue 07 - Mon 13 (7 days); scheduled Mon/Wed/Fri -> 07-08, 07-10, 07-13
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: [dk(2026, 7, 8), dk(2026, 7, 13)],
    });
    expect(getCompletionRate(habit, 7, today)).toBe(67);
  });

  it('returns 0 when nothing is scheduled in the window', () => {
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({ frequency: { type: 'weekdays', days: [] } });
    expect(getCompletionRate(habit, 7, today)).toBe(0);
  });
});

describe('timezone-safe date handling', () => {
  const originalTZ = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTZ;
  });

  it('does not shift completion dates by a day in a behind-UTC timezone', () => {
    process.env.TZ = 'America/Los_Angeles';
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      completions: [dk(2026, 7, 9), dk(2026, 7, 10), dk(2026, 7, 11)],
    });
    expect(getCurrentStreak(habit, today)).toBe(3);
    expect(getBestStreak(habit)).toBe(3);
  });

  it('does not shift completion dates by a day in an ahead-of-UTC timezone', () => {
    process.env.TZ = 'Pacific/Auckland';
    const today = new Date(2026, 6, 11);
    const habit = makeHabit({
      completions: [dk(2026, 7, 9), dk(2026, 7, 10), dk(2026, 7, 11)],
    });
    expect(getCurrentStreak(habit, today)).toBe(3);
    expect(getBestStreak(habit)).toBe(3);
  });
});
