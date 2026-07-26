import { Frequency, Habit } from '../../types';

interface MockScheduledNotification {
  identifier: string;
  content: { data?: Record<string, unknown> };
  trigger: unknown;
}

const mockAndroidImportance = {
  UNKNOWN: 0,
  UNSPECIFIED: 1,
  NONE: 2,
  MIN: 3,
  LOW: 4,
  DEFAULT: 5,
  HIGH: 6,
  MAX: 7,
};

let mockScheduled: MockScheduledNotification[] = [];
let mockPermissionGranted = true;
let mockChannels: Array<{ channelId: string; config: unknown }> = [];

const mockGetPermissionsAsync = jest.fn(async () => ({
  status: mockPermissionGranted ? 'granted' : 'denied',
  granted: mockPermissionGranted,
  expires: 'never' as const,
  canAskAgain: true,
}));

const mockRequestPermissionsAsync = jest.fn(async () => ({
  status: mockPermissionGranted ? 'granted' : 'denied',
  granted: mockPermissionGranted,
  expires: 'never' as const,
  canAskAgain: true,
}));

const mockScheduleNotificationAsync = jest.fn(
  async (request: { identifier?: string; content: { data?: Record<string, unknown> }; trigger: unknown }) => {
    if (!mockPermissionGranted) {
      throw new Error('Notifications permission not granted');
    }
    const identifier = request.identifier ?? `auto-${mockScheduled.length}`;
    mockScheduled = mockScheduled.filter((n) => n.identifier !== identifier);
    mockScheduled.push({ identifier, content: request.content, trigger: request.trigger });
    return identifier;
  }
);

const mockCancelScheduledNotificationAsync = jest.fn(async (identifier: string) => {
  mockScheduled = mockScheduled.filter((n) => n.identifier !== identifier);
});

const mockGetAllScheduledNotificationsAsync = jest.fn(async () => mockScheduled);

const mockSetNotificationChannelAsync = jest.fn(async (channelId: string, config: unknown) => {
  mockChannels.push({ channelId, config });
  return { id: channelId, ...(config as object) };
});

const mockSetNotificationHandler = jest.fn();

// notifications.ts imports each function from its own expo-notifications submodule
// (not the `expo-notifications` barrel) to avoid a module-load crash in Expo Go —
// see the comment at the top of notifications.ts. Mock those exact submodule paths.
jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: (request: Parameters<typeof mockScheduleNotificationAsync>[0]) =>
    mockScheduleNotificationAsync(request),
}));
jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: (identifier: string) =>
    mockCancelScheduledNotificationAsync(identifier),
}));
jest.mock('expo-notifications/build/getAllScheduledNotificationsAsync', () => ({
  getAllScheduledNotificationsAsync: () => mockGetAllScheduledNotificationsAsync(),
}));
jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: () => mockGetPermissionsAsync(),
  requestPermissionsAsync: () => mockRequestPermissionsAsync(),
}));
jest.mock('expo-notifications/build/Notifications.types', () => ({
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
  },
}));
jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: (channelId: string, config: unknown) =>
    mockSetNotificationChannelAsync(channelId, config),
}));
// NOTE: this factory must NOT reference the outer `mockAndroidImportance` by
// value here -- `import {...} from '../notifications'` below is hoisted (ES
// import semantics) above this file's plain `const` declarations, so the
// factory would run before `mockAndroidImportance` gets assigned and see
// `undefined`. Inline the literal instead (mirrors SchedulableTriggerInputTypes
// above); `mockAndroidImportance` is only used later, in test assertions.
jest.mock('expo-notifications/build/NotificationChannelManager.types', () => ({
  AndroidImportance: {
    UNKNOWN: 0,
    UNSPECIFIED: 1,
    NONE: 2,
    MIN: 3,
    LOW: 4,
    DEFAULT: 5,
    HIGH: 6,
    MAX: 7,
  },
}));
jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: (handler: unknown) => mockSetNotificationHandler(handler),
}));

import {
  cancelHabitReminder,
  configureNotificationHandler,
  requestNotificationPermissions,
  syncHabitReminder,
} from '../notifications';

const MON_WED_FRI: Frequency = { type: 'weekdays', days: [1, 3, 5] };

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Drink water',
    icon: '💧',
    color: '#6C5CE7',
    frequency: { type: 'daily' },
    createdAt: new Date(2026, 0, 1).toISOString(),
    completions: [],
    ...overrides,
  };
}

beforeEach(() => {
  mockScheduled = [];
  mockPermissionGranted = true;
  mockChannels = [];
  jest.clearAllMocks();
});

