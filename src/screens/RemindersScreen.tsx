import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import { EmptyState } from '../components';
import { Habit } from '../types';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
  requestNotificationPermissions,
} from '../utils/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>;

function formatReminderTimeLabel(reminderTime: string): string {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function ReminderRow({
  habit,
  theme,
  onPress,
  onToggleOff,
}: {
  habit: Habit;
  theme: Theme;
  onPress: () => void;
  onToggleOff: () => void;
}) {
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
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.pressArea}>
        <View style={[styles.iconWrap, { backgroundColor: `${habit.color}22` }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.time,
              { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
            ]}
          >
            {formatReminderTimeLabel(habit.reminderTime!)}
          </Text>
          <Text
            style={[
              styles.name,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
        </View>
      </TouchableOpacity>

      <Switch
        value={true}
        onValueChange={onToggleOff}
        trackColor={{ false: theme.colors.border, true: habit.color }}
      />
    </View>
  );
}

export function RemindersScreen({ navigation }: Props) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const editHabit = useHabitStore((state) => state.editHabit);

  const [status, setStatus] = useState<NotificationPermissionStatus | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getNotificationPermissionStatus().then((result) => {
        if (!cancelled) setStatus(result);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const isGranted = status === 'granted';

  const habitsWithReminder = useMemo(() => habits.filter((h) => h.reminderTime), [habits]);
  const habitsWithoutReminder = useMemo(() => habits.filter((h) => !h.reminderTime), [habits]);

  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      const result = await getNotificationPermissionStatus();
      setStatus(result);
      if (!granted) {
        Alert.alert(
          'Enable notifications',
          "Notifications are still off, so reminders won't fire. Allow them in system Settings?",
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return;
    }

    Alert.alert(
      "Can't disable from here",
      'Apps cannot turn off their own notification permission. To stop reminders, disable notifications for this app in system Settings.',
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleAddReminder = () => {
    if (habits.length === 0) {
      navigation.navigate('AddEditHabit');
      return;
    }
    if (habitsWithoutReminder.length === 0) {
      Alert.alert('All set', 'Every habit already has a reminder.');
      return;
    }
    setPickerOpen((prev) => !prev);
  };

  const handlePickHabit = (habitId: string) => {
    setPickerOpen(false);
    navigation.navigate('AddEditHabit', { habitId });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.masterCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <Text
            style={[
              styles.masterLabel,
              { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
            ]}
          >
            Enable Reminders
          </Text>
          <Switch
            value={isGranted}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
          ]}
        >
          Your Reminders
        </Text>

        {habitsWithReminder.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No reminders yet"
            subtitle="Add a reminder to a habit and it'll show up here."
          />
        ) : (
          habitsWithReminder.map((habit) => (
            <ReminderRow
              key={habit.id}
              habit={habit}
              theme={theme}
              onPress={() => navigation.navigate('AddEditHabit', { habitId: habit.id })}
              onToggleOff={() => editHabit(habit.id, { reminderTime: undefined })}
            />
          ))
        )}

        <TouchableOpacity
          onPress={handleAddReminder}
          activeOpacity={0.8}
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.addButtonText,
              { color: theme.colors.primaryText, fontFamily: theme.typography.fontFamily.bodyBold },
            ]}
          >
            + Add Reminder
          </Text>
        </TouchableOpacity>

        {pickerOpen ? (
          <View style={styles.pickerSection}>
            <Text
              style={[
                styles.pickerLabel,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
              ]}
            >
              PICK A HABIT
            </Text>
            {habitsWithoutReminder.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                onPress={() => handlePickHabit(habit.id)}
                activeOpacity={0.7}
                style={[
                  styles.pickerRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${habit.color}22` }]}>
                  <Text style={styles.icon}>{habit.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.pickerName,
                    { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
                  ]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
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
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  masterLabel: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
  },
  time: {
    fontSize: 16,
  },
  name: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 15,
  },
  pickerSection: {
    marginTop: 20,
  },
  pickerLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  pickerName: {
    fontSize: 15,
    flex: 1,
  },
});
