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

export function SettingsScreen({ navigation }: MainTabScreenProps<'Settings'>) {
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
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontFamily: theme.typography.fontFamily.displayBold },
        ]}
      >
        Settings
      </Text>

      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.bodyBold },
          ]}
        >
          NOTIFICATIONS
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Reminders')}
            activeOpacity={0.7}
            style={styles.row}
          >
            <Text
              style={[
                styles.rowLabel,
                { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bodySemiBold },
              ]}
            >
              Habit reminders
            </Text>
            <View style={styles.rowRight}>
              <Text
                style={[
                  styles.rowValue,
                  { color: statusColor, fontFamily: theme.typography.fontFamily.bodyBold },
                ]}
              >
                {statusLabel}
              </Text>
              <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
            </View>
          </TouchableOpacity>

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
    letterSpacing: 0.5,
    marginBottom: 8,
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
