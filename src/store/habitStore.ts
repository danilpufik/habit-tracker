import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EditHabitInput, Habit, NewHabitInput } from '../types';
import { generateId } from '../utils/id';

interface HabitState {
  habits: Habit[];
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addHabit: (input: NewHabitInput) => void;
  editHabit: (id: string, input: EditHabitInput) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, dateKey: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addHabit: (input) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...input,
              id: generateId(),
              createdAt: new Date().toISOString(),
              completions: [],
            },
          ],
        })),

      editHabit: (id, input) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...input } : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      toggleCompletion: (habitId, dateKey) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            const isCompleted = habit.completions.includes(dateKey);
            return {
              ...habit,
              completions: isCompleted
                ? habit.completions.filter((d) => d !== dateKey)
                : [...habit.completions, dateKey],
            };
          }),
        })),
    }),
    {
      name: 'habit-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ habits: state.habits }),
    }
  )
);
