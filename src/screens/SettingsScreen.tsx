import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
} from '../utils/notifications';

export function SettingsScreen(_props: MainTabScreenProps<'Settings'>) {
  const theme = useTheme();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>NOTIFICATIONS</Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              Habit reminders
            </Text>
            <Text style={[styles.rowValue, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          {isDenied ? (
            <>
              <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                Reminders won't fire until notifications are allowed for this app.
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                activeOpacity={0.8}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
                  Open Settings
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
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
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
