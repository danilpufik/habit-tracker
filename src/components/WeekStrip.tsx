import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme';
import { toDateKey } from '../utils/date';

interface WeekStripProps {
  /** yyyy-MM-dd key for the day to highlight as "today". */
  todayKey: string;
  /** Which weekday starts the strip. Defaults to 'monday' (this component's original behavior). */
  firstDayOfWeek?: 'sunday' | 'monday';
}

const MONDAY_FIRST_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SUNDAY_FIRST_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Parses a yyyy-MM-dd key into a local midnight Date (avoids the UTC-parsing
 * pitfall of `new Date(key)`, which can shift the date in negative-offset zones). */
function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date, firstDayOfWeek: 'sunday' | 'monday'): Date {
  const day = date.getDay(); // 0 = Sun .. 6 = Sat
  const offset = firstDayOfWeek === 'sunday' ? day : (day + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
}

function handleSelectDay(_dateKey: string): void {
  // TODO: wire up day selection (e.g. scroll TodayScreen's list to that date).
}

export function WeekStrip({ todayKey, firstDayOfWeek = 'monday' }: WeekStripProps) {
  const theme = useTheme();
  const weekdayLetters = firstDayOfWeek === 'sunday' ? SUNDAY_FIRST_LETTERS : MONDAY_FIRST_LETTERS;
  const weekStart = startOfWeek(parseDateKey(todayKey), firstDayOfWeek);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    return { date, dateKey: toDateKey(date) };
  });

  return (
    <View style={styles.row}>
      {days.map(({ date, dateKey }, index) => {
        const isToday = dateKey === todayKey;
        return (
          <TouchableOpacity
            key={dateKey}
            onPress={() => handleSelectDay(dateKey)}
            activeOpacity={0.7}
            style={styles.column}
          >
            <Text
              style={[
                styles.letter,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
              ]}
            >
              {weekdayLetters[index]}
            </Text>
            <View
              style={[
                styles.numberWrap,
                isToday && { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.number,
                  {
                    color: isToday ? theme.colors.primaryText : theme.colors.text,
                    fontFamily: theme.typography.fontFamily.bodySemiBold,
                  },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  column: {
    alignItems: 'center',
  },
  letter: {
    fontSize: 12,
    marginBottom: 6,
  },
  numberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 14,
  },
});
