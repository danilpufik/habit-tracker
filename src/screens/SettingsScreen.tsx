import React, { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { Theme, useTheme } from '../theme';
import { useHabitStore } from '../store';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
} from '../utils/notifications';

const APP_VERSION = '1.0.0';

function SettingsRow({
  theme,
  label,
  labelColor,
  value,
  onPress,
  control,
  first,
}: {
  theme: Theme;
  label: string;
  labelColor?: string;
  value?: string;
  onPress?: () => void;
  control?: React.ReactNode;
  first?: boolean;
}) {
  const content = (
    <View style={[styles.row, !first && { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
      <Text
        style={[
          styles.rowLabel,
          { color: labelColor ?? theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {control ?? (
          <>
            {value ? (
              <Text
                style={[
                  styles.rowValue,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
                ]}
              >
                {value}
              </Text>
            ) : null}
            {onPress ? <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text> : null}
          </>
        )}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

export function SettingsScreen({ navigation }: MainTabScreenProps<'Settings'>) {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits);
  const firstDayOfWeek = useHabitStore((state) => state.firstDayOfWeek);
  const setFirstDayOfWeek = useHabitStore((state) => state.setFirstDayOfWeek);
  const clearAllData = useHabitStore((state) => state.clearAllData);

  const [status, setStatus] = useState<NotificationPermissionStatus | null>(null);

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
  const isDenied = status === 'denied';
  const statusLabel = isGranted ? 'Enabled' : isDenied ? 'Disabled' : 'Not set';
  const statusColor = isGranted
    ? theme.colors.success
    : isDenied
    ? theme.colors.danger
    : theme.colors.textSecondary;

  const handleExportData = async () => {
    try {
      await Share.share({
        message: JSON.stringify(habits, null, 2),
        title: 'HabitTracker Export',
      });
    } catch {
      // Share sheet dismissal/cancellation throws on some platforms -- nothing to do.
    }
  };

  const handleRestore = () => {
    Alert.alert('Coming soon', "Restoring from a backup file isn't supported yet.");
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear all data',
      "This will permanently delete every habit and its history. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive', onPress: () => clearAllData() },
      ]
    );
  };

  // NOTE: placeholder URLs -- swap for the real App Store/Play Store listing
  // and privacy-policy page before shipping.
  const handleRateApp = () => {
    void Linking.openURL('https://example.com/rate').catch(() => {});
  };
  const handlePrivacyPolicy = () => {
    void Linking.openURL('https://example.com/privacy').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
        ]}
      >
        Settings
      </Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
          ]}
        >
          PREFERENCES
        </Text>
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
          <SettingsRow
            theme={theme}
            first
            label="Habit reminders"
            value={statusLabel}
            labelColor={theme.colors.text}
            onPress={() => navigation.navigate('Reminders')}
          />
          {isDenied ? (
            <>
              <Text
                style={[
                  styles.hint,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
                ]}
              >
                Reminders won't fire until notifications are allowed for this app.
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                activeOpacity={0.8}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.primaryText, fontFamily: theme.typography.fontFamily.bodySemiBold },
                  ]}
                >
                  Open Settings
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <SettingsRow
            theme={theme}
            label="Dark Mode"
            control={
              <Switch
                value={theme.colorScheme === 'dark'}
                onValueChange={(value) => theme.setColorScheme(value ? 'dark' : 'light')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />
          <SettingsRow
            theme={theme}
            label="Start week on Monday"
            control={
              <Switch
                value={firstDayOfWeek === 'monday'}
                onValueChange={(value) => setFirstDayOfWeek(value ? 'monday' : 'sunday')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />
          <SettingsRow theme={theme} label="Language" value="English" />
        </View>

        <Text
          style={[
            styles.label,
            styles.sectionLabel,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
          ]}
        >
          DATA
        </Text>
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
          <SettingsRow theme={theme} first label="Export Data" onPress={handleExportData} />
          <SettingsRow theme={theme} label="Backup" onPress={handleExportData} />
          <SettingsRow theme={theme} label="Restore" onPress={handleRestore} />
          <SettingsRow
            theme={theme}
            label="Clear Data"
            labelColor={theme.colors.danger}
            onPress={handleClearData}
          />
        </View>

        <Text
          style={[
            styles.label,
            styles.sectionLabel,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
          ]}
        >
          ABOUT
        </Text>
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
          <SettingsRow theme={theme} first label="Rate App" onPress={handleRateApp} />
          <SettingsRow theme={theme} label="Privacy Policy" onPress={handlePrivacyPolicy} />
          <SettingsRow theme={theme} label="About HabitTracker" value={`Version ${APP_VERSION}`} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionLabel: {
    marginTop: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevron: {
    fontSize: 18,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  button: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 15,
  },
});
