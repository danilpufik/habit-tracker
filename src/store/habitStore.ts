import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EditHabitInput, GoalPeriod, Goals, Habit, NewHabitInput } from '../types';
import { generateId } from '../utils/id';
import { todayKey as computeTodayKey } from '../utils/date';
import { cancelHabitReminder, syncHabitReminder } from '../utils/notifications';

interface HabitState {
  habits: Habit[];
  hasHydrated: boolean;
  // Single source of truth for "today" across every screen. Recomputed via
  // `refreshToday`, called from an AppState listener when the app comes back
  // to the foreground -- otherwise a habit list left open across midnight
  // keeps showing the previous day, since nothing else triggers a re-render.
  todayKey: string;
  goals: Goals;
  themeMode: 'light' | 'dark';
  // Preference only -- not yet wired into MonthHeatmap/WeekStrip/CalendarScreen,
  // which are still hardcoded Monday-start. A future stage can read this to
  // actually shift those grids.
  firstDayOfWeek: 'sunday' | 'monday';
  setHasHydrated: (hasHydrated: boolean) => void;
  refreshToday: () => void;
  addHabit: (input: NewHabitInput) => void;
  editHabit: (id: string, input: EditHabitInput) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, dateKey: string) => void;
  setGoal: (period: GoalPeriod, value: number) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setFirstDayOfWeek: (day: 'sunday' | 'monday') => void;
  clearAllData: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      hasHydrated: false,
      todayKey: computeTodayKey(),
      goals: { weekly: 30, monthly: 120, yearly: 1000 },
      themeMode: 'dark',
      firstDayOfWeek: 'monday',
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      refreshToday: () => {
        const next = computeTodayKey();
        if (next !== get().todayKey) set({ todayKey: next });
      },

      addHabit: (input) => {
        const newHabit: Habit = {
          ...input,
          id: generateId(),
          createdAt: new Date().toISOString(),
          completions: [],
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        void syncHabitReminder(newHabit).catch(() => {});
      },

      editHabit: (id, input) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...input } : habit
          ),
        }));
        const updated = get().habits.find((habit) => habit.id === id);
        if (updated) {
          void syncHabitReminder(updated).catch(() => {});
        }
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
        void cancelHabitReminder(id).catch(() => {});
      },

      toggleCompletion: (habitId, dateKey) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            const isCompleted = habit.completions.includes(dateKey);
            const timestamps = habit.completionTimestamps ?? {};
            return {
              ...habit,
              completions: isCompleted
                ? habit.completions.filter((d) => d !== dateKey)
                : [...habit.completions, dateKey],
              completionTimestamps: isCompleted
                ? Object.fromEntries(Object.entries(timestamps).filter(([key]) => key !== dateKey))
                : { ...timestamps, [dateKey]: new Date().toISOString() },
            };
          }),
        })),

      setGoal: (period, value) =>
        set((state) => ({
          goals: { ...state.goals, [period]: value },
        })),

      setThemeMode: (mode) => set({ themeMode: mode }),

      setFirstDayOfWeek: (day) => set({ firstDayOfWeek: day }),

      clearAllData: () => {
        const ids = get().habits.map((habit) => habit.id);
        set({ habits: [] });
        ids.forEach((id) => {
          void cancelHabitReminder(id).catch(() => {});
        });
      },
    }),
    {
      name: 'habit-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        habits: state.habits,
        goals: state.goals,
        themeMode: state.themeMode,
        firstDayOfWeek: state.firstDayOfWeek,
      }),
    }
  )
);
