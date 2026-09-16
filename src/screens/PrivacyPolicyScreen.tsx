import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'What we collect',
    body: 'Nothing. HabitTracker does not collect, transmit, or share any personal data. There are no user accounts, no analytics, and no third-party tracking of any kind.',
  },
  {
    heading: 'Where your data lives',
    body: 'Every habit, completion, goal, and setting you create is stored locally on your device. It never leaves your device unless you take an action that explicitly sends it somewhere.',
  },
  {
    heading: 'Export, Backup, and Restore',
    body: "Export and Backup hand your data to your device's own share sheet — you choose exactly where it goes. Restore only reads a file you actively select; HabitTracker never accesses your files without that action.",
  },
  {
    heading: 'Notifications',
    body: 'If you turn on reminders for a habit, HabitTracker asks your device for permission to schedule local notifications. These are generated and delivered entirely on your device — no reminder data is sent to any server.',
  },
  {
    heading: "Children's privacy",
    body: 'HabitTracker does not knowingly collect data from anyone, including children, because it does not collect data at all.',
  },
  {
    heading: 'Changes to this policy',
    body: 'If this ever changes — for example, if a future version adds optional cloud sync — this page will be updated and the date above will change.',
  },
  {
    heading: 'Contact',
    body: 'Questions about this policy can be sent to dkolesnik569@gmail.com.',
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
          Last updated: September 16, 2026
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
