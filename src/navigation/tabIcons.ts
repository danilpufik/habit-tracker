import { MainTabParamList } from './types';

export type TabIconName =
  | 'checkmark-circle'
  | 'checkmark-circle-outline'
  | 'stats-chart'
  | 'stats-chart-outline'
  | 'list'
  | 'list-outline'
  | 'settings'
  | 'settings-outline'
  | 'add-circle'
  | 'add-circle-outline';

const TAB_ICONS: Record<keyof MainTabParamList, { filled: TabIconName; outline: TabIconName }> = {
  Today: { filled: 'checkmark-circle', outline: 'checkmark-circle-outline' },
  Stats: { filled: 'stats-chart', outline: 'stats-chart-outline' },
  // Unused in practice -- AddAction's tabBarButton is fully overridden by a
  // custom raised button (see MainTabs.tsx), so its tabBarIcon never renders.
  // Kept here only so this lookup stays exhaustive over MainTabParamList.
  AddAction: { filled: 'add-circle', outline: 'add-circle-outline' },
  Habits: { filled: 'list', outline: 'list-outline' },
  Settings: { filled: 'settings', outline: 'settings-outline' },
};

export function getTabIconName(routeName: keyof MainTabParamList, focused: boolean): TabIconName {
  const icons = TAB_ICONS[routeName];
  return focused ? icons.filled : icons.outline;
}
