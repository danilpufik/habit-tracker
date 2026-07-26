import { MainTabParamList } from './types';

export type TabIconName =
  | 'checkmark-circle'
  | 'checkmark-circle-outline'
  | 'stats-chart'
  | 'stats-chart-outline'
  | 'settings'
  | 'settings-outline';

const TAB_ICONS: Record<keyof MainTabParamList, { filled: TabIconName; outline: TabIconName }> = {
  Today: { filled: 'checkmark-circle', outline: 'checkmark-circle-outline' },
  Stats: { filled: 'stats-chart', outline: 'stats-chart-outline' },
  Settings: { filled: 'settings', outline: 'settings-outline' },
};

export function getTabIconName(routeName: keyof MainTabParamList, focused: boolean): TabIconName {
  const icons = TAB_ICONS[routeName];
  return focused ? icons.filled : icons.outline;
}
