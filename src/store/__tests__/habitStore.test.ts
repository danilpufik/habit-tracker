/**
 * Verifies the persisted-storage schema stays backward compatible: habits
 * written before `reminderTime` existed must rehydrate and keep working.
 */

let backingStorage: Record<string, string> = {};

const mockStorage = {
  getItem: jest.fn(async (key: string) => backingStorage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    backingStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete backingStorage[key];
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => mockStorage);

// Reminder scheduling is covered in notifications.test.ts; here we only need
// editHabit/deleteHabit to not depend on the real native module. notifications.ts
// imports each function from its own expo-notifications submodule (not the barrel)
// to avoid a module-load crash in Expo Go, so mock those exact submodule paths.
jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(async () => 'mock-id'),
}));
jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-notifications/build/getAllScheduledNotificationsAsync', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
}));
jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', expires: 'never', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', expires: 'never', canAskAgain: true })),
}));
jest.mock('expo-notifications/build/Notifications.types', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily', WEEKLY: 'weekly' },
}));
jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: jest.fn(async () => null),
}));
jest.mock('expo-notifications/build/NotificationChannelManager.types', () => ({
  AndroidImportance: { UNKNOWN: 0, UNSPECIFIED: 1, NONE: 2, MIN: 3, LOW: 4, DEFAULT: 5, HIGH: 6, MAX: 7 },
}));
jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));

async function loadStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useHabitStore } = require('../habitStore') as typeof import('../habitStore');
  for (let i = 0; i < 50; i++) {
    if (useHabitStore.getState().hasHydrated) return useHabitStore;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Store did not hydrate in time');
}

function seedLegacyStorage(habits: unknown[]) {
  backingStorage['habit-tracker-storage'] = JSON.stringify({
    state: { habits },
    version: 0,
  });
}

describe('habitStore migration safety (pre-reminderTime data)', () => {
  beforeEach(() => {
    jest.resetModules();
    backingStorage = {};
  });

  it('loads a legacy habit with no reminderTime key at all', async () => {
    seedLegacyStorage([
      {
        id: 'legacy-1',
        name: 'Drink water',
        icon: '💧',
        color: '#6C5CE7',
        frequency: { type: 'daily' },
        createdAt: '2026-01-01T00:00:00.000Z',
        completions: ['2026-01-01', '2026-01-02'],
        // deliberately no `reminderTime` field -- this is what old data looks like
      },
    ]);

    const useHabitStore = await loadStore();
    const habits = useHabitStore.getState().habits;

    expect(habits).toHaveLength(1);
    expect(habits[0]).toMatchObject({
      id: 'legacy-1',
      name: 'Drink water',
      completions: ['2026-01-01', '2026-01-02'],
    });
    expect(habits[0].reminderTime).toBeUndefined();
  });

  it('toggling completion on a legacy habit still works', async () => {
    seedLegacyStorage([
      {
        id: 'legacy-1',
        name: 'Drink water',
        icon: '💧',
        color: '#6C5CE7',
        frequency: { type: 'daily' },
        createdAt: '2026-01-01T00:00:00.000Z',
        completions: [],
      },
    ]);

    const useHabitStore = await loadStore();
    useHabitStore.getState().toggleCompletion('legacy-1', '2026-07-12');

    expect(useHabitStore.getState().habits[0].completions).toEqual(['2026-07-12']);
  });

  it('editHabit can set reminderTime on a legacy-loaded habit', async () => {
    seedLegacyStorage([
      {
        id: 'legacy-2',
        name: 'Read',
        icon: '📚',
        color: '#0984E3',
        frequency: { type: 'daily' },
        createdAt: '2026-01-01T00:00:00.000Z',
        completions: [],
      },
    ]);

    const useHabitStore = await loadStore();
    useHabitStore.getState().editHabit('legacy-2', { reminderTime: '08:00' });

    expect(useHabitStore.getState().habits[0].reminderTime).toBe('08:00');
  });

  it('addHabit still works without a reminderTime (field stays optional)', async () => {
    seedLegacyStorage([]);

    const useHabitStore = await loadStore();
    useHabitStore.getState().addHabit({
      name: 'Meditate',
      icon: '🧘',
      color: '#00B894',
      frequency: { type: 'daily' },
    });

    const habits = useHabitStore.getState().habits;
    expect(habits).toHaveLength(1);
    expect(habits[0].reminderTime).toBeUndefined();
  });
});
