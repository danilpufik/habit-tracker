import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import { EmptyState } from '../components';

export function SettingsScreen(_props: MainTabScreenProps<'Settings'>) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <EmptyState
        icon="⚙️"
        title="Coming soon"
        subtitle="Notifications and app preferences will live here."
      />
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
  },
});
