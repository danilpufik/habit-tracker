import { Habit } from '../../types';
import { parseHabitsBackup } from '../backup';

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

describe('parseHabitsBackup', () => {
  it('returns the habit array for a valid export produced by JSON.stringify(habits)', () => {
    const habits = [makeHabit({ id: 'a' }), makeHabit({ id: 'b', frequency: { type: 'weekdays', days: [1, 3, 5] } })];
    expect(parseHabitsBackup(JSON.stringify(habits))).toEqual(habits);
  });

  it('returns null for malformed JSON', () => {
    expect(parseHabitsBackup('not json')).toBeNull();
  });

  it('returns null when the top level is not an array', () => {
    expect(parseHabitsBackup(JSON.stringify({ habits: [makeHabit()] }))).toBeNull();
  });

  it('returns null when an entry is missing required fields', () => {
    const bad = [{ id: 'a', name: 'Missing stuff' }];
    expect(parseHabitsBackup(JSON.stringify(bad))).toBeNull();
  });

  it('returns null when frequency has an invalid shape', () => {
    const bad = [{ ...makeHabit(), frequency: { type: 'weekdays', days: ['mon'] } }];
    expect(parseHabitsBackup(JSON.stringify(bad))).toBeNull();
  });

  it('accepts habits with optional fields present or absent', () => {
    const withOptional = makeHabit({ reminderTime: '08:00', completionTimestamps: { '2026-01-01': new Date().toISOString() } });
    expect(parseHabitsBackup(JSON.stringify([withOptional]))).toEqual([withOptional]);
  });
});
