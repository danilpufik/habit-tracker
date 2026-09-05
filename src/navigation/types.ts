import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Today: undefined;
  Stats: undefined;
  // Not a real screen -- its tabBarButton is fully overridden by a raised
  // center "+" button that redirects to the root stack's AddEditHabit modal
  // (see MainTabs.tsx). Registered here only so Tab.Screen/tabBarIcon typing
  // stays exhaustive.
  AddAction: undefined;
  Habits: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AddEditHabit: { habitId?: string } | undefined;
  HabitDetails: { habitId: string };
  Calendar: undefined;
  Reminders: undefined;
  Goals: undefined;
  PrivacyPolicy: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
