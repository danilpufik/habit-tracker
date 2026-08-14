import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme';
import { toDateKey } from '../utils/date';

interface WeekStripProps {
  /** yyyy-MM-dd key for the day to highlight as "today". */
  todayKey: string;
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Parses a yyyy-MM-dd key into a local midnight Date (avoids the UTC-parsing
 * pitfall of `new Date(key)`, which can shift the date in negative-offset zones). */
function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function mondayOf(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7; // Sun=0..Sat=6 -> Mon=0..Sun=6
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
}

function handleSelectDay(_dateKey: string): void {
  // TODO: wire up day selection (e.g. scroll TodayScreen's list to that date).
}

export function WeekStrip({ todayKey }: WeekStripProps) {
  const theme = useTheme();
  const monday = mondayOf(parseDateKey(todayKey));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
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
              {WEEKDAY_LETTERS[index]}
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
