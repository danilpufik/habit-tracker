import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

// Static placeholder copy -- HabitTracker has no backend and sends nothing
// off-device today, but this should be reviewed and replaced with real legal
// copy before shipping to an app store.
const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'What we collect',
    body: "HabitTracker doesn't collect any personal information. Every habit, streak, and setting you create is stored only on this device.",
  },
  {
    heading: 'Local storage',
    body: 'Your habits and preferences are saved to on-device storage so they persist between app launches. Using Export Data or Backup in Settings creates a copy you control; nothing is uploaded automatically.',
  },
  {
    heading: 'Notifications',
    body: 'If you enable habit reminders, HabitTracker schedules local notifications on this device. No reminder content is sent to us or to any third party.',
  },
  {
    heading: 'Third parties',
    body: "HabitTracker doesn't share data with third parties, because it doesn't send data anywhere in the first place.",
  },
  {
    heading: 'Contact',
    body: 'Questions about this policy can be sent to the address listed on the app store page.',
  },
];

export function PrivacyPolicyScreen(_props: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.updated,
            { color: theme.colors.textTertiary, fontFamily: theme.typography.fontFamily.body },
          ]}
        >
          Last updated: placeholder
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text
              style={[
                styles.heading,
                { color: theme.colors.text, fontFamily: theme.typography.fontFamily.display },
              ]}
            >
              {section.heading}
            </Text>
            <Text
              style={[
                styles.body,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.body },
              ]}
            >
              {section.body}
            </Text>
          </View>
        ))}
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
  updated: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 17,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
