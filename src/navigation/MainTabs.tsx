import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from './types';
import { TodayScreen, StatsScreen, HabitsScreen, SettingsScreen } from '../screens';
import { useTheme, Theme } from '../theme';
import { getTabIconName } from './tabIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Never actually rendered -- tabPress is intercepted below and redirected
 * to the AddEditHabit modal before React Navigation would switch to it. */
function AddActionPlaceholder() {
  return null;
}

function AddTabButton({ onPress, onLongPress, accessibilityState, testID }: BottomTabBarButtonProps) {
  const theme = useTheme();
  const styles = getAddButtonStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      accessibilityRole="button"
      accessibilityLabel="Add habit"
      accessibilityState={accessibilityState}
      testID={testID}
      style={styles.wrap}
    >
      <View style={[styles.button, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}>
        <Ionicons name="add" size={28} color={theme.colors.primaryText} />
      </View>
    </TouchableOpacity>
  );
}

function getAddButtonStyles(theme: Theme) {
  return StyleSheet.create({
    wrap: {
      top: -20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 3,
      borderColor: theme.colors.background,
    },
  });
}

export function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ focused }) => (
          <Ionicons
            name={getTabIconName(route.name, focused)}
            size={24}
            color={focused ? theme.colors.primary : theme.colors.textTertiary}
          />
        ),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen
        name="AddAction"
        component={AddActionPlaceholder}
        options={{
          tabBarButton: (props) => <AddTabButton {...props} />,
          tabBarLabel: () => null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('AddEditHabit');
          },
        })}
      />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
