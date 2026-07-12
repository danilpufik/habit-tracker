import * as Notifications from 'expo-notifications';
import { Habit, Weekday } from '../types';

const REMINDER_BODY = 'Time to keep your streak!';

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

function buildReminderContent(habit: Habit): Notifications.NotificationContentInput {
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
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/** Cancels every scheduled notification belonging to this habit. Never throws. */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(
      (notification) => notification.content.data?.habitId === habitId
    );
    await Promise.all(
      toCancel.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
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
    const [hourStr, minuteStr] = habit.reminderTime.split(':');
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const content = buildReminderContent(habit);

    if (habit.frequency.type === 'daily') {
      await Notifications.scheduleNotificationAsync({
        identifier: dailyIdentifier(habit.id),
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      return;
    }

    await Promise.all(
      habit.frequency.days.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          identifier: weekdayIdentifier(habit.id, weekday),
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
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
