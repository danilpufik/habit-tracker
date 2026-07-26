import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useHabitStore } from '../store';

/**
 * Keeps the store's `todayKey` in sync with the wall clock. Without this, a
 * habit list left open across midnight keeps showing the previous day, since
 * no state change would otherwise trigger a re-render.
 */
export function useTodayRefresh(): void {
  useEffect(() => {
    const refresh = () => useHabitStore.getState().refreshToday();
    refresh();

    const handleChange = (state: AppStateStatus) => {
      if (state === 'active') refresh();
    };
    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);
}