describe('syncHabitReminder', () => {
  it('schedules a daily trigger at the right hour/minute for a daily habit', async () => {
    const habit = makeHabit({ reminderTime: '08:30' });
    await syncHabitReminder(habit);

    expect(mockScheduled).toHaveLength(1);
    expect(mockScheduled[0]).toMatchObject({
      identifier: 'habit-h1-daily',
      trigger: { type: 'daily', hour: 8, minute: 30, channelId: 'habit-reminders' },
    });
    expect(mockScheduled[0].content.data).toEqual({ habitId: 'h1' });
  });

  it('schedules exactly one notification per scheduled weekday, none for others', async () => {
    const habit = makeHabit({ frequency: MON_WED_FRI, reminderTime: '07:00' });
    await syncHabitReminder(habit);

    expect(mockScheduled).toHaveLength(3);
    // Expo's WEEKLY trigger is 1-7 with Sunday=1; ours is 0-6 with Sunday=0.
    // Mon=1->2, Wed=3->4, Fri=5->6.
    const weekdays = mockScheduled
      .map((n) => (n.trigger as { weekday: number }).weekday)
      .sort((a, b) => a - b);
    expect(weekdays).toEqual([2, 4, 6]);

    mockScheduled.forEach((n) => {
      expect(n.trigger).toMatchObject({
        type: 'weekly',
        hour: 7,
        minute: 0,
        channelId: 'habit-reminders',
      });
      expect(n.identifier).toMatch(/^habit-h1-weekday-/);
      expect(n.content.data).toEqual({ habitId: 'h1' });
    });
  });

  it('cancels previous notifications before rescheduling on re-sync (no duplicates)', async () => {
    const habit = makeHabit({ frequency: MON_WED_FRI, reminderTime: '07:00' });
    await syncHabitReminder(habit);
    expect(mockScheduled).toHaveLength(3);

    const edited: Habit = {
      ...habit,
      frequency: { type: 'weekdays', days: [1] },
      reminderTime: '09:00',
    };
    await syncHabitReminder(edited);

    expect(mockScheduled).toHaveLength(1);
    expect(mockScheduled[0]).toMatchObject({
      trigger: { type: 'weekly', hour: 9, minute: 0, weekday: 2 },
    });
  });

  it('cancels and schedules nothing when reminderTime is unset', async () => {
    const habit = makeHabit({ reminderTime: '08:00' });
    await syncHabitReminder(habit);
    expect(mockScheduled).toHaveLength(1);

    const cleared: Habit = { ...habit, reminderTime: undefined };
    await syncHabitReminder(cleared);

    expect(mockScheduled).toHaveLength(0);
  });

  it('does not throw when permission is denied, and the module keeps working afterward', async () => {
    mockPermissionGranted = false;
    const deniedHabit = makeHabit({ id: 'h1', reminderTime: '08:00' });

    await expect(syncHabitReminder(deniedHabit)).resolves.toBeUndefined();
    expect(mockScheduled).toHaveLength(0);

    mockPermissionGranted = true;
    const otherHabit = makeHabit({ id: 'h2', reminderTime: '09:00' });
    await syncHabitReminder(otherHabit);

    expect(mockScheduled).toHaveLength(1);
    expect(mockScheduled[0].identifier).toBe('habit-h2-daily');
  });
});

describe('cancelHabitReminder', () => {
  it('only cancels notifications belonging to that habit id, not other habits', async () => {
    const habitA = makeHabit({ id: 'h1', reminderTime: '08:00' });
    const habitB = makeHabit({ id: 'h2', reminderTime: '09:00' });
    await syncHabitReminder(habitA);
    await syncHabitReminder(habitB);
    expect(mockScheduled).toHaveLength(2);

    await cancelHabitReminder('h1');

    expect(mockScheduled).toHaveLength(1);
    expect(mockScheduled[0].content.data).toEqual({ habitId: 'h2' });
  });

  it('does not cancel a habit whose id is a string-prefix of another habit id', async () => {
    const habitA = makeHabit({ id: 'h1', reminderTime: '08:00' });
    const habitB = makeHabit({ id: 'h1-extra', reminderTime: '09:00' });
    await syncHabitReminder(habitA);
    await syncHabitReminder(habitB);

    await cancelHabitReminder('h1');

    expect(mockScheduled).toHaveLength(1);
    expect(mockScheduled[0].content.data).toEqual({ habitId: 'h1-extra' });
  });

  it('never throws even if the underlying call rejects', async () => {
    mockGetAllScheduledNotificationsAsync.mockRejectedValueOnce(new Error('boom'));
    await expect(cancelHabitReminder('h1')).resolves.toBeUndefined();
  });
});

describe('requestNotificationPermissions', () => {
  it('returns true without re-prompting if permission is already granted', async () => {
    mockPermissionGranted = true;
    const granted = await requestNotificationPermissions();

    expect(granted).toBe(true);
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockGetPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('requests permission when not already granted, and handles denial gracefully', async () => {
    mockPermissionGranted = false;
    const granted = await requestNotificationPermissions();

    expect(granted).toBe(false);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('reminder notification channel', () => {
  it('creates the Android channel with HIGH importance and sound before the first schedule', async () => {
    // Channel creation is memoized per module instance, so use a fresh one here
    // rather than relying on test execution order against the top-level import.
    jest.resetModules();
    const fresh = require('../notifications') as typeof import('../notifications');

    await fresh.syncHabitReminder(makeHabit({ reminderTime: '08:00' }));

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith('habit-reminders', {
      name: 'Habit reminders',
      importance: mockAndroidImportance.HIGH,
      sound: 'default',
    });
    expect(mockChannels).toHaveLength(1);
  });

  it('reuses the same channel instead of recreating it on every sync', async () => {
    jest.resetModules();
    const fresh = require('../notifications') as typeof import('../notifications');

    await fresh.syncHabitReminder(makeHabit({ id: 'h1', reminderTime: '08:00' }));
    await fresh.syncHabitReminder(makeHabit({ id: 'h2', reminderTime: '09:00' }));

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledTimes(1);
  });
});

describe('configureNotificationHandler', () => {
  it('registers a handler that shows banner, list, and sound in the foreground', async () => {
    configureNotificationHandler();

    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    const handler = mockSetNotificationHandler.mock.calls[0][0] as {
      handleNotification: () => Promise<Record<string, boolean>>;
    };
    await expect(handler.handleNotification()).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});
