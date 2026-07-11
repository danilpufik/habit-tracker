import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme';
import { toDateKey, todayKey } from '../utils/date';

interface MonthHeatmapProps {
  month: Date;
  getDayIntensity: (dateKey: string) => number; // 0 (none completed) to 1 (all completed)
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
}

const MONDAY_FIRST_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayCell {
  day: number;
  dateKey: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixColor(fromHex: string, toHex: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(fromHex);
  const [r2, g2, b2] = hexToRgb(toHex);
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export function MonthHeatmap({
  month,
  getDayIntensity,
  onPrevMonth,
  onNextMonth,
  canGoNext,
}: MonthHeatmapProps) {
  const theme = useTheme();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const currentDayKey = todayKey();

  const monthLabel = useMemo(
    () => month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [year, monthIndex]
  );

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = Sun
    const leadingBlanks = (firstWeekday + 6) % 7; // Monday-first offset
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days: DayCell[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, dateKey: toDateKey(new Date(year, monthIndex, day)) });
    }
    return { leadingBlanks, days };
  }, [year, monthIndex]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onPrevMonth}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.arrowButton}
        >
          <Text style={[styles.arrow, { color: theme.colors.text }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.monthLabel, { color: theme.colors.text }]}>{monthLabel}</Text>

        <TouchableOpacity
          onPress={onNextMonth}
          disabled={!canGoNext}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.arrowButton}
        >
          <Text
            style={[
              styles.arrow,
              { color: canGoNext ? theme.colors.text : theme.colors.textTertiary },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {MONDAY_FIRST_LABELS.map((label) => (
          <View key={label} style={styles.cellWrap}>
            <Text style={[styles.weekdayLabel, { color: theme.colors.textSecondary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: cells.leadingBlanks }).map((_, index) => (
          <View key={`blank-${index}`} style={styles.cellWrap} />
        ))}
        {cells.days.map(({ day, dateKey }) => {
          const intensity = getDayIntensity(dateKey);
          const isToday = dateKey === currentDayKey;
          return (
            <View key={dateKey} style={styles.cellWrap}>
              <View
                style={[
                  styles.day,
                  {
                    backgroundColor: mixColor(
                      theme.colors.surface,
                      theme.colors.primary,
                      intensity
                    ),
                    borderColor: isToday ? theme.colors.primary : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: intensity > 0.5 ? theme.colors.primaryText : theme.colors.textTertiary },
                  ]}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrowButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    flexBasis: '14.2857%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  day: {
    flex: 1,
    width: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
