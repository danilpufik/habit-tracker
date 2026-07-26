// Deliberately NOT `import * as Notifications from 'expo-notifications'`.
// That barrel re-exports getExpoPushTokenAsync/TokenEmitter, which registers a
// push-token listener as a MODULE-LOAD side effect (DevicePushTokenAutoRegistration.fx.ts).
// That listener throws on Android in Expo Go (push was removed from Expo Go in SDK 53),
// crashing the app before any of our code even runs -- even though we never use push.
// Importing each function from its own submodule avoids pulling in that file at all.
// Local scheduling (what we use here) is unaffected and fully supported in Expo Go.
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import type { NotificationContentInput } from 'expo-notifications/build/Notifications.types';
// Resolves to setNotificationChannelAsync.android.js on Android (real native call) and the
// no-op setNotificationChannelAsync.js stub everywhere else -- same platform-suffix resolution
// Metro would use via the barrel, just without pulling the barrel in.
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { Habit, Weekday } from '../types';

const REMINDER_BODY = 'Time to keep your streak!';

// app.json's expo-notifications plugin `defaultChannel` option only sets the channel used for
// FCM/remote push -- it has no effect on locally scheduled notifications. Android silently
// downgrades notifications posted without a real, explicitly-created channel (shows as "Silent",
// collapsed content), so we create our own channel with HIGH importance and reference it below.
const REMINDER_CHANNEL_ID = 'habit-reminders';

let reminderChannelReady: Promise<void> | null = null;

/** Creates (or updates) the Android notification channel used for habit reminders. Never throws. */
function ensureReminderChannelAsync(): Promise<void> {
  if (!reminderChannelReady) {
    reminderChannelReady = setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Habit reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    })
      .then(() => undefined)
      .catch(() => undefined);
  }
  return reminderChannelReady;
}

/**
 * Registers the foreground notification handler. Without this, Expo's default behavior is to
 * NOT show a notification at all while the app is open (does not affect background/closed
 * delivery, which is handled entirely natively). Call once at app startup.
 */
export function configureNotificationHandler(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function dailyIdentifier(habitId: string): string {
  return `habit-${habitId}-daily`;
}

function weekdayIdentifier(habitId: string, weekday: Weekday): string {
  return `habit-${habitId}-weekday-${weekday}`;
}

/** Expo's WEEKLY trigger numbers weekdays 1-7 starting Sunday=1; ours is 0-6 starting Sunday=0. */
function toExpoWeekday(weekday: Weekday): number {
  return weekday + 1;
}

function buildReminderContent(habit: Habit): NotificationContentInput {
  return {
    title: `${habit.icon} ${habit.name}`,
    body: REMINDER_BODY,
    data: { habitId: habit.id },
  };
}

/**
 * Requests notification permission if not already determined. Never throws —
 * any failure (including the user denying) resolves to `false`.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const existing = await getPermissionsAsync();
    if (existing.granted) return true;

    const requested = await requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/** Reads the current permission status without prompting. Never throws. */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const { status } = await getPermissionsAsync();
    return status;
  } catch {
    return 'undetermined';
  }
}

/** Cancels every scheduled notification belonging to this habit. Never throws. */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  try {
    const scheduled = await getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(
      (notification) => notification.content.data?.habitId === habitId
    );
    await Promise.all(
      toCancel.map((notification) => cancelScheduledNotificationAsync(notification.identifier))
    );
  } catch {
    // Best-effort: scheduling failures must never break habit CRUD.
  }
}

/**
 * Re-syncs the repeating reminder(s) for a habit: cancels whatever was
 * previously scheduled, then — if `reminderTime` is set — schedules a daily
 * trigger (daily habits) or one weekly trigger per scheduled weekday
 * (weekday habits). Never throws, including when permissions are denied.
 */
export async function syncHabitReminder(habit: Habit): Promise<void> {
  await cancelHabitReminder(habit.id);

  if (!habit.reminderTime) return;

  try {
    await ensureReminderChannelAsync();

    const [hourStr, minuteStr] = habit.reminderTime.split(':');
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const content = buildReminderContent(habit);

    if (habit.frequency.type === 'daily') {
      await scheduleNotificationAsync({
        identifier: dailyIdentifier(habit.id),
        content,
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          channelId: REMINDER_CHANNEL_ID,
          hour,
          minute,
        },
      });
      return;
    }

    await Promise.all(
      habit.frequency.days.map((weekday) =>
        scheduleNotificationAsync({
          identifier: weekdayIdentifier(habit.id, weekday),
          content,
          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            channelId: REMINDER_CHANNEL_ID,
            weekday: toExpoWeekday(weekday),
            hour,
            minute,
          },
        })
      )
    );
  } catch {
    // Best-effort: scheduling failures must never break habit CRUD.
  }
}
