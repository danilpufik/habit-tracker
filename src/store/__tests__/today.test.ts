/**
 * Verifies the store's single-source-of-truth "today" recomputation: a habit
 * list left open across midnight must be able to pick up the new day once
 * `refreshToday` runs (wired to an AppState listener in the app itself).
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

describe('todayKey / refreshToday', () => {
  beforeEach(() => {
    jest.resetModules();
    // Fake only the clock (Date), not setTimeout -- the store's hydration
    // polling loop below needs real timers to actually fire.
    jest.useFakeTimers({
      doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'nextTick', 'setImmediate'],
    });
    backingStorage = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes todayKey from the current date at store creation', async () => {
    jest.setSystemTime(new Date(2026, 6, 26, 23, 59));
    const useHabitStore = await loadStore();

    expect(useHabitStore.getState().todayKey).toBe('2026-07-26');
  });

  it('updates todayKey once the day has actually rolled over', async () => {
    jest.setSystemTime(new Date(2026, 6, 26, 23, 59));
    const useHabitStore = await loadStore();

    jest.setSystemTime(new Date(2026, 6, 27, 0, 1));
    useHabitStore.getState().refreshToday();

    expect(useHabitStore.getState().todayKey).toBe('2026-07-27');
  });

  it('is a no-op (same state reference) when the day has not changed', async () => {
    jest.setSystemTime(new Date(2026, 6, 26, 10, 0));
    const useHabitStore = await loadStore();
    const stateBefore = useHabitStore.getState();

    jest.setSystemTime(new Date(2026, 6, 26, 22, 0));
    useHabitStore.getState().refreshToday();

    expect(useHabitStore.getState()).toBe(stateBefore);
  });
});
