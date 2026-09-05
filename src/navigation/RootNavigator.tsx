import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import {
  AddEditHabitScreen,
  HabitDetailsScreen,
  CalendarScreen,
  RemindersScreen,
  GoalsScreen,
  PrivacyPolicyScreen,
} from '../screens';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily.display,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEditHabit"
        component={AddEditHabitScreen}
        options={{ presentation: 'modal', title: 'Habit' }}
      />
      <Stack.Screen
        name="HabitDetails"
        component={HabitDetailsScreen}
        options={{ title: 'Habit' }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ title: 'Reminders' }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Goals' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ presentation: 'modal', title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
}
