import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { useHabitStore } from '../store';
import { habitColors } from '../theme/colors';
import { EMOJI_OPTIONS } from '../utils/constants';
import { weekdayLabel } from '../utils/date';
import { requestNotificationPermissions } from '../utils/notifications';
import { Frequency, Weekday } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditHabit'>;

const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function parseReminderTime(reminderTime: string | undefined): Date {
  const date = new Date();
  if (reminderTime) {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setHours(9, 0, 0, 0);
  }
  return date;
}

function formatReminderTime(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AddEditHabitScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const habitId = route.params?.habitId;
  const habits = useHabitStore((state) => state.habits);
  const addHabit = useHabitStore((state) => state.addHabit);
  const editHabit = useHabitStore((state) => state.editHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  const existing = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId]
  );
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(existing?.color ?? habitColors[0]);
  const [frequencyType, setFrequencyType] = useState<Frequency['type']>(
    existing?.frequency.type ?? 'daily'
  );
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(
    existing?.frequency.type === 'weekdays' ? existing.frequency.days : []
  );
  const [reminderEnabled, setReminderEnabled] = useState(!!existing?.reminderTime);
  const [reminderTime, setReminderTime] = useState(() => parseReminderTime(existing?.reminderTime));
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const canSave =
    name.trim().length > 0 &&
    (frequencyType === 'daily' || selectedDays.length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    const frequency: Frequency =
      frequencyType === 'daily'
        ? { type: 'daily' }
        : { type: 'weekdays', days: selectedDays };
    const reminderTimeInput = reminderEnabled ? formatReminderTime(reminderTime) : undefined;

    const permissionGranted = reminderEnabled ? await requestNotificationPermissions() : true;

    if (isEditing && habitId) {
      editHabit(habitId, { name: name.trim(), icon, color, frequency, reminderTime: reminderTimeInput });
    } else {
      addHabit({ name: name.trim(), icon, color, frequency, reminderTime: reminderTimeInput });
    }

    if (reminderEnabled && !permissionGranted) {
      Alert.alert(
        'Notifications disabled',
        "Your habit was saved, but the reminder won't fire until you allow notifications for this app.",
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    navigation.goBack();
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: reminderTime,
        mode: 'time',
        onValueChange: (_event, date) => {
          if (date) setReminderTime(date);
        },
      });
    } else {
      setShowIOSPicker((prev) => !prev);
    }
  };

  const handleDelete = () => {
    if (!habitId) return;
    Alert.alert('Delete habit', `Delete "${name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habitId);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Habit' : 'New Habit',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={!canSave} hitSlop={8}>
          <Text
            style={[
              styles.headerAction,
              { color: canSave ? theme.colors.primary : theme.colors.textTertiary },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, canSave, name, icon, color, frequencyType, selectedDays, reminderEnabled, reminderTime]);

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Drink water"
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>ICON</Text>
        <View style={styles.row}>
          {EMOJI_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => setIcon(emoji)}
              style={[
                styles.emojiSwatch,
                {
                  backgroundColor:
                    icon === emoji ? `${color}33` : theme.colors.surface,
                  borderColor: icon === emoji ? color : theme.colors.border,
                },
              ]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>COLOR</Text>
        <View style={styles.row}>
          {habitColors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                color === c && styles.colorSwatchSelected,
                color === c && { borderColor: theme.colors.text },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>FREQUENCY</Text>
        <View style={styles.segmented}>
          {(['daily', 'weekdays'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFrequencyType(type)}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    frequencyType === type ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: frequencyType === type ? theme.colors.primaryText : theme.colors.text,
                  fontWeight: '600',
                }}
              >
                {type === 'daily' ? 'Every day' : 'Specific days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {frequencyType === 'weekdays' ? (
          <View style={styles.row}>
            {ALL_WEEKDAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.daySwatch,
                  {
                    backgroundColor: selectedDays.includes(day)
                      ? color
                      : theme.colors.surface,
                    borderColor: selectedDays.includes(day) ? color : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedDays.includes(day) ? '#FFFFFF' : theme.colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {weekdayLabel(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>REMINDER</Text>
        <View
          style={[
            styles.reminderRow,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.reminderRowLabel, { color: theme.colors.text }]}>
            Daily reminder
          </Text>
          <Switch
            value={reminderEnabled}
            onValueChange={(value) => {
              setReminderEnabled(value);
              setShowIOSPicker(false);
            }}
            trackColor={{ false: theme.colors.border, true: color }}
          />
        </View>

        {reminderEnabled ? (
          <TouchableOpacity
            onPress={openTimePicker}
            style={[
              styles.reminderRow,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginTop: 10 },
            ]}
          >
            <Text style={[styles.reminderRowLabel, { color: theme.colors.textSecondary }]}>
              Remind me at
            </Text>
            <Text style={[styles.reminderTimeValue, { color: theme.colors.text }]}>
              {reminderTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        ) : null}

        {reminderEnabled && showIOSPicker && Platform.OS === 'ios' ? (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="spinner"
            onValueChange={(_event, date) => setReminderTime(date)}
          />
        ) : null}

        {isEditing ? (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: theme.colors.danger }]}
          >
            <Text style={{ color: theme.colors.danger, fontWeight: '600' }}>Delete Habit</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reminderRowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  reminderTimeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  emojiSwatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  emojiText: {
    fontSize: 22,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderWidth: 3,
  },
  segmented: {
    flexDirection: 'row',
    gap: 10,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  daySwatch: {
    minWidth: 46,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    marginTop: 36,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '700',
  },
});
