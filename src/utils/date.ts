import { Frequency, Weekday } from '../types';

/** Returns a local yyyy-MM-dd key for the given date (defaults to now). */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function weekdayOf(date: Date): Weekday {
  return date.getDay() as Weekday;
}

export function isDueOn(frequency: Frequency, date: Date): boolean {
  if (frequency.type === 'daily') return true;
  return frequency.days.includes(weekdayOf(date));
}

export function isDueToday(frequency: Frequency): boolean {
  return isDueOn(frequency, new Date());
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekdayLabel(day: Weekday): string {
  return WEEKDAY_LABELS[day];
}

export function formatFriendlyDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const ORDERED_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function frequencyLabel(frequency: Frequency): string {
  if (frequency.type === 'daily') return 'Every day';
  if (frequency.days.length === 0) return 'No days selected';
  if (frequency.days.length === 7) return 'Every day';
  return ORDERED_WEEKDAYS.filter((day) => frequency.days.includes(day))
    .map(weekdayLabel)
    .join(', ');
}
