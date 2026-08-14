import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { GoalPeriod } from '../types';
import { bestStreakAcrossHabits, countCompletionsInWindow, hasEarlyBirdCompletion } from '../utils/goals';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

const GOAL_WINDOWS: Record<GoalPeriod, number> = { weekly: 7, monthly: 30, yearly: 365 };
const GOAL_LABELS: Record<GoalPeriod, string> = {
  weekly: 'Weekly Goal',
  monthly: 'Monthly Goal',
  yearly: 'Yearly Goal',
};
const GOAL_ORDER: GoalPeriod[] = ['weekly', 'monthly', 'yearly'];

function GoalCard({
  theme,
  label,
  current,
  target,
  editing,
  onPress,
  inputValue,
  onChangeInput,
  onSave,
}: {
  theme: Theme;
  label: string;
  current: number;
  target: number;
  editing: boolean;
  onPress: () => void;
  inputValue: string;
  onChangeInput: (value: string) => void;
  onSave: () => void;
}) {
  const progress = target > 0 ? Math.min(1, current / target) : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.goalHeaderRow}>
          <Text
            style={[
              styles.goalLabel,
              { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.goalValue,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyMedium },
            ]}
          >
            {current}/{target}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.fill,
              { width: `${progress * 100}%`, backgroundColor: theme.colors.primary },
            ]}
          />
        </View>
      </TouchableOpacity>

      {editing ? (
        <View style={styles.editorRow}>
          <TextInput
            value={inputValue}
            onChangeText={onChangeInput}
            keyboardType="number-pad"
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                fontFamily: theme.typography.fontFamily.body,
              },
            ]}
          />
          <TouchableOpacity
            onPress={onSave}
            activeOpacity={0.8}
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: theme.colors.primaryText, fontFamily: theme.typography.fontFamily.bodyBold },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function AchievementRow({
  theme,
  icon,
  title,
  description,
  earned,
}: {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  earned: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        styles.achievementCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: earned ? `${theme.colors.primary}22` : `${theme.colors.border}88` },
        ]}
      >
        <Ionicons name={icon} size={22} color={earned ? theme.colors.primary : theme.colors.textTertiary} />
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.achTitle,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.achDescription,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
          ]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
      <Ionicons
        name={earned ? 'checkmark-circle' : 'lock-closed-outline'}
        size={20}
        color={earned ? theme.colors.success : theme.colors.textTertiary}
      />
    </View>
  );
}

export function GoalsScreen(_props: Props) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const goals = useHabitStore((state) => state.goals);
  const setGoal = useHabitStore((state) => state.setGoal);

  const [editingPeriod, setEditingPeriod] = useState<GoalPeriod | null>(null);
  const [inputValue, setInputValue] = useState('');

  const progress = useMemo(
    () => ({
      weekly: countCompletionsInWindow(habits, GOAL_WINDOWS.weekly),
      monthly: countCompletionsInWindow(habits, GOAL_WINDOWS.monthly),
      yearly: countCompletionsInWindow(habits, GOAL_WINDOWS.yearly),
    }),
    [habits]
  );

  const bestStreak = useMemo(() => bestStreakAcrossHabits(habits), [habits]);
  const earlyBird = useMemo(() => hasEarlyBirdCompletion(habits), [habits]);

  const openEditor = (period: GoalPeriod) => {
    if (editingPeriod === period) {
      setEditingPeriod(null);
      return;
    }
    setEditingPeriod(period);
    setInputValue(String(goals[period]));
  };

  const saveGoal = (period: GoalPeriod) => {
    const parsed = Math.round(Number(inputValue));
    if (Number.isFinite(parsed) && parsed > 0) {
      setGoal(period, parsed);
    }
    setEditingPeriod(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
          ]}
        >
          Goals
        </Text>
        {GOAL_ORDER.map((period) => (
          <GoalCard
            key={period}
            theme={theme}
            label={GOAL_LABELS[period]}
            current={progress[period]}
            target={goals[period]}
            editing={editingPeriod === period}
            onPress={() => openEditor(period)}
            inputValue={inputValue}
            onChangeInput={setInputValue}
            onSave={() => saveGoal(period)}
          />
        ))}

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
          ]}
        >
          Achievements
        </Text>
        <AchievementRow
          theme={theme}
          icon="flame"
          title="7 Day Streak"
          description="Complete a habit 7 days in a row"
          earned={bestStreak >= 7}
        />
        <AchievementRow
          theme={theme}
          icon="trophy"
          title="30 Day Streak"
          description="Complete a habit 30 days in a row"
          earned={bestStreak >= 30}
        />
        <AchievementRow
          theme={theme}
          icon="sunny"
          title="Early Bird"
          description="Complete a habit before 8 AM"
          earned={earlyBird}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalLabel: {
    fontSize: 15,
  },
  goalValue: {
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 14,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  achTitle: {
    fontSize: 15,
  },
  achDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
